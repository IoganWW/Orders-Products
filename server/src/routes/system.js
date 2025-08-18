const express = require('express');
const router = express.Router();

const systemController = require('../controllers/systemController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/health
router.get('/health', systemController.healthCheck);

// GET /api/product-types
router.get('/product-types', 
  authenticateToken,
  systemController.getProductTypes
);

// GET /api/currencies
router.get('/currencies', 
  authenticateToken,
  systemController.getCurrencies
);

module.exports = router;