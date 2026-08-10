const mongoose = require('mongoose');
const crypto = require('crypto');

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
    couponCode: {
      type: String,
      trim: true,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate to auto-generate formatted order ID if not present
orderSchema.pre('validate', function (next) {
  if (!this.orderId) {
    // A 6-digit random number over a unique index collides sooner than it
    // looks: by the birthday bound there is a ~50% chance of at least one
    // clash within roughly 1,100 orders, and each clash surfaced as a failed
    // checkout. Seconds-since-epoch makes the value monotonic, and 4 random
    // base-36 characters separate orders placed in the same second.
    const stamp = Math.floor(Date.now() / 1000).toString(36).toUpperCase();
    const rand = crypto.randomBytes(3).toString('hex').slice(0, 4).toUpperCase();
    this.orderId = `OD-${stamp}${rand}`;
  }

  // Set default prescription status if prescriptionUrl exists
  if (this.prescriptionUrl && !this.prescriptionStatus) {
    this.prescriptionStatus = 'Pending Review';
  }
  
  next();
});

// Indexes matching how orders are actually queried. Without the compound
// index, "my orders" was a full collection scan followed by an in-memory sort
// on every dashboard load.
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
// Supports the review-eligibility check (has this user received this product?).
orderSchema.index({ user: 1, status: 1, 'items.product': 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
