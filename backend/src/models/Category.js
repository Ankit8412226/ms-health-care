const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    icon: {
      type: String,
      default: 'LayoutGrid',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate to auto-generate slug if not present
categorySchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
