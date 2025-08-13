const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  // Создание пула с retry логикой
  async createPool() {
    if (this.pool) {
      return this.pool;
    }

    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'orders_products',
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      // Важные настройки для Docker
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      // Дополнительные настройки безопасности
      multipleStatements: false,
      dateStrings: false,
      supportBigNumbers: true,
      bigNumberStrings: false
    });

    return this.pool;
  }

  // Базовые методы для запросов
  async query(sql, params = []) {
    try {
      if (!this.pool) {
        await this.createPool();
      }
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async transaction(callback) {
    if (!this.pool) {
      await this.createPool();
    }
    
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
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
    }
  }

  // Проверка подключения к БД с retry
  async testConnection(maxRetries = 10, delay = 5000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!this.pool) {
          await this.createPool();
        }
        
        const connection = await this.pool.getConnection();
        await connection.ping();
        connection.release();
        
        console.log(`✅ MySQL connected successfully (attempt ${attempt})`);
        this.isConnected = true;
        return true;
        
      } catch (error) {
        console.log(`⏳ MySQL connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);
        
        if (attempt === maxRetries) {
          console.error('❌ MySQL connection failed after all retries');
          this.isConnected = false;
          return false;
        }
        
        console.log(`⏸️ Waiting ${delay/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return false;
  }

  // ================== USERS ==================

  async getUserByEmail(email) {
    try {
      const [users] = await this.pool.execute(
        'SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = ?',
        [email]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const [users] = await this.pool.execute(
        'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

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

  async updateUser(userId, updateData) {
    try {
      const allowedFields = ['name', 'email', 'password', 'role'];
      const updates = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          updates.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(userId);

      const [result] = await this.pool.execute(
        `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.getUserById(userId);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const [result] = await this.pool.execute(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // ================== SESSIONS ==================

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

  async getActiveSessionsByUserId(userId) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT session_id, ip_address, user_agent, created_at, updated_at FROM user_sessions WHERE user_id = ? AND is_active = 1',
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw error;
    }
  }

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

  async getAllOrders() {
    try {
      const [orders] = await this.pool.execute(`
        SELECT id, title, description, date, created_at, updated_at 
        FROM orders 
        ORDER BY date DESC
      `);

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

  async createOrder({ title, description, date }) {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO orders (title, description, date) VALUES (?, ?, ?)',
        [title, description, date]
      );

      return await this.getOrderById(result.insertId);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrder(orderId, { title, description, date }) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE orders SET title = ?, description = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, description, date, orderId]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

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

  async createProduct(productData) {
    return await this.transaction(async (connection) => {
      // Проверяем уникальность серийного номера
      const [existing] = await connection.execute(
        'SELECT id FROM products WHERE serial_number = ?',
        [productData.serialNumber]
      );

      if (existing.length > 0) {
        throw new Error(`Product with serial number ${productData.serialNumber} already exists`);
      }

      const [result] = await connection.execute(`
        INSERT INTO products 
        (serial_number, is_new, photo, title, type, specification, guarantee_start, guarantee_end, order_id, date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        productData.serialNumber,
        productData.isNew,
        productData.photo || 'pathToFile.jpg',
        productData.title,
        productData.type,
        productData.specification,
        productData.guarantee.start,
        productData.guarantee.end,
        productData.order,
        productData.date
      ]);

      const productId = result.insertId;

      if (productData.price && Array.isArray(productData.price)) {
        for (let priceData of productData.price) {
          await connection.execute(
            'INSERT INTO product_prices (product_id, value, symbol, is_default) VALUES (?, ?, ?, ?)',
            [productId, priceData.value, priceData.symbol, priceData.isDefault || 0]
          );
        }
      }

      return await this.getProductById(productId);
    });
  }

  async updateProduct(productId, productData) {
    return await this.transaction(async (connection) => {
      // Проверяем существование продукта
      const [existing] = await connection.execute(
        'SELECT id FROM products WHERE id = ?',
        [productId]
      );

      if (existing.length === 0) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Если обновляется серийный номер, проверяем уникальность
      if (productData.serialNumber) {
        const [duplicate] = await connection.execute(
          'SELECT id FROM products WHERE serial_number = ? AND id != ?',
          [productData.serialNumber, productId]
        );

        if (duplicate.length > 0) {
          throw new Error(`Product with serial number ${productData.serialNumber} already exists`);
        }
      }

      // Обновляем основные данные продукта
      const updateFields = [];
      const updateValues = [];

      const allowedFields = {
        'serialNumber': 'serial_number',
        'isNew': 'is_new',
        'photo': 'photo',
        'title': 'title',
        'type': 'type',
        'specification': 'specification',
        'order': 'order_id',
        'date': 'date'
      };

      Object.keys(allowedFields).forEach(key => {
        if (productData[key] !== undefined) {
          updateFields.push(`${allowedFields[key]} = ?`);
          updateValues.push(productData[key]);
        }
      });

      if (productData.guarantee) {
        if (productData.guarantee.start) {
          updateFields.push('guarantee_start = ?');
          updateValues.push(productData.guarantee.start);
        }
        if (productData.guarantee.end) {
          updateFields.push('guarantee_end = ?');
          updateValues.push(productData.guarantee.end);
        }
      }

      if (updateFields.length > 0) {
        updateValues.push(productId);
        await connection.execute(
          `UPDATE products SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          updateValues
        );
      }

      // Обновляем цены если переданы
      if (productData.price && Array.isArray(productData.price)) {
        // Удаляем старые цены
        await connection.execute(
          'DELETE FROM product_prices WHERE product_id = ?',
          [productId]
        );

        // Добавляем новые цены
        for (let priceData of productData.price) {
          await connection.execute(
            'INSERT INTO product_prices (product_id, value, symbol, is_default) VALUES (?, ?, ?, ?)',
            [productId, priceData.value, priceData.symbol, priceData.isDefault || 0]
          );
        }
      }

      return await this.getProductById(productId);
    });
  }

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

  // ================== HELPERS ==================

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

  // ================== REFERENCE DATA ==================

  async getProductTypes() {
    try {
      // Возвращаем типы из ENUM в схеме
      const types = [
        { value: 'Monitors', label: 'Мониторы' },
        { value: 'Laptops', label: 'Ноутбуки' },
        { value: 'Keyboards', label: 'Клавиатуры' },
        { value: 'Phones', label: 'Телефоны' },
        { value: 'Tablets', label: 'Планшеты' }
      ];
      return types;
    } catch (error) {
      console.error('Error fetching product types:', error);
      throw error;
    }
  }

  async getCurrencies() {
    try {
      // Возвращаем основные валюты
      const currencies = [
        { symbol: 'USD', name: 'US Dollar' },
        { symbol: 'EUR', name: 'Euro' },
        { symbol: 'UAH', name: 'Ukrainian Hryvnia' },
        { symbol: 'RUB', name: 'Russian Ruble' }
      ];
      return currencies;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  }

  // Создать таблицу user_sessions если не существует
  async createUserSessionsTable() {
    try {
      await this.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          session_id VARCHAR(255) NOT NULL UNIQUE,
          ip_address VARCHAR(45),
          user_agent TEXT,
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_session_id (session_id),
          INDEX idx_user_id (user_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ user_sessions table created/verified');
      return true;
    } catch (error) {
      console.error('❌ Error creating user_sessions table:', error);
      return false;
    }
  }

  // Создать индексы для оптимизации
  async createOptimizationIndexes() {
    try {
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_products_type ON products(type)',
        'CREATE INDEX IF NOT EXISTS idx_products_date ON products(date)',
        'CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date)',
        'CREATE INDEX IF NOT EXISTS idx_user_sessions_updated ON user_sessions(updated_at)',
        'CREATE INDEX IF NOT EXISTS idx_product_prices_default ON product_prices(is_default)'
      ];

      for (const indexSql of indexes) {
        await this.query(indexSql);
      }

      console.log('✅ Optimization indexes created/verified');
      return true;
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      return false;
    }
  }

  // Инициализация БД при запуске с retry
  async initDatabase() {
    console.log('🔄 Initializing database connection...');
    
    const isConnected = await this.testConnection(15, 3000);
    
    if (isConnected) {
      console.log('🗄️ Database initialized successfully');
      
      // Создаем таблицу сессий если не существует
      await this.createUserSessionsTable();
      
      // Создаем индексы для оптимизации
      await this.createOptimizationIndexes();
      
      // Теперь можно безопасно очистить старые сессии
      await this.cleanupOldSessions(30);
    } else {
      console.error('💥 Database initialization failed');
    }
    
    return isConnected;
  }

  // Метод для получения статистики БД
  async getDatabaseStats() {
    try {
      const stats = {};
      
      const [orderCount] = await this.pool.execute('SELECT COUNT(*) as count FROM orders');
      stats.orders = orderCount[0].count;
      
      const [productCount] = await this.pool.execute('SELECT COUNT(*) as count FROM products');
      stats.products = productCount[0].count;
      
      const [userCount] = await this.pool.execute('SELECT COUNT(*) as count FROM users');
      stats.users = userCount[0].count;
      
      const [sessionCount] = await this.pool.execute('SELECT COUNT(*) as count FROM user_sessions WHERE is_active = 1');
      stats.activeSessions = sessionCount[0].count;
      
      return stats;
    } catch (error) {
      console.error('Error fetching database stats:', error);
      throw error;
    }
  }
}

// Создаем единственный экземпляр
const db = new Database();

module.exports = db;