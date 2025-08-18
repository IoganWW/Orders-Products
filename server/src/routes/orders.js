const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody, validateParams } = require('../middleware/validation');
const { orderSchemas } = require('../utils/validators');

// GET /api/orders
router.get('/', 
  authenticateToken,
  ordersController.getAllOrders
);

// GET /api/orders/:id
router.get('/:id',
  authenticateToken,
  validateParams(orderSchemas.orderIdParams),
  ordersController.getOrderById
);

// POST /api/orders
router.post('/',
  authenticateToken,
  validateBody(orderSchemas.createOrder),
  ordersController.createOrder
);

// DELETE /api/orders/:id
router.delete('/:id',
  authenticateToken,
  validateParams(orderSchemas.orderIdParams),
  ordersController.deleteOrder
);

module.exports = router;