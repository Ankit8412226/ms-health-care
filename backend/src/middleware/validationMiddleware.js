const { body, validationResult } = require('express-validator');

// Error formatter and sender middleware
const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation chains
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  validateResult,
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateResult,
];

const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required'),
  body('shortDescription')
    .trim()
    .notEmpty()
    .withMessage('Product short description is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('regularPrice')
    .notEmpty()
    .withMessage('Regular price is required')
    .isFloat({ min: 0 })
    .withMessage('Regular price must be a positive number')
    .custom((value, { req }) => {
      if (parseFloat(value) < parseFloat(req.body.price)) {
        throw new Error('Regular price cannot be less than sale price');
      }
      return true;
    }),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category slug is required'),
  body('categoryName')
    .trim()
    .notEmpty()
    .withMessage('Category name is required'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required'),
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Main image URL is required')
    .isURL()
    .withMessage('Main image must be a valid URL'),
  body('manufacturer')
    .trim()
    .notEmpty()
    .withMessage('Manufacturer is required'),
  body('packSize')
    .trim()
    .notEmpty()
    .withMessage('Pack size is required'),
  body('storage')
    .trim()
    .notEmpty()
    .withMessage('Storage instructions are required'),
  body('howToUse')
    .trim()
    .notEmpty()
    .withMessage('How to use instructions are required'),
  body('benefits')
    .trim()
    .notEmpty()
    .withMessage('Benefits details are required'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array of objects'),
  body('images.*.id')
    .optional()
    .isNumeric()
    .withMessage('Image ID must be a number'),
  body('images.*.src')
    .optional()
    .isURL()
    .withMessage('Image source must be a valid URL'),
  body('images.*.thumbnail')
    .optional()
    .isURL()
    .withMessage('Image thumbnail must be a valid URL'),
  body('salt')
    .optional()
    .trim(),
  body('dosage')
    .optional()
    .trim(),
  body('prescriptionRequired')
    .optional()
    .isBoolean()
    .withMessage('prescriptionRequired must be a boolean value'),
  body('sideEffects')
    .optional()
    .isArray()
    .withMessage('Side effects must be an array of strings'),
  validateResult,
];

const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required'),
  body('icon')
    .optional()
    .trim(),
  validateResult,
];

const addressValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('flat')
    .trim()
    .notEmpty()
    .withMessage('Flat/House details are required'),
  body('area')
    .trim()
    .notEmpty()
    .withMessage('Area/Street details are required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('pincode')
    .trim()
    .notEmpty()
    .withMessage('Pincode is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Pincode must be a 6-digit number')
    .isNumeric()
    .withMessage('Pincode must contain numbers only'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
  validateResult,
];

const orderValidation = [
  body('addressId')
    .trim()
    .notEmpty()
    .withMessage('Address ID is required')
    .isMongoId()
    .withMessage('Address ID must be a valid database ID'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.productId')
    .trim()
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Product ID must be a valid database ID'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required'),
  body('prescriptionUrl')
    .optional()
    .trim(),
  validateResult,
];

const prescriptionValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Prescription description name is required'),
  body('url')
    .trim()
    .notEmpty()
    .withMessage('Prescription URL is required'),
  validateResult,
];

const newsletterValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  validateResult,
];

module.exports = {
  registerValidation,
  loginValidation,
  productValidation,
  categoryValidation,
  addressValidation,
  orderValidation,
  prescriptionValidation,
  newsletterValidation,
};
