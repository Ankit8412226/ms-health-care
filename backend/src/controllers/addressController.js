const Address = require('../models/Address');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, paginatedResponse } = require('../utils/pagination');

/** Fields a client may write. `user` is set from the token, never the body. */
const WRITABLE_FIELDS = ['name', 'phone', 'flat', 'area', 'city', 'pincode', 'isDefault'];

const pickWritable = (body) => {
  const out = {};
  for (const field of WRITABLE_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
};

/**
 * Keep at most one default address per user.
 *
 * Without this, marking a second address default left two flagged, and
 * checkout picked whichever the database happened to return first.
 */
const clearOtherDefaults = (userId, exceptId) =>
  Address.updateMany(
    { user: userId, isDefault: true, ...(exceptId ? { _id: { $ne: exceptId } } : {}) },
    { $set: { isDefault: false } }
  );

/**
 * @desc    List the caller's addresses
 * @route   GET /api/addresses
 * @access  Private
 */
const getAddresses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, { defaultLimit: 50 });
  const filter = { user: req.user._id };

  const [data, total] = await Promise.all([
    Address.find(filter).sort({ isDefault: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Address.countDocuments(filter),
  ]);

  return res.status(200).json(paginatedResponse({ data, total, page, limit }));
});

/**
 * @desc    Add an address
 * @route   POST /api/addresses
 * @access  Private
 */
const addAddress = asyncHandler(async (req, res) => {
  const payload = pickWritable(req.body);

  // The first address a user saves becomes their default automatically.
  const existingCount = await Address.countDocuments({ user: req.user._id });
  if (existingCount === 0) payload.isDefault = true;

  const address = await Address.create({ ...payload, user: req.user._id });

  if (address.isDefault) await clearOtherDefaults(req.user._id, address._id);

  return res.status(201).json({ success: true, data: address });
});

/**
 * @desc    Update an address
 * @route   PUT /api/addresses/:id
 * @access  Private
 */
const updateAddress = asyncHandler(async (req, res) => {
  // Scoping the query by user makes ownership part of the lookup, so there is
  // no window between "find" and "check owner" and no way to confirm that
  // another user's address id exists.
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound('Address not found');

  Object.assign(address, pickWritable(req.body));
  await address.save();

  if (address.isDefault) await clearOtherDefaults(req.user._id, address._id);

  return res.status(200).json({ success: true, data: address });
});

/**
 * @desc    Delete an address
 * @route   DELETE /api/addresses/:id
 * @access  Private
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id }).lean();
  if (!address) throw ApiError.notFound('Address not found');

  // Promote another address so the user is never left without a default.
  if (address.isDefault) {
    const next = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    data: { id: address._id },
  });
});

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
