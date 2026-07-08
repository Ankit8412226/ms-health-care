const Order = require('../models/Order');
const shiprocket = require('../config/shiprocket');

// ── Seller / Pickup details (hardcoded for Onco Life India) ──────────────
const SELLER = {
  name: 'Onco Life India',
  isd_code: '91',
  phone: '9999999999',
  address: 'Main Market, Sector 5',
  address_2: '',
  city: 'Delhi',
  state: 'Delhi',
  country: 'India',
  pin_code: '110001',
  email: 'admin@oncolifeindia.com',
};


const createShipment = async (req, res) => {
  const { orderId } = req.params;

  try {
    // 1. Load order from DB — support both OD-XXXXXX friendly ID and MongoDB _id
    let order;
    if (orderId.startsWith('OD-')) {
      order = await Order.findOne({ orderId })
        .populate('items.product', 'name price regularPrice weight packSize brand');
    } else {
      order = await Order.findById(orderId)
        .populate('items.product', 'name price regularPrice weight packSize brand');
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: `Shipment already created. AWB: ${order.awbCode || 'pending'}`,
      });
    }

    // 2. Build Shiprocket order payload
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];

    const orderItems = order.items.map((item) => ({
      name: item.product?.name || 'Medicine',
      sku: item.product?._id?.toString() || 'SKU001',
      units: item.quantity,
      selling_price: item.product?.price || 0,
      discount: '',
      tax: '',
      hsn: 3004, // Standard HSN for medicines
    }));

    const payload = {
      order_id: order.orderId,
      order_date: orderDate,
      pickup_location: 'work',
      comment: 'Prescription Medicine Order',
      billing_customer_name: order.address.name,
      billing_last_name: '',
      billing_address: `${order.address.flat}, ${order.address.area}`,
      billing_address_2: '',
      billing_city: order.address.city,
      billing_pincode: order.address.pincode,
      billing_state: getStateFromCity(order.address.city),
      billing_country: 'India',
      billing_email: 'customer@oncolifeindia.com',
      billing_phone: order.address.phone,
      shipping_is_billing: true,
      shipping_customer_name: order.address.name,
      shipping_last_name: '',
      shipping_address: `${order.address.flat}, ${order.address.area}`,
      shipping_address_2: '',
      shipping_city: order.address.city,
      shipping_pincode: order.address.pincode,
      shipping_country: 'India',
      shipping_state: getStateFromCity(order.address.city),
      shipping_email: 'customer@oncolifeindia.com',
      shipping_phone: order.address.phone,
      order_items: orderItems,
      payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      shipping_charges: order.deliveryFee || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: order.discount || 0,
      sub_total: order.total,
      length: 20,
      breadth: 15,
      height: 10,
      weight: 0.5,
    };

    // 3. Call Shiprocket API
    const srResponse = await shiprocket.createShipment(payload);
    console.log('Shiprocket create shipment response:', JSON.stringify(srResponse, null, 2));

    if (srResponse.status_code && srResponse.status_code !== 1 && srResponse.status_code !== 200) {
      return res.status(422).json({
        success: false,
        message: 'Shiprocket order creation failed',
        details: srResponse,
      });
    }

    // 4. Persist Shiprocket data back to order
    order.shiprocketOrderId = srResponse.order_id ? String(srResponse.order_id) : undefined;
    order.shiprocketShipmentId = srResponse.shipment_id ? String(srResponse.shipment_id) : undefined;
    order.awbCode = srResponse.awb_code || srResponse.response?.data?.awb_code || undefined;
    order.courierName = srResponse.courier_name || srResponse.response?.data?.courier_name || undefined;
    order.trackingUrl = srResponse.awb_code
      ? `https://shiprocket.co/tracking/${srResponse.awb_code}`
      : undefined;

    // Update status to Processing since shipment is created
    order.status = 'Processing';
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Shipment created successfully!',
      data: {
        shiprocketOrderId: order.shiprocketOrderId,
        shiprocketShipmentId: order.shiprocketShipmentId,
        awbCode: order.awbCode,
        courierName: order.courierName,
        trackingUrl: order.trackingUrl,
        shiprocketRaw: srResponse,
      },
    });
  } catch (error) {
    console.error('Shiprocket Create Shipment Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create Shiprocket shipment',
      error: error.message,
    });
  }
};

