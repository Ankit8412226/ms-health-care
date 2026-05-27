const express = require('express');
const router = express.Router();
const {
  uploadPrescription,
  getMyPrescriptions,
  getAllPrescriptions,
  updatePrescriptionStatus,
} = require('../controllers/prescriptionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { prescriptionValidation } = require('../middleware/validationMiddleware');

// Get history of logged-in user
// @route   GET /api/prescriptions/myprescriptions
router.get('/myprescriptions', protect, getMyPrescriptions);

// Upload new prescription
// @route   POST /api/prescriptions
router.post('/', protect, prescriptionValidation, uploadPrescription);

// Admin-only list of all prescriptions
// @route   GET /api/prescriptions
router.get('/', protect, adminOnly, getAllPrescriptions);

// Admin-only update status / OCR extracted medicines
// @route   PUT /api/prescriptions/:id/status
router.put('/:id/status', protect, adminOnly, updatePrescriptionStatus);

module.exports = router;
