const Product = require('../models/Product');

/**
 * @desc    Get all products (with optional search and category filters)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  const { category, search } = req.query;
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
    const products = await Product.find(filter);
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
