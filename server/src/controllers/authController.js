const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Проверяем существование пользователя
    const existingUser = await authService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'Пользователь с таким email уже существует' 
      });
    }

    const result = await authService.register({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password, req.ip);

    if (!result) {
      return res.status(400).json({ 
        success: false,
        error: 'Неверный email или пароль' 
      });
    }

    res.json({
      success: true,
      message: 'Успешный вход в систему',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Пользователь не найден' 
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};