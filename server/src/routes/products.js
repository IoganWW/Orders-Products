const express = require('express');
const router = express.Router();

const productsController = require('../controllers/productsController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody, validateParams } = require('../middleware/validation');
const { productSchemas } = require('../utils/validators');

// GET /api/products
router.get('/', 
  authenticateToken,
  productsController.getAllProducts
);

// POST /api/products
router.post('/',
  authenticateToken,
  //validateBody(productSchemas.createProduct),
  productsController.createProduct
);

// PUT /api/products/:id
router.put('/:id',
  authenticateToken,
  validateParams(productSchemas.productIdParams),
  validateBody(productSchemas.updateProduct),
  productsController.updateProduct
);

// DELETE /api/products/:id
router.delete('/:id',
  authenticateToken,
  validateParams(productSchemas.productIdParams),
  productsController.deleteProduct
);

module.exports = router;