const crypto = require('crypto');
const Order = require('../models/Order');
const Address = require('../models/Address');
const Product = require('../models/Product');
const razorpay = require('../config/razorpay');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { assertImageReference } = require('../utils/imageUrl');
const { getPagination, paginatedResponse } = require('../utils/pagination');

/**
 * Coupons, defined server-side.
 *
 * `discountPercentage` used to be taken straight from the request body and fed
 * into the total, while the codes themselves lived only in the browser. A
 * customer could POST `{"discountPercentage": 100}` and check out for the price
 * of delivery. The client may now name a code; the server decides what, if
 * anything, it is worth.
 */
const COUPONS = {
  HEALTH5: 5,
  MSCARE5: 5,
  REFILL5: 5,
};

const DELIVERY = {
  codFee: 99,
  standardFee: 49,
  freeAboveSubtotal: 1100,
};

/** Resolve a coupon code to a discount percentage. Unknown codes are worth 0. */
const resolveCoupon = (code) => {
  if (!code) return { code: '', percentage: 0 };
  const clean = String(code).toUpperCase().trim();
  const percentage = COUPONS[clean];
  if (!percentage) return { code: '', percentage: 0 };
  return { code: clean, percentage };
};

/**
 * Confirm a Razorpay payment really happened, using the signature Razorpay
 * handed to the browser.
 *
 * This is an HMAC over "orderId|paymentId" keyed with our API secret, so only
 * Razorpay can produce a value that matches — a client cannot fabricate one.
 */
const razorpaySignatureIsValid = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId || !signature) return false;
  if (!env.razorpay.configured) return false;

  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(signature), 'utf8');
  // Constant-time comparison so response timing cannot be used to forge a match.
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/**
 * @desc    Place an order
 * @route   POST /api/orders
 * @access  Private
 */
const placeOrder = asyncHandler(async (req, res) => {
  const { addressId, items, paymentMethod, prescriptionUrl, couponCode, paymentDetails } = req.body;

  // 1. The address must exist and belong to the caller.
  const address = await Address.findById(addressId).lean();
  if (!address) throw ApiError.notFound('Delivery address not found');
  if (address.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('That delivery address belongs to another account');
  }

  // 2. Price the order from the database, never from the client.
  //
  // Products are fetched with a single $in query. The previous implementation
  // awaited a findById inside a for-loop, so a 20-line cart meant 20 sequential
  // round-trips to Atlas before the order could even be written.
  const quantities = new Map();
  for (const item of items) {
    const id = String(item.productId);
    const qty = parseInt(item.quantity, 10);
    if (!Number.isFinite(qty) || qty < 1) {
      throw ApiError.badRequest(`Invalid quantity for product ${id}`);
    }
    if (qty > 100) {
      throw ApiError.badRequest(`Quantity for product ${id} exceeds the per-item maximum of 100`);
    }
    // Collapse duplicate lines for the same product into a single entry.
    quantities.set(id, (quantities.get(id) || 0) + qty);
  }

  const products = await Product.find({ _id: { $in: [...quantities.keys()] } })
    .select('_id price regularPrice prescriptionRequired name')
    .lean();

  if (products.length !== quantities.size) {
    const found = new Set(products.map((p) => String(p._id)));
    const missing = [...quantities.keys()].filter((id) => !found.has(id));
    throw ApiError.badRequest(`These products are no longer available: ${missing.join(', ')}`);
  }

  let subtotal = 0;
  let productDiscount = 0;
  let needsPrescription = false;
  const orderItems = [];

  for (const product of products) {
    const quantity = quantities.get(String(product._id));
    subtotal += product.price * quantity;
    productDiscount += (product.regularPrice - product.price) * quantity;
    if (product.prescriptionRequired) needsPrescription = true;
    orderItems.push({ product: product._id, quantity });
  }

  // 3. Prescription-only medicines may not be dispatched without a document.
  const rxUrl = assertImageReference(prescriptionUrl, 'prescriptionUrl');
  if (needsPrescription && !rxUrl) {
    throw ApiError.badRequest(
      'This order contains prescription-only medicines. Please attach a prescription before checking out.'
    );
  }

  // 4. Coupon resolved server-side.
  const coupon = resolveCoupon(couponCode);
  const couponDiscount = Math.round(subtotal * (coupon.percentage / 100));

  const isCod = String(paymentMethod).toUpperCase() === 'COD';
  const deliveryFee = isCod
    ? DELIVERY.codFee
    : (subtotal - couponDiscount) >= DELIVERY.freeAboveSubtotal ? 0 : DELIVERY.standardFee;

  const total = subtotal - couponDiscount + deliveryFee;

  const order = new Order({
    user: req.user._id,
    items: orderItems,
    subtotal,
    discount: productDiscount + couponDiscount,
    deliveryFee,
    total,
    address: {
      name: address.name,
      phone: address.phone,
      flat: address.flat,
      area: address.area,
      city: address.city,
      pincode: address.pincode,
    },
    paymentMethod: isCod ? 'COD' : 'Online',
    prescriptionUrl: rxUrl,
    couponCode: coupon.code,
    discountPercentage: coupon.percentage,
  });

  // 5. Payment status is derived, never accepted from the request.
  //
  // This used to read `req.body.paymentDetails.paymentStatus` and defaulted to
  // 'Paid' for anything that was not COD — so a caller could mark an order paid
  // without a rupee changing hands. An online order is Paid only when the
  // Razorpay signature verifies here, on the server.
  if (isCod) {
    order.paymentStatus = 'Pending';
  } else {
    const verified = razorpaySignatureIsValid({
      orderId: paymentDetails?.razorpayOrderId,
      paymentId: paymentDetails?.razorpayPaymentId,
      signature: paymentDetails?.razorpaySignature,
    });

    if (!verified) {
      throw ApiError.badRequest(
        'Payment could not be verified, so no order was created. If money has left your account, contact support with your payment reference.'
      );
    }

    order.paymentStatus = 'Paid';
    order.paymentDetails = {
      transactionId: paymentDetails.razorpayPaymentId,
      paidAt: new Date(),
    };
  }

  await order.save();

  return res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    data: order,
  });
});

