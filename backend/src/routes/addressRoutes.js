const express = require('express');
const router = express.Router();
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');
const { addressValidation } = require('../middleware/validationMiddleware');

// Secure all routes in this file
router.use(protect);

// @route   GET /api/addresses
// @route   POST /api/addresses
router.route('/')
  .get(getAddresses)
  .post(addressValidation, addAddress);

// @route   PUT /api/addresses/:id
// @route   DELETE /api/addresses/:id
router.route('/:id')
  .put(addressValidation, updateAddress)
  .delete(deleteAddress);

module.exports = router;
