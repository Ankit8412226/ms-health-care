const Address = require('../models/Address');

/**
 * @desc    Get all addresses for logged-in user
 * @route   GET /api/addresses
 * @access  Private
 */
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    return res.status(200).json({ success: true, count: addresses.length, data: addresses });
  } catch (error) {
    console.error('Get Addresses Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error fetching addresses' });
  }
};

/**
 * @desc    Add a new address for logged-in user
 * @route   POST /api/addresses
 * @access  Private
 */
const addAddress = async (req, res) => {
  try {
    const addressData = {
      ...req.body,
      user: req.user._id,
    };

    const address = await Address.create(addressData);
    return res.status(201).json({ success: true, data: address });
  } catch (error) {
    console.error('Add Address Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error adding address' });
  }
};

/**
 * @desc    Update address details
 * @route   PUT /api/addresses/:id
 * @access  Private
 */
const updateAddress = async (req, res) => {
  const { id } = req.params;

  try {
    let address = await Address.findById(id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Ensure user owns this address
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to address' });
    }

    address = await Address.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, data: address });
  } catch (error) {
    console.error('Update Address Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error updating address' });
  }
};

/**
 * @desc    Delete user address
 * @route   DELETE /api/addresses/:id
 * @access  Private
 */
const deleteAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const address = await Address.findById(id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Ensure user owns this address
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to address' });
    }

    await Address.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete Address Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error deleting address' });
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
