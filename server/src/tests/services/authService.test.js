const authService = require('../../services/authService');
const db = require('../../services/database');

// Мокаем bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      db.createUser.mockResolvedValue(mockUser);

      const result = await authService.register(userData);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(userData.email);
      expect(db.createUser).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        password: 'hashed-password',
        role: 'user'
      });
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'user'
      };

      db.getUserByEmail.mockResolvedValue(mockUser);

      const result = await authService.login(email, password, '127.0.0.1');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(email);
    });

    it('should return null for invalid email', async () => {
      db.getUserByEmail.mockResolvedValue(null);

      const result = await authService.login('invalid@example.com', 'password123', '127.0.0.1');

      expect(result).toBeNull();
    });
  });
});