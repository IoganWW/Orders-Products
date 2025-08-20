const usersService = require('../services/usersService');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAllUsers();
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Валидация ID
    if (!userId || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Проверяем что пользователь не пытается удалить самого себя
    if (req.user && req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Проверяем существование пользователя
    const existingUser = await usersService.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Удаляем пользователя
    const deleted = await usersService.deleteUser(userId);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUserId: userId,
        deletedUser: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email
        }
      }
    });

  } catch (error) {
    console.error('Error in deleteUser controller:', error);
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (!userId || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await usersService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getUserById
};