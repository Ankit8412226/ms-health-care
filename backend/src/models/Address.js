const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide contact name for delivery'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      trim: true,
    },
    flat: {
      type: String,
      required: [true, 'Please provide flat/house number details'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Please provide area/street details'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city name'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Please provide pincode'],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// If user marks an address as default, unset other defaults of this user
addressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
