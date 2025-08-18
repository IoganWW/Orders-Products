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

module.exports = {
  getAllUsers
};