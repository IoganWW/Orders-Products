const db = require('./database');

const getAllUsers = async () => {
  return await db.getAllUsers();
};

const getUserById = async (userId) => {
  return await db.getUserById(userId);
};

const deleteUser = async (userId) => {
  return await db.deleteUser(userId);
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser
};