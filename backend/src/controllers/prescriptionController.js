const Prescription = require('../models/Prescription');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { assertImageReference } = require('../utils/imageUrl');
const { getPagination, paginatedResponse } = require('../utils/pagination');

/**
 * @desc    Record an uploaded prescription
 * @route   POST /api/prescriptions
 * @access  Private
 *
 * The file itself is uploaded by the browser straight to Cloudinary using a
 * signature from POST /api/uploads/signature; this endpoint only stores the
 * resulting URL. Previously the client sent the whole image inline as base64,
 * which express.json() rejected at its 100 KB default — every real photo
 * failed with a 413 before any of this code ran.
 */
const uploadPrescription = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // Throws a descriptive 400 for a `data:` URI rather than persisting the blob.
  const url = assertImageReference(req.body.url, 'url');
  if (!url) throw ApiError.badRequest('A prescription file URL is required');

  const prescription = await Prescription.create({
    user: req.user._id,
    name,
    url,
    status: 'Processing (OCR)',
  });

  // NOTE: there used to be a setTimeout here that flipped the record to
  // "Verified" after 5 seconds and attached two hardcoded medicine names. That
  // was wrong twice over. On Vercel the instance is frozen once the response is
  // sent, so the callback often never ran and records stuck in
  // "Processing (OCR)" forever. Worse, when it did run it marked a real medical
  // document verified without a pharmacist ever seeing it, and attached
  // medicines the prescription may not contain. Verification is now solely the
  // admin action below.

  return res.status(201).json({
    success: true,
    message: 'Prescription uploaded successfully. Our pharmacist will review it shortly.',
    data: prescription,
  });
});

/**
 * @desc    List the signed-in user's prescriptions
 * @route   GET /api/prescriptions/myprescriptions
 * @access  Private
 */
const getMyPrescriptions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, { defaultLimit: 20 });
  const filter = { user: req.user._id };

  const [data, total] = await Promise.all([
    Prescription.find(filter).sort({ createdAt: -1, _id: 1 }).skip(skip).limit(limit).lean(),
    Prescription.countDocuments(filter),
  ]);

  return res.status(200).json(paginatedResponse({ data, total, page, limit }));
});

/**
 * @desc    List all prescriptions
 * @route   GET /api/prescriptions
 * @access  Private/Admin
 */
const getAllPrescriptions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, { defaultLimit: 20 });

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [data, total] = await Promise.all([
    Prescription.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Prescription.countDocuments(filter),
  ]);

  return res.status(200).json(paginatedResponse({ data, total, page, limit }));
});

/**
 * @desc    Update prescription status / extracted medicines
 * @route   PUT /api/prescriptions/:id/status
 * @access  Private/Admin
 */
const updatePrescriptionStatus = asyncHandler(async (req, res) => {
  const { status, extractedMedicines } = req.body;

  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) throw ApiError.notFound('Prescription not found');

  if (status !== undefined) {
    const allowed = Prescription.schema.path('status').enumValues;
    if (!allowed.includes(status)) {
      throw ApiError.badRequest(`Status must be one of: ${allowed.join(', ')}`);
    }
    prescription.status = status;
  }

  if (extractedMedicines !== undefined) {
    if (!Array.isArray(extractedMedicines)) {
      throw ApiError.badRequest('extractedMedicines must be an array of strings');
    }
    prescription.extractedMedicines = extractedMedicines.map(String);
  }

  await prescription.save();

  return res.status(200).json({
    success: true,
    message: 'Prescription updated successfully',
    data: prescription,
  });
});

module.exports = {
  uploadPrescription,
  getMyPrescriptions,
  getAllPrescriptions,
  updatePrescriptionStatus,
};
