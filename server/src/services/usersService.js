const db = require('./database');

const getAllUsers = async () => {
  return await db.getAllUsers();
};

module.exports = {
  getAllUsers
};