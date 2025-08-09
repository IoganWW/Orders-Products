// server/src/services/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    // Создание пула соединений для лучшей производительности
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'orders_products',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });
  }

  // Базовые методы для запросов
  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async close() {
    await this.pool.end();
  }

  // Проверка подключения к БД
  async testConnection() {
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ MySQL connected successfully');
      connection.release();
      return true;
    } catch (error) {
      console.error('❌ MySQL connection failed:', error.message);
      return false;
    }
  }

  // ================== SESSIONS ==================

  // Добавить активную сессию
  async addActiveSession(sessionId, userId = null, ipAddress = null, userAgent = null) {
    try {
      const [result] = await this.pool.execute(
        `INSERT INTO user_sessions (session_id, user_id, ip_address, user_agent, is_active) 
         VALUES (?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE 
         updated_at = CURRENT_TIMESTAMP, is_active = 1`,
        [sessionId, userId, ipAddress, userAgent]
      );
      return result;
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  }

  // Удалить активную сессию
  async removeActiveSession(sessionId) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE user_sessions SET is_active = 0 WHERE session_id = ?',
        [sessionId]
      );
      return result;
    } catch (error) {
      console.error('Error removing session:', error);
      throw error;
    }
  }

  // Получить количество активных сессий
  async getActiveSessionsCount() {
    try {
      const [rows] = await this.pool.execute(
        'SELECT COUNT(*) as count FROM user_sessions WHERE is_active = 1'
      );
      return rows[0].count;
    } catch (error) {
      console.error('Error getting sessions count:', error);
      throw error;
    }
  }

  // Очистить старые сессии
  async cleanupOldSessions(minutesOld = 30) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE user_sessions SET is_active = 0 WHERE updated_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)',
        [minutesOld]
      );
      if (result.affectedRows > 0) {
        console.log(`🧹 Cleaned up ${result.affectedRows} old sessions`);
      }
      return result;
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      throw error;
    }
  }

  // ================== ORDERS ==================

  // Получить все заказы с продуктами
  async getAllOrders() {
    try {
      // Получаем заказы
      const [orders] = await this.pool.execute(`
        SELECT id, title, description, date, created_at, updated_at 
        FROM orders 
        ORDER BY date DESC
      `);

      // Для каждого заказа получаем его продукты
      for (let order of orders) {
        const products = await this.getProductsByOrderId(order.id);
        order.products = products;
      }

      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Получить заказ по ID с продуктами
  async getOrderById(orderId) {
    try {
      const [orders] = await this.pool.execute(
        'SELECT id, title, description, date, created_at, updated_at FROM orders WHERE id = ?',
        [orderId]
      );

      if (orders.length === 0) {
        return null;
      }

      const order = orders[0];
      order.products = await this.getProductsByOrderId(orderId);
      
      return order;
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error;
    }
  }

  // Создать новый заказ
  async createOrder({ title, description, date }) {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO orders (title, description, date) VALUES (?, ?, ?)',
        [title, description, date]
      );

      // Возвращаем созданный заказ
      return await this.getOrderById(result.insertId);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Удалить заказ (продукты удалятся автоматически через CASCADE)
  async deleteOrder(orderId) {
    try {
      const [result] = await this.pool.execute(
        'DELETE FROM orders WHERE id = ?',
        [orderId]
      );
      return result;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // ================== PRODUCTS ==================

  // Получить продукты заказа с ценами
  async getProductsByOrderId(orderId) {
    try {
      const [products] = await this.pool.execute(`
        SELECT 
          p.id,
          p.serial_number as serialNumber,
          p.is_new as isNew,
          p.photo,
          p.title,
          p.type,
          p.specification,
          p.guarantee_start,
          p.guarantee_end,
          p.order_id as \`order\`,
          p.date,
          p.created_at,
          p.updated_at
        FROM products p
        WHERE p.order_id = ?
        ORDER BY p.created_at DESC
      `, [orderId]);

      // Для каждого продукта получаем цены
      for (let product of products) {
        product.guarantee = {
          start: product.guarantee_start,
          end: product.guarantee_end
        };
        delete product.guarantee_start;
        delete product.guarantee_end;

        const prices = await this.getProductPrices(product.id);
        product.price = prices;
      }

      return products;
    } catch (error) {
      console.error('Error fetching products by order ID:', error);
      throw error;
    }
  }

  // Получить все продукты
  async getAllProducts() {
    try {
      const [products] = await this.pool.execute(`
        SELECT 
          p.id,
          p.serial_number as serialNumber,
          p.is_new as isNew,
          p.photo,
          p.title,
          p.type,
          p.specification,
          p.guarantee_start,
          p.guarantee_end,
          p.order_id as \`order\`,
          p.date,
          p.created_at,
          p.updated_at
        FROM products p
        ORDER BY p.created_at DESC
      `);

      // Для каждого продукта получаем цены
      for (let product of products) {
        product.guarantee = {
          start: product.guarantee_start,
          end: product.guarantee_end
        };
        delete product.guarantee_start;
        delete product.guarantee_end;

        const prices = await this.getProductPrices(product.id);
        product.price = prices;
      }

      return products;
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  }

  // Получить продукт по ID
  async getProductById(productId) {
    try {
      const [products] = await this.pool.execute(`
        SELECT 
          p.id,
          p.serial_number as serialNumber,
          p.is_new as isNew,
          p.photo,
          p.title,
          p.type,
          p.specification,
          p.guarantee_start,
          p.guarantee_end,
          p.order_id as \`order\`,
          p.date
        FROM products p
        WHERE p.id = ?
      `, [productId]);

      if (products.length === 0) {
        return null;
      }

      const product = products[0];
      product.guarantee = {
        start: product.guarantee_start,
        end: product.guarantee_end
      };
      delete product.guarantee_start;
      delete product.guarantee_end;

      product.price = await this.getProductPrices(product.id);
      
      return product;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  // Создать новый продукт
  async createProduct(productData) {
    return await this.transaction(async (connection) => {
      // Создаем продукт
      const [result] = await connection.execute(`
        INSERT INTO products 
        (serial_number, is_new, photo, title, type, specification, guarantee_start, guarantee_end, order_id, date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        productData.serialNumber,
        productData.isNew,
        productData.photo,
        productData.title,
        productData.type,
        productData.specification,
        productData.guarantee.start,
        productData.guarantee.end,
        productData.order,
        productData.date
      ]);

      const productId = result.insertId;

      // Добавляем цены
      if (productData.price && Array.isArray(productData.price)) {
        for (let priceData of productData.price) {
          await connection.execute(
            'INSERT INTO product_prices (product_id, value, symbol, is_default) VALUES (?, ?, ?, ?)',
            [productId, priceData.value, priceData.symbol, priceData.isDefault]
          );
        }
      }

      // Возвращаем созданный продукт
      return await this.getProductById(productId);
    });
  }

  // Удалить продукт (цены удалятся автоматически через CASCADE)
  async deleteProduct(productId) {
    try {
      const [result] = await this.pool.execute(
        'DELETE FROM products WHERE id = ?',
        [productId]
      );
      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // ================== USERS ==================

  // Получить пользователя по email
  async getUserByEmail(email) {
    try {
      const [users] = await this.pool.execute(
        'SELECT id, name, email, password, role, created_at FROM users WHERE email = ?',
        [email]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  // Получить пользователя по ID
  async getUserById(userId) {
    try {
      const [users] = await this.pool.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [userId]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  // Создать нового пользователя
  async createUser({ name, email, password, role = 'user' }) {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, role]
      );
      return await this.getUserById(result.insertId);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // ================== HELPERS ==================

  // Получить цены продукта
  async getProductPrices(productId) {
    try {
      const [prices] = await this.pool.execute(`
        SELECT 
          pp.value,
          pp.symbol,
          pp.is_default as isDefault
        FROM product_prices pp
        WHERE pp.product_id = ?
        ORDER BY pp.is_default DESC, pp.symbol
      `, [productId]);

      return prices;
    } catch (error) {
      console.error('Error fetching product prices:', error);
      throw error;
    }
  }

  // Получить все типы продуктов (из ENUM)
  async getProductTypes() {
    try {
      const [result] = await this.pool.execute(`
        SHOW COLUMNS FROM products LIKE 'type'
      `);
      
      if (result.length > 0) {
        const enumString = result[0].Type;
        // Извлекаем значения из enum('value1','value2',...)
        const matches = enumString.match(/enum\((.+)\)/i);
        if (matches) {
          const values = matches[1].split(',').map(val => 
            val.replace(/'/g, '').trim()
          );
          return values.map((name, index) => ({ id: index + 1, name }));
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching product types:', error);
      throw error;
    }
  }

  // Получить все валюты (статический список)
  async getCurrencies() {
    return [
      { id: 1, code: 'USD', symbol: 'USD', name: 'US Dollar', is_default: 0 },
      { id: 2, code: 'UAH', symbol: 'UAH', name: 'Ukrainian Hryvnia', is_default: 1 },
      { id: 3, code: 'EUR', symbol: 'EUR', name: 'Euro', is_default: 0 }
    ];
  }

  // Инициализация БД при запуске
  async initDatabase() {
    const isConnected = await this.testConnection();
    if (isConnected) {
      console.log('🗄️  Database initialized successfully');
      // Очищаем старые сессии при запуске
      await this.cleanupOldSessions(30);
    }
    return isConnected;
  }
}

// Создаем единственный экземпляр
const db = new Database();

module.exports = db;