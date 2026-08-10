const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { createUploadSignature } = require('../config/cloudinary');

/**
 * Upload targets a client may request a signature for.
 *
 * Restricting this to a fixed set is what stops a caller from passing
 * `folder: '../'` or writing into an unrelated part of the Cloudinary account.
 * `adminOnly` marks targets that only an administrator may write to.
 */
const UPLOAD_TARGETS = {
  prescription: { folder: 'ms-care/prescriptions', adminOnly: false },
  product: { folder: 'ms-care/products', adminOnly: true },
  category: { folder: 'ms-care/categories', adminOnly: true },
};

/**
 * @desc    Mint a short-lived signature for a direct browser -> Cloudinary upload
 * @route   POST /api/uploads/signature
 * @access  Private (product/category targets additionally require admin)
 */
const getUploadSignature = asyncHandler(async (req, res) => {
  const type = String(req.body.type || 'prescription');
  const target = UPLOAD_TARGETS[type];

  if (!target) {
    throw ApiError.badRequest(
      `Unknown upload type '${type}'. Expected one of: ${Object.keys(UPLOAD_TARGETS).join(', ')}`
    );
  }

  if (target.adminOnly && req.user.role !== 'admin') {
    throw ApiError.forbidden(`Uploading '${type}' images requires an administrator account`);
  }

  // Prescriptions are medical records: give each user their own folder so one
  // account can never guess or overwrite another's upload path.
  const folder =
    type === 'prescription' ? `${target.folder}/${req.user._id}` : target.folder;

  // Random public_id, signed alongside the folder. The client cannot choose
  // where the asset lands, so it cannot overwrite an existing one.
  const publicId = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;

  const signature = createUploadSignature({
    folder,
    publicId,
    tags: [type, `user:${req.user._id}`],
  });

  return res.status(200).json({ success: true, data: signature });
});

module.exports = { getUploadSignature, UPLOAD_TARGETS };
