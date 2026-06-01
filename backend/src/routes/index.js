const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const addressRoutes = require('./addressRoutes');
const orderRoutes = require('./orderRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');
const newsletterRoutes = require('./newsletterRoutes');
const reviewRoutes = require('./reviewRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/addresses', addressRoutes);
router.use('/orders', orderRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/newsletters', newsletterRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;
