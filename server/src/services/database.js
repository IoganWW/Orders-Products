const mysql = require("mysql2/promise");
require("dotenv").config();

class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  // Исправленный метод createPool() в server/src/services/database.js

  async createPool() {
    if (this.pool) {
      return this.pool;
    }

    try {
      let config;

      // Проверяем Railway переменные
      if (process.env.MYSQLHOST || process.env.DB_HOST) {
        //console.log("🚂 Connecting to MySQL...");

        /*console.log("🚂 Connecting to Railway MySQL...");
        console.log("🔍 MySQL config check:");
        console.log("  MYSQLHOST:", process.env.MYSQLHOST ? "✅" : "❌");
        console.log("  MYSQLUSER:", process.env.MYSQLUSER ? "✅" : "❌");
        console.log(
          "  MYSQLDATABASE:",
          process.env.MYSQLDATABASE ? "✅" : "❌"
        );*/

        config = {
          host: process.env.MYSQLHOST || process.env.DB_HOST,
          port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
          user: process.env.MYSQLUSER || process.env.DB_USER,
          password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
          database: process.env.MYSQLDATABASE || process.env.DB_NAME,
        };

        console.log("🔍 Connection config:", {
          host: config.host,
          port: config.port,
          user: config.user,
          database: config.database,
          hasPassword: !!config.password,
        });
      } else {
        console.log("🏠 Using local database connection");

        config = {
          host: process.env.DB_HOST || "localhost",
          user: process.env.DB_USER || "root",
          password: process.env.DB_PASSWORD || "",
          database: process.env.DB_NAME || "orders_products",
          port: 3306,
        };
      }

      // Создаем пул с исправленной конфигурацией
      this.pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: "utf8mb4",
        // Убираем acquireTimeout - не поддерживается в MySQL2
        // acquireTimeout: 60000,
        multipleStatements: false,
        dateStrings: false,
        supportBigNumbers: true,
        bigNumberStrings: false,
        // Для Railway MySQL
        ssl: process.env.MYSQLHOST ? { rejectUnauthorized: false } : false,
      });

      console.log("✅ MySQL pool created successfully");
      return this.pool;
    } catch (error) {
      console.error("❌ Error creating MySQL pool:", error);
      throw error;
    }
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
      console.error("Database query error:", error);
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
  async testConnection(maxRetries = 15, delay = 3000) {
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
        console.log(
          `⏳ MySQL connection attempt ${attempt}/${maxRetries} failed:`
        );
        console.log(`   Error: ${error.message}`);

        if (attempt === maxRetries) {
          console.error("❌ MySQL connection failed after all retries");
          this.isConnected = false;
          return false;
        }

        console.log(`⏸️ Waiting ${delay / 1000}s before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return false;
  }

  // Создать все необходимые таблицы для Railway
  async createTablesIfNotExist() {
    try {
      console.log("🗄️ Creating tables if not exist...");

      // Создаем таблицу users
      await this.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Создаем таблицу orders
      await this.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          date DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Создаем таблицу products
      await this.query(`
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            serial_number VARCHAR(100) NOT NULL UNIQUE,
            is_new TINYINT(1) DEFAULT 1,
            photo VARCHAR(500) DEFAULT 'pathToFile.jpg',
            title VARCHAR(255) NOT NULL,
            type ENUM('Monitors', 'Laptops', 'Keyboards', 'Phones', 'Tablets') NOT NULL,
            specification TEXT,
            guarantee_start DATETIME NOT NULL,
            guarantee_end DATETIME NOT NULL,
            order_id INT NOT NULL,
            date DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            INDEX idx_order_id (order_id),
            INDEX idx_serial_number (serial_number)
        )
      `);

      // Создаем таблицу product_prices
      await this.query(`
        CREATE TABLE IF NOT EXISTS product_prices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          value DECIMAL(10,2) NOT NULL,
          symbol VARCHAR(10) NOT NULL DEFAULT 'USD',
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `);

      // Создаем таблицу user_sessions
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

      console.log("✅ All tables created/verified successfully");
      return true;
    } catch (error) {
      console.error("❌ Error creating tables:", error);
      return false;
    }
  }

  // Добавить тестовые данные если таблицы пустые
  async seedInitialData() {
    /*try {
      // Проверяем есть ли приходы (orders)
      const [orderCount] = await this.query(
        "SELECT COUNT(*) as count FROM orders"
      );

      const count = orderCount[0]?.count || 0;
      console.log(`ℹ️ Количество приходов в базе: ${count}`);

      if (count === 0) {
        console.log("📝 Adding initial test data...");

        // Добавляем пользователей
        await this.query(`
        INSERT IGNORE INTO users (name, email, password, role) VALUES 
        ('Admin', 'admin@example.com', '$2a$10$example_hash_here', 'admin'),
        ('Test User', 'user@example.com', '$2a$10$example_hash_here', 'user')
      `);

        // Добавляем приход
        await this.query(`
        INSERT IGNORE INTO orders (title, description, date) VALUES 
        ('Тестовый приход', 'Первый тестовый приход товаров', CURDATE())
      `);

        // Добавляем продукт
        await this.query(`
        INSERT IGNORE INTO products (serial_number, title, type, specification, order_id, date) VALUES 
        ('MBP-001', 'MacBook Pro', 'Laptops', '13 inch, M1 chip', 1, CURDATE())
      `);

        // Добавляем цены
        await this.query(`
        INSERT IGNORE INTO product_prices (product_id, value, symbol, is_default) VALUES 
        (1, 1299.99, 'USD', TRUE),
        (1, 1199.99, 'EUR', FALSE)
      `);

        console.log("✅ Initial test data added");
      } else {
        console.log(
          `ℹ️ Найдены приходы: ${count}, пропускаем инициализацию данных`
        );
      }
    } catch (error) {
      console.error("❌ Error seeding initial data:", error);
    }*/
  }

  // ================== USERS ==================
  async getAllUsers() {
    try {
      const [rows] = await this.pool.execute(
        "SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC"
      );
      return rows;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const [users] = await this.pool.execute(
        "SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = ?",
        [email]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const [users] = await this.pool.execute(
        "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?",
        [userId]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }

  async createUser({ name, email, password, role = "user" }) {
    try {
      const [result] = await this.pool.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, password, role]
      );

      return await this.getUserById(result.insertId);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // ================== SESSIONS ==================
  async addActiveSession(
    sessionId,
    userId = null,
    ipAddress = null,
    userAgent = null
  ) {
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
      console.error("Error adding session:", error);
      throw error;
    }
  }

  async removeActiveSession(sessionId) {
    try {
      const [result] = await this.pool.execute(
        "UPDATE user_sessions SET is_active = 0 WHERE session_id = ?",
        [sessionId]
      );
      return result;
    } catch (error) {
      console.error("Error removing session:", error);
      throw error;
    }
  }

  async getActiveSessionsCount() {
    try {
      const [rows] = await this.pool.execute(
        "SELECT COUNT(*) as count FROM user_sessions WHERE is_active = 1"
      );
      return rows[0].count;
    } catch (error) {
      console.error("Error getting sessions count:", error);
      throw error;
    }
  }

  async cleanupOldSessions(minutesOld = 30) {
    try {
      const [result] = await this.pool.execute(
        "UPDATE user_sessions SET is_active = 0 WHERE updated_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)",
        [minutesOld]
      );
      if (result.affectedRows > 0) {
        console.log(`🧹 Cleaned up ${result.affectedRows} old sessions`);
      }
      return result;
    } catch (error) {
      console.error("Error cleaning up sessions:", error);
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
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      const [orders] = await this.pool.execute(
        "SELECT id, title, description, date, created_at, updated_at FROM orders WHERE id = ?",
        [orderId]
      );

      if (orders.length === 0) {
        return null;
      }

      const order = orders[0];
      order.products = await this.getProductsByOrderId(orderId);

      return order;
    } catch (error) {
      console.error("Error fetching order by ID:", error);
      throw error;
    }
  }

  async createOrder({ title, description, date }) {
    // Убрали user_id из параметров
    try {
      const [result] = await this.pool.execute(
        // Убрали user_id из запроса
        "INSERT INTO orders (title, description, date) VALUES (?, ?, ?)",
        // Убрали user_id из массива значений
        [title, description, date]
      );

      return await this.getOrderById(result.insertId);
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async deleteOrder(orderId) {
    try {
      const [result] = await this.pool.execute(
        "DELETE FROM orders WHERE id = ?",
        [orderId]
      );
      return result;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  }

  // ================== PRODUCTS ==================
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
          end: product.guarantee_end,
        };
        delete product.guarantee_start;
        delete product.guarantee_end;

        const prices = await this.getProductPrices(product.id);
        product.price = prices;
      }

      return products;
    } catch (error) {
      console.error("Error fetching all products:", error);
      throw error;
    }
  }

  async getProductById(productId) {
    try {
      const [products] = await this.pool.execute(
        `SELECT id, title, type, specification, order_id FROM products WHERE id = ?`,
        [productId]
      );

      if (products.length === 0) {
        return null;
      }

      return products[0];
    } catch (error) {
      console.error("Error fetching product by ID:", error);
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

  async deleteProduct(productId) {
    try {
      const [result] = await this.pool.execute(
        "DELETE FROM products WHERE id = ?",
        [productId]
      );
      return result;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  async getProductsByOrderId(orderId) {
    try {
      const [products] = await this.pool.execute(
        `SELECT id, title, type, specification FROM products WHERE order_id = ?`,
        [orderId]
      );
      return products;
    } catch (error) {
      console.error("Error fetching products by order ID:", error);
      throw error;
    }
  }

  async getProductPrices(productId) {
    try {
      const [prices] = await this.pool.execute(
        `SELECT value, symbol, is_default as isDefault FROM product_prices WHERE product_id = ?`,
        [productId]
      );
      return prices;
    } catch (error) {
      console.error("Error fetching product prices:", error);
      throw error;
    }
  }

  // ================== REFERENCE DATA ==================
  async getProductTypes() {
    try {
      const types = [
        { value: "Monitors", label: "Мониторы" },
        { value: "Laptops", label: "Ноутбуки" },
        { value: "Keyboards", label: "Клавиатуры" },
        { value: "Phones", label: "Телефоны" },
        { value: "Tablets", label: "Планшеты" },
      ];
      return types;
    } catch (error) {
      console.error("Error fetching product types:", error);
      throw error;
    }
  }

  async getCurrencies() {
    try {
      const currencies = [
        { symbol: "USD", name: "US Dollar" },
        { symbol: "EUR", name: "Euro" },
        { symbol: "UAH", name: "Ukrainian Hryvnia" },
        { symbol: "RUB", name: "Russian Ruble" },
      ];
      return currencies;
    } catch (error) {
      console.error("Error fetching currencies:", error);
      throw error;
    }
  }

  // Инициализация БД при запуске
  async initDatabase() {
    
    console.log("🔄 Initializing database connection...");

    // Показываем какие переменные доступны
    //console.log("🔍 Environment variables:");
    //console.log("  NODE_ENV:", process.env.NODE_ENV);
    //console.log("  MYSQLHOST:", process.env.MYSQLHOST ? "✅ Found" : "❌ Missing");
    //console.log("  MYSQLUSER:", process.env.MYSQLUSER ? "✅ Found" : "❌ Missing");

    const isConnected = await this.testConnection(3, 2000);

    if (isConnected) {
      console.log("🗄️ Database connected successfully");
      await this.createTablesIfNotExist();
      await this.seedInitialData();
      await this.cleanupOldSessions(30);
      console.log("✅ Database initialization completed");
    } else {
      console.error("💥 Database initialization failed");
      // НЕ бросаем ошибку, продолжаем работу
      console.log("⚠️ App will continue without database...");
    }

    return isConnected;
  }
}

// Создаем единственный экземпляр
const db = new Database();

module.exports = db;
