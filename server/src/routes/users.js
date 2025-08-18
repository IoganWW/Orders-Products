const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/users
router.get('/', 
  authenticateToken,
  usersController.getAllUsers
);

module.exports = router;
