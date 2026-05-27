const Category = require('../models/Category');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    return res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    console.error('Get Categories Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error fetching categories' });
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res) => {
  const { name, icon } = req.body;

  try {
    // Check if name already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ name, icon });
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Create Category Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error creating category' });
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await Category.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete Category Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error deleting category' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
};
