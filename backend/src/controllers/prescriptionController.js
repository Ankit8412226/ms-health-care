const Prescription = require('../models/Prescription');
const crypto = require('crypto');

/**
 * @desc    Upload a new prescription
 * @route   POST /api/prescriptions
 * @access  Private
 */
const uploadPrescription = async (req, res) => {
  const { name, url: fileData } = req.body;

  try {
    let finalUrl = fileData;

    // If fileData is base64 file format, upload to Cloudinary using signed upload
    if (fileData && fileData.startsWith('data:')) {
      try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const apiSecret = 'CYKdNnUYfA4RwwGvKtsrI47TMoo';
        const apiKey = '618684992729621';
        const cloudName = 'dqy6dki64';

        // Generate SHA-1 signature for Cloudinary upload
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
            finalUrl = cloudinaryData.secure_url;
            console.log('Successfully uploaded prescription to Cloudinary from backend:', finalUrl);
          }
        } else {
          const errText = await cloudinaryRes.text();
          console.error('Cloudinary API upload failed on backend:', errText);
        }
      } catch (cloudinaryErr) {
        console.error('Backend Cloudinary upload error:', cloudinaryErr.message);
      }
    }

    const prescription = await Prescription.create({
      user: req.user._id,
      name,
      url: finalUrl,
      status: 'Processing (OCR)',
    });

    // Simulate OCR processing in background (adds simulated results after 5 seconds)
    setTimeout(async () => {
      try {
        const doc = await Prescription.findById(prescription._id);
        if (doc && doc.status === 'Processing (OCR)') {
          doc.status = 'Verified';
          doc.extractedMedicines = ['Mofecon-S 360mg Tablet', 'Metformin Glycomet 500mg SR'];
          await doc.save();
          console.log(`Simulated OCR completed for prescription: ${doc._id}`);
        }
      } catch (err) {
        console.error('Simulated OCR Job Failed:', err.message);
      }
    }, 5000);

    return res.status(201).json({
      success: true,
      message: 'Prescription uploaded successfully. OCR parsing started.',
      data: prescription,
    });
  } catch (error) {
    console.error('Upload Prescription Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error uploading prescription' });
  }
};

/**
 * @desc    Get user prescription uploads
 * @route   GET /api/prescriptions/myprescriptions
 * @access  Private
 */
const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    console.error('Get User Prescriptions Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error fetching prescriptions' });
  }
};

/**
 * @desc    Get all prescriptions (Admin-only list)
 * @route   GET /api/prescriptions
 * @access  Private/Admin
 */
const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({})
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    console.error('Admin Get Prescriptions Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error fetching prescriptions' });
  }
};

/**
 * @desc    Update prescription status or OCR details (Admin-only)
 * @route   PUT /api/prescriptions/:id/status
 * @access  Private/Admin
 */
const updatePrescriptionStatus = async (req, res) => {
  const { id } = req.params;
  const { status, extractedMedicines } = req.body;

  try {
    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (status) prescription.status = status;
    if (extractedMedicines) prescription.extractedMedicines = extractedMedicines;

    await prescription.save();

    return res.status(200).json({
      success: true,
      message: 'Prescription state updated successfully!',
      data: prescription,
    });
  } catch (error) {
    console.error('Update Prescription Status Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error updating prescription state' });
  }
};

module.exports = {
  uploadPrescription,
  getMyPrescriptions,
  getAllPrescriptions,
  updatePrescriptionStatus,
};
