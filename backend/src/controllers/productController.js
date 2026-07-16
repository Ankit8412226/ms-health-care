const Product = require('../models/Product');
const crypto = require('crypto');

// Cloudinary image upload helper
const uploadToCloudinary = async (fileData) => {
  if (fileData && fileData.startsWith('data:')) {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const apiSecret = 'CYKdNnUYfA4RwwGvKtsrI47TMoo';
      const apiKey = '618684992729621';
      const cloudName = 'dqy6dki64';

      const signature = crypto
        .createHash('sha1')
        .update(`timestamp=${timestamp}${apiSecret}`)
        .digest('hex');

      const fd = new FormData();
      fd.append('file', fileData);
      fd.append('timestamp', timestamp.toString());
      fd.append('api_key', apiKey);
      fd.append('signature', signature);

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: fd,
      });

      if (cloudinaryRes.ok) {
        const cloudinaryData = await cloudinaryRes.json();
        if (cloudinaryData.secure_url) {
          return cloudinaryData.secure_url;
        }
      } else {
        const errText = await cloudinaryRes.text();
        console.error('Cloudinary API upload failed:', errText);
      }
    } catch (cloudinaryErr) {
      console.error('Cloudinary upload error:', cloudinaryErr.message);
    }
  }
  return fileData;
};

/**
 * @desc    Get all products (with optional search and category filters)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  const { category, search, limit, page, sort } = req.query;
  const filter = {};

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { salt: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
    ];
  }

  try {
    let query = Product.find(filter);

    // Sorting
    if (sort) {
      if (sort === 'low') query = query.sort({ price: 1 });
      else if (sort === 'high') query = query.sort({ price: -1 });
      else if (sort === 'rating') query = query.sort({ rating: -1 });
      else if (sort === 'popular') query = query.sort({ reviewCount: -1 });
    }

    // Pagination
    if (limit && limit !== 'all') {
      const limitNum = parseInt(limit) || 12;
      const pageNum = parseInt(page) || 1;
      const skip = (pageNum - 1) * limitNum;

      const total = await Product.countDocuments(filter);
      const products = await query.skip(skip).limit(limitNum);

      return res.status(200).json({
        success: true,
        count: products.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: products
      });
    }

    const products = await query;
    return res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('Get Products Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error fetching products' });
  }
};

/**
 * @desc    Get single product by ID or Slug
 * @route   GET /api/products/:idOrSlug
 * @access  Public
 */
const getProductById = async (req, res) => {
  const { idOrSlug } = req.params;

  try {
    let product;
    // Check if ID format is MongoDB ObjectId, otherwise find by slug
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idOrSlug);
    } else {
      product = await Product.findOne({ slug: idOrSlug });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Get Product Detail Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error fetching product details' });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res) => {
  try {
    // Check if slug already exists (either custom or generated)
    const tempSlug = req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slugExists = await Product.findOne({ slug: tempSlug });
    if (slugExists) {
      return res.status(400).json({ success: false, message: 'A product with this name or slug already exists' });
    }

    // Process main image
    if (req.body.image) {
      req.body.image = await uploadToCloudinary(req.body.image);
    }

    // Process gallery images
    if (req.body.images && Array.isArray(req.body.images)) {
      for (let i = 0; i < req.body.images.length; i++) {
        if (req.body.images[i].src) {
          req.body.images[i].src = await uploadToCloudinary(req.body.images[i].src);
        }
        if (req.body.images[i].thumbnail) {
          req.body.images[i].thumbnail = await uploadToCloudinary(req.body.images[i].thumbnail);
        }
      }
    }

    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Create Product Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error creating product' });
  }
};

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Handle slug update check if name or slug changes
    if (req.body.slug && req.body.slug !== product.slug) {
      const slugExists = await Product.findOne({ slug: req.body.slug });
      if (slugExists) {
        return res.status(400).json({ success: false, message: 'A product with this slug already exists' });
      }
    }

    // Process main image
    if (req.body.image) {
      req.body.image = await uploadToCloudinary(req.body.image);
    }

    // Process gallery images
    if (req.body.images && Array.isArray(req.body.images)) {
      for (let i = 0; i < req.body.images.length; i++) {
        if (req.body.images[i].src) {
          req.body.images[i].src = await uploadToCloudinary(req.body.images[i].src);
        }
        if (req.body.images[i].thumbnail) {
          req.body.images[i].thumbnail = await uploadToCloudinary(req.body.images[i].thumbnail);
        }
      }
    }

    product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Update Product Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error updating product' });
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Product Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error deleting product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
