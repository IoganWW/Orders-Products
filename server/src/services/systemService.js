const db = require('./database');

const getProductTypes = async () => {
  return await db.getProductTypes();
};

const getCurrencies = async () => {
  return await db.getCurrencies();
};

module.exports = {
  getProductTypes,
  getCurrencies
};