/**
 * @desc    Order history for the signed-in user
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, { defaultLimit: 20 });
  const filter = { user: req.user._id };

  const [data, total] = await Promise.all([
    Order.find(filter)
      .populate('items.product', 'name price regularPrice images image brand salt')
      .sort({ createdAt: -1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return res.status(200).json(paginatedResponse({ data, total, page, limit }));
});

/**
 * @desc    All orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, { defaultLimit: 20 });

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const [data, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price regularPrice brand image prescriptionRequired storage manufacturer')
      .sort({ createdAt: -1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return res.status(200).json(paginatedResponse({ data, total, page, limit }));
});

/** Look an order up by either its customer-facing OD- code or its ObjectId. */
const findOrderByRef = (ref) =>
  String(ref).startsWith('OD-') ? Order.findOne({ orderId: ref }) : Order.findById(ref);

/**
 * @desc    Update order / payment / prescription status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus, prescriptionStatus, awbCode, courierName, trackingUrl } = req.body;

  const order = await findOrderByRef(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  // Validate against the schema's own enums, so an admin typo cannot write a
  // status the storefront has no rendering for.
  const assertEnum = (field, value) => {
    const path = Order.schema.path(field);
    if (path?.enumValues?.length && !path.enumValues.includes(value)) {
      throw ApiError.badRequest(`${field} must be one of: ${path.enumValues.join(', ')}`);
    }
  };

  if (status !== undefined) { assertEnum('status', status); order.status = status; }
  if (paymentStatus !== undefined) { assertEnum('paymentStatus', paymentStatus); order.paymentStatus = paymentStatus; }
  if (prescriptionStatus !== undefined) { assertEnum('prescriptionStatus', prescriptionStatus); order.prescriptionStatus = prescriptionStatus; }

  if (awbCode !== undefined) order.awbCode = awbCode;
  if (courierName !== undefined) order.courierName = courierName;
  if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;

  // Record a timestamp when an admin marks an unpaid order as paid.
  // The old code read order.paymentDetails.paidAt unguarded, which threw for
  // any COD order (paymentDetails is undefined until a payment is recorded)
  // and surfaced as a generic 500.
  if (paymentStatus === 'Paid' && !order.paymentDetails?.paidAt) {
    order.paymentDetails = {
      transactionId: order.paymentDetails?.transactionId || `MANUAL-${order.orderId || order._id}`,
      paidAt: new Date(),
    };
  }

  await order.save();

  return res.status(200).json({
    success: true,
    message: 'Order updated successfully',
    data: order,
  });
});

/**
 * @desc    Open a Razorpay order for the checkout widget
 * @route   POST /api/orders/razorpay-order
 * @access  Private
 */
const createRazorpayOrder = asyncHandler(async (req, res) => {
  if (!env.razorpay.configured) {
    throw ApiError.serviceUnavailable(
      'Online payment is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    );
  }

  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw ApiError.badRequest('Invalid transaction amount');
  }

  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt: `rcpt_${req.user._id}_${Date.now()}`.slice(0, 40),
  });

  return res.status(200).json({ success: true, data: rzpOrder });
});

/**
 * @desc    Verify a Razorpay signature
 * @route   POST /api/orders/razorpay-verify
 * @access  Private
 *
 * Retained so checkout can show a failure before attempting the order, but it
 * is no longer what authorises payment: placeOrder re-verifies the signature
 * itself, so a caller who skips this step gains nothing.
 */
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw ApiError.badRequest('Missing required Razorpay parameters');
  }

  const valid = razorpaySignatureIsValid({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) throw ApiError.badRequest('Invalid payment signature. Verification failed.');

  return res.status(200).json({ success: true, message: 'Payment signature verified' });
});

/**
 * @desc    Attach a prescription to an existing order
 * @route   PUT /api/orders/:id/prescription
 * @access  Private
 */
const updateOrderPrescription = asyncHandler(async (req, res) => {
  const url = assertImageReference(req.body.prescriptionUrl, 'prescriptionUrl');
  if (!url) throw ApiError.badRequest('A prescription URL is required');

  const order = await findOrderByRef(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  if (order.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("You cannot modify another account's order");
  }

  order.prescriptionUrl = url;
  order.prescriptionStatus = 'Pending Review';
  await order.save();

  return res.status(200).json({
    success: true,
    message: 'Prescription linked to order successfully',
    data: order,
  });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyRazorpayPayment,
  updateOrderPrescription,
};