/**
 * @desc    Track an order by AWB code
 * @route   GET /api/shiprocket/track/:orderId
 * @access  Private (logged-in users)
 */
const trackOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Support both MongoDB _id and orderId (OD-XXXXXX)
    let order;
    if (orderId.startsWith('OD-')) {
      order = await Order.findOne({ orderId });
    } else {
      order = await Order.findById(orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ownership check: users can only track their own orders, admin can track any
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!order.awbCode) {
      return res.status(200).json({
        success: true,
        message: 'Shipment not yet dispatched',
        data: {
          status: order.status,
          awbCode: null,
          trackingUrl: null,
          courierName: null,
          trackingData: null,
        },
      });
    }

    // Fetch live tracking from Shiprocket
    const trackingResponse = await shiprocket.trackByAwb(order.awbCode);

    // Sync status back to DB if changed
    const srStatus = trackingResponse?.tracking_data?.shipment_track?.[0]?.current_status;
    if (srStatus) {
      const mappedStatus = mapShiprocketStatus(srStatus);
      if (mappedStatus && order.status !== mappedStatus) {
        order.status = mappedStatus;
        await order.save();
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        awbCode: order.awbCode,
        courierName: order.courierName,
        trackingUrl: order.trackingUrl,
        trackingData: trackingResponse?.tracking_data || null,
      },
    });
  } catch (error) {
    console.error('Shiprocket Track Order Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking details',
      error: error.message,
    });
  }
};

/**
 * @desc    Get tracking info for the logged-in user's order (public user route)
 * @route   GET /api/shiprocket/track/my/:orderId
 * @access  Private
 */
const trackMyOrder = async (req, res) => {
  // Delegate — same logic but ownership already enforced via req.user
  return trackOrder(req, res);
};

/**
 * @desc    Cancel a Shiprocket shipment
 * @route   POST /api/shiprocket/cancel/:orderId
 * @access  Private/Admin
 */
const cancelShipment = async (req, res) => {
  const { orderId } = req.params;

  try {
    let order;
    if (orderId.startsWith('OD-')) {
      order = await Order.findOne({ orderId });
    } else {
      order = await Order.findById(orderId);
    }
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.awbCode) {
      return res.status(400).json({ success: false, message: 'No AWB found. Cannot cancel.' });
    }

    const cancelResponse = await shiprocket.cancelShipment([order.awbCode]);

    return res.status(200).json({
      success: true,
      message: 'Shipment cancellation request sent',
      data: cancelResponse,
    });
  } catch (error) {
    console.error('Shiprocket Cancel Shipment Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel Shiprocket shipment',
      error: error.message,
    });
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Map Shiprocket status strings to our Order status enum
 */
function mapShiprocketStatus(srStatus = '') {
  const s = srStatus.toLowerCase();
  if (s.includes('delivered')) return 'Delivered';
  if (s.includes('out for delivery') || s.includes('out_for_delivery')) return 'Out for Delivery';
  if (s.includes('pickup') || s.includes('in transit') || s.includes('shipped')) return 'Processing';
  return null;
}

/**
 * Naive city → state mapper for common Indian cities
 */
function getStateFromCity(city = '') {
  const map = {
    delhi: 'Delhi', 'new delhi': 'Delhi',
    mumbai: 'Maharashtra', pune: 'Maharashtra', nagpur: 'Maharashtra',
    bangalore: 'Karnataka', bengaluru: 'Karnataka',
    hyderabad: 'Telangana',
    chennai: 'Tamil Nadu',
    kolkata: 'West Bengal',
    ahmedabad: 'Gujarat', surat: 'Gujarat',
    jaipur: 'Rajasthan',
    lucknow: 'Uttar Pradesh', kanpur: 'Uttar Pradesh', noida: 'Uttar Pradesh',
    chandigarh: 'Chandigarh',
    bhopal: 'Madhya Pradesh', indore: 'Madhya Pradesh',
    patna: 'Bihar',
    kochi: 'Kerala',
    gurgaon: 'Haryana', gurugram: 'Haryana', faridabad: 'Haryana',
  };
  return map[city.toLowerCase().trim()] || 'Delhi';
}

module.exports = {
  createShipment,
  trackOrder,
  trackMyOrder,
  cancelShipment,
};
