const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { authSchemas } = require('../utils/validators');

// POST /api/auth/register
router.post('/register', 
  validateBody(authSchemas.register),
  authController.register
);

// POST /api/auth/login
router.post('/login', 
  validateBody(authSchemas.login),
  authController.login
);

// GET /api/auth/me
router.get('/me', 
  authenticateToken,
  authController.getProfile
);

module.exports = router;