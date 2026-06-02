const Order = require('../models/Order');
const Address = require('../models/Address');
const Product = require('../models/Product');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

/**
 * @desc    Place a new order with mock payment processing
 * @route   POST /api/orders
 * @access  Private
 */
const placeOrder = async (req, res) => {
  const { addressId, items, paymentMethod, prescriptionUrl } = req.body;

  try {
    // 1. Resolve and check Address
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Delivery address not found' });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized delivery address usage' });
    }

    // 2. Fetch products and calculate pricing dynamically
    let subtotal = 0;
    let discount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }

      const itemSubtotal = product.price * item.quantity;
      const itemRegular = product.regularPrice * item.quantity;

      subtotal += itemSubtotal;
      discount += (itemRegular - itemSubtotal);

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
      });
    }

    // Delivery fee logic: Free above ₹1100, else ₹49
    const deliveryFee = subtotal > 1100 ? 0 : 49;
    const total = subtotal + deliveryFee;

    // 3. Create the order instance
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      subtotal,
      discount,
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
      paymentMethod,
      prescriptionUrl,
    });

    // 4. Mock payment execution
    if (paymentMethod === 'COD') {
      order.paymentStatus = 'Pending';
    } else {
      // Simulate successful Card/UPI transaction
      order.paymentStatus = 'Paid';
      order.paymentDetails = {
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        paidAt: new Date(),
      };
    }

    await order.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order,
    });
  } catch (error) {
    console.error('Place Order Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error occurred while placing order' });
  }
};

/**
 * @desc    Get order history for logged-in user
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price regularPrice images image brand salt')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Get User Orders Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error fetching order history' });
  }
};

/**
 * @desc    Get all orders (Admin-only list)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email phone')
      .populate('items.product', 'name price brand storage manufacturer')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Admin Get Orders Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error fetching catalog orders' });
  }
};

/**
 * @desc    Update order status or prescription status (Admin-only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus, prescriptionStatus } = req.body;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (prescriptionStatus) order.prescriptionStatus = prescriptionStatus;

    // Log payment detail timestamps if status changed to Paid
    if (paymentStatus === 'Paid' && !order.paymentDetails.paidAt) {
      order.paymentDetails = {
        transactionId: order.paymentDetails.transactionId || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        paidAt: new Date(),
      };
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order details updated successfully!',
      data: order,
    });
  } catch (error) {
    console.error('Update Order Status Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error updating order state' });
  }
};

/**
 * @desc    Create a Razorpay order
 * @route   POST /api/orders/razorpay-order
 * @access  Private
 */
const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body; // Amount in rupees

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid transaction amount' });
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const rzpOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      data: rzpOrder,
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    return res.status(500).json({ success: false, message: 'Razorpay order generation failed', error: error.message });
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/orders/razorpay-verify
 * @access  Private
 */
const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing required Razorpay parameters' });
  }

  try {
    // Hardcoded Secret used for validation
    const secret = 'I0NySzSeypRaJCFr3G5wBBY2';
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: 'Payment verified and signature matched successfully!',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.',
      });
    }
  } catch (error) {
    console.error('Razorpay Verify Signature Error:', error);
    return res.status(500).json({ success: false, message: 'Payment verification process error' });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
