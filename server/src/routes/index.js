const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const ordersRoutes = require('./orders');
const productsRoutes = require('./products');
const usersRoutes = require('./users');
const systemRoutes = require('./system');

// Mount routes
router.use('/auth', authRoutes);
router.use('/orders', ordersRoutes);
router.use('/products', productsRoutes);
router.use('/users', usersRoutes);
router.use('/', systemRoutes); // health, currencies, etc.

module.exports = router;