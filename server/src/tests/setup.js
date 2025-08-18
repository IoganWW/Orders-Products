// Настройка для тестов
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_NAME = 'orders_products_test';

// Мокаем базу данных для тестов
jest.mock('../services/database', () => ({
  initDatabase: jest.fn().mockResolvedValue(true),
  getAllOrders: jest.fn(),
  getOrderById: jest.fn(),
  createOrder: jest.fn(),
  deleteOrder: jest.fn(),
  getAllProducts: jest.fn(),
  createProduct: jest.fn(),
  deleteProduct: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserById: jest.fn(),
  createUser: jest.fn(),
  getActiveSessionsCount: jest.fn().mockResolvedValue(0),
  addActiveSession: jest.fn(),
  removeActiveSession: jest.fn(),
  cleanupOldSessions: jest.fn()
}));