const systemService = require('../services/systemService');
const socketService = require('../services/socketService');

const healthCheck = async (req, res, next) => {
  try {
    const sessionCount = await socketService.getActiveSessionsCount();
    
    res.json({ 
      success: true,
      data: {
        status: 'OK', 
        activeSessions: sessionCount,
        timestamp: new Date().toISOString(),
        database: 'connected',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
};

const getProductTypes = async (req, res, next) => {
  try {
    const types = await systemService.getProductTypes();
    
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    next(error);
  }
};

const getCurrencies = async (req, res, next) => {
  try {
    const currencies = await systemService.getCurrencies();
    
    res.json({
      success: true,
      data: currencies
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  healthCheck,
  getProductTypes,
  getCurrencies
};
