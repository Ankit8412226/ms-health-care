const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
}, { _id: false });

const orderAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  flat: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (val) => val.length > 0,
        'Order must contain at least one item',
      ],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    address: {
      type: orderAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    paymentDetails: {
      transactionId: { type: String },
      paidAt: { type: Date },
    },
    status: {
      type: String,
      enum: ['Placed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    // ── Shiprocket shipping fields ──────────────────────────────────────
    shiprocketOrderId: { type: String },
    shiprocketShipmentId: { type: String },
    awbCode: { type: String },
    courierName: { type: String },
    trackingUrl: { type: String },
    prescriptionUrl: {
      type: String,
      trim: true,
    },
    prescriptionStatus: {
      type: String,
      enum: ['Pending Review', 'Approved', 'Rejected'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate to auto-generate formatted order ID if not present
orderSchema.pre('validate', function (next) {
  if (!this.orderId) {
    this.orderId = `OD-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  
  // Set default prescription status if prescriptionUrl exists
  if (this.prescriptionUrl && !this.prescriptionStatus) {
    this.prescriptionStatus = 'Pending Review';
  }
  
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
