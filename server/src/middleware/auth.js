const jwt = require('jsonwebtoken');
const db = require('../services/database');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Проверяем существование пользователя в БД
    const user = await db.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired' 
      });
    }
    
    return res.status(403).json({ 
      success: false,
      error: 'Invalid token' 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.getUserById(decoded.id);
      if (user) {
        req.user = decoded;
      }
    } catch (error) {
      // Игнорируем ошибки для optional auth
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};