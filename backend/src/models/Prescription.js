const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a file name or description'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Please provide the prescription image/file URL'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Processing (OCR)', 'Verified', 'Rejected'],
      default: 'Processing (OCR)',
    },
    extractedMedicines: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
