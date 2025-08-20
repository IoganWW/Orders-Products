const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/users - получить всех пользователей
router.get('/', 
  authenticateToken,
  usersController.getAllUsers
);

// GET /api/users/:id - получить пользователя по ID
router.get('/:id', 
  authenticateToken,
  usersController.getUserById
);

// DELETE /api/users/:id - удалить пользователя
router.delete('/:id', 
  authenticateToken,
  usersController.deleteUser
);

module.exports = router;
