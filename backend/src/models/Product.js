const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const productImageSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  thumbnail: {
    type: String,
    required: true,
  },
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Please provide a product short description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product sale price'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    regularPrice: {
      type: Number,
      required: [true, 'Please provide product regular price'],
      min: [0, 'Regular price must be greater than or equal to 0'],
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category identifier slug'],
      trim: true,
    },
    categoryName: {
      type: String,
      required: [true, 'Please provide a category readable name'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Please provide a brand name'],
      trim: true,
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
    image: {
      type: String,
      required: [true, 'Please provide main image URL'],
    },
    salt: {
      type: String,
      trim: true,
    },
    dosage: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      required: [true, 'Please provide a manufacturer'],
      trim: true,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    packSize: {
      type: String,
      required: [true, 'Please provide pack size details'],
      trim: true,
    },
    storage: {
      type: String,
      required: [true, 'Please provide storage requirements'],
      trim: true,
    },
    howToUse: {
      type: String,
      required: [true, 'Please provide usage instructions'],
    },
    sideEffects: {
      type: [String],
      default: [],
    },
    benefits: {
      type: String,
      required: [true, 'Please provide benefits description'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate to auto-generate slug if not present
productSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name);
  }

  // Set onSale dynamically if price is lower than regularPrice
  if (this.price < this.regularPrice) {
    this.onSale = true;
  } else {
    this.onSale = false;
  }

  next();
});


productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ reviewCount: -1 });
productSchema.index({ name: 'text', salt: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
