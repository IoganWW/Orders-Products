const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const register = async ({ name, email, password }) => {
  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // Создаем пользователя
  const newUser = await db.createUser({
    name,
    email,
    password: hashedPassword,
    role: 'user'
  });

  // Генерируем токен
  const token = generateToken(newUser);

  return {
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  };
};

const login = async (email, password, ipAddress) => {
  // Ищем пользователя
  const user = await db.getUserByEmail(email);
  if (!user) {
    return null;
  }

  // Проверяем пароль
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return null;
  }

  // Генерируем токен
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

const getUserById = async (id) => {
  return await db.getUserById(id);
};

const getUserByEmail = async (email) => {
  return await db.getUserByEmail(email);
};

module.exports = {
  register,
  login,
  getUserById,
  getUserByEmail
};