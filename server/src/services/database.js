const mysql = require("mysql2/promise");
require("dotenv").config();

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
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "orders_products",
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
      queueLimit: 0,
      charset: "utf8mb4",
      // Убираем неподдерживаемые параметры для MySQL2
      multipleStatements: false,
      dateStrings: false,
      supportBigNumbers: true,
      bigNumberStrings: false,
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

  // ========== НОВЫЕ МЕТОДЫ ДЛЯ СОЗДАНИЯ ТАБЛИЦ ==========

  // Создать все необходимые таблицы
  async createTablesIfNotExist() {
    try {
      console.log("🗄️ Creating tables if not exist...");

      // 1. Создаем таблицу orders первой (так как на неё ссылаются products)
      await this.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          date DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 2. Создаем таблицу users
      await this.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin', 'user') DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 3. Создаем таблицу products (ссылается на orders)
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
          INDEX idx_serial_number (serial_number),
          INDEX idx_type (type),
          INDEX idx_date (date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 4. Создаем таблицу product_prices (ссылается на products)
      await this.query(`
        CREATE TABLE IF NOT EXISTS product_prices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          value DECIMAL(10, 2) NOT NULL,
          symbol VARCHAR(10) NOT NULL,
          is_default TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          INDEX idx_product_id (product_id),
          INDEX idx_default (is_default)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 5. Создаем таблицу user_sessions (ссылается на users)
      await this.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          session_id VARCHAR(255) NOT NULL UNIQUE,
          ip_address VARCHAR(45),
          user_agent TEXT,
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_session_id (session_id),
          INDEX idx_user_id (user_id),
          INDEX idx_updated (updated_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      console.log("✅ All tables created/verified successfully");
      return true;
    } catch (error) {
      console.error("❌ Error creating tables:", error);
      return false;
    }
  }

  // Проверить нужно ли добавлять тестовые данные
  async needsInitialData() {
    try {
      const [orderRows] = await this.query("SELECT COUNT(*) as count FROM orders");
      const [userRows] = await this.query("SELECT COUNT(*) as count FROM users");
      
      const orderCount = orderRows?.[0]?.count ?? 0;
      const userCount = userRows?.[0]?.count ?? 0;
      
      return orderCount === 0 && userCount === 0;
    } catch (error) {
      console.error("Error checking initial data need:", error);
      return false;
    }
  }

  // Добавить тестовые данные (только если база пустая)
  async seedInitialData() {
    try {
      const needsData = await this.needsInitialData();
      
      if (!needsData) {
        console.log("ℹ️ Database already has data, skipping seed");
        return true;
      }

      console.log("📝 Adding initial test data...");

      // Хэш для пароля "admin123" (bcrypt)
      const passwordHash = '$2a$10$Vms1LnLzWFp/duhA9YzcEeCYln54egAiMii.34HRO8vWzZy3xEVPa';

      // Добавляем пользователей с IGNORE чтобы избежать дублирования
      await this.query(`
        INSERT IGNORE INTO users (name, email, password, role) VALUES 
        ('Admin User', 'admin@example.com', ?, 'admin'),
        ('Test User', 'user@example.com', ?, 'user')
      `, [passwordHash, passwordHash]);

      // Добавляем заказы с IGNORE
      await this.query(`
        INSERT IGNORE INTO orders (id, title, description, date) VALUES
        (1, 'Order 1', 'Длинное предлинное длинночнее длиннючее название прихода', '2017-06-29 12:09:33'),
        (2, 'Order 2', 'Длинное название прихода', '2017-06-29 12:09:33'),
        (3, 'Order 3', 'Длинное предлинное длинночнее название прихода', '2017-06-29 12:09:33')
      `);

      // Добавляем продукты с IGNORE
      await this.query(`
        INSERT IGNORE INTO products (id, serial_number, is_new, photo, title, type, specification, guarantee_start, guarantee_end, order_id, date) VALUES
        (1, '1234', 1, 'pathToFile.jpg', 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3', 'Monitors', 'Specification 1', '2017-06-29 12:09:33', '2019-06-29 12:09:33', 1, '2017-06-29 12:09:33'),
        (2, '1235', 1, 'pathToFile.jpg', 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3', 'Monitors', 'Specification 1', '2017-06-29 12:09:33', '2019-06-29 12:09:33', 2, '2017-06-29 12:09:33'),
        (3, '1236', 0, 'pathToFile.jpg', 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3', 'Keyboards', 'Specification 3', '2017-06-29 12:09:33', '2019-06-29 12:09:33', 1, '2017-06-29 12:09:33'),
        (4, '1237', 1, 'pathToFile.jpg', 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3', 'Phones', 'Specification 4', '2017-06-29 12:09:33', '2019-06-29 12:09:33', 3, '2017-06-29 12:09:33')
      `);

      // Добавляем цены с IGNORE (но без ID, так как нет уникального ключа кроме id)
      await this.query(`
        INSERT IGNORE INTO product_prices (product_id, value, symbol, is_default) VALUES
        (1, 100.00, 'USD', 0),
        (1, 2600.00, 'UAH', 1),
        (2, 200.00, 'USD', 0),
        (2, 5200.00, 'UAH', 1),
        (3, 50.00, 'USD', 0),
        (3, 1300.00, 'UAH', 1),
        (4, 300.00, 'USD', 0),
        (4, 7800.00, 'UAH', 1)
      `);

      console.log("✅ Initial test data added successfully");
      return true;
    } catch (error) {
      console.error("❌ Error seeding initial data:", error);
      return false;
    }
  }

  // Создать дополнительные индексы для оптимизации
  async createOptimizationIndexes() {
    try {
      console.log("🔍 Creating optimization indexes...");

      const indexes = [
        "CREATE INDEX IF NOT EXISTS idx_products_type ON products(type)",
        "CREATE INDEX IF NOT EXISTS idx_products_date ON products(date)",
        "CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date)",
        "CREATE INDEX IF NOT EXISTS idx_user_sessions_updated ON user_sessions(updated_at)",
        "CREATE INDEX IF NOT EXISTS idx_product_prices_default ON product_prices(is_default)",
      ];

      for (const indexSql of indexes) {
        try {
          await this.query(indexSql);
        } catch (indexError) {
          // Индексы могли уже существовать, это нормально
          if (!indexError.message.includes('Duplicate key name')) {
            console.warn(`Warning creating index: ${indexError.message}`);
          }
        }
      }

      console.log("✅ Optimization indexes created/verified");
      return true;
    } catch (error) {
      console.error("❌ Error creating indexes:", error);
      return false;
    }
  }

  // Создать таблицу user_sessions отдельно (для обратной совместимости)
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✅ user_sessions table created/verified");
      return true;
    } catch (error) {
      console.error("❌ Error creating user_sessions table:", error);
      return false;
    }
  }

  // ========== ОБНОВЛЕННАЯ ИНИЦИАЛИЗАЦИЯ ==========

  // Полная инициализация БД при запуске с retry
  async initDatabase() {
    console.log("🔄 Initializing database connection...");

    const isConnected = await this.testConnection(15, 3000);

    if (!isConnected) {
      console.error("💥 Database initialization failed");
      return false;
    }

    try {
      console.log("🗄️ Setting up database schema...");

      // 1. Создаем все таблицы
      const tablesCreated = await this.createTablesIfNotExist();
      if (!tablesCreated) {
        console.error("❌ Failed to create tables");
        return false;
      }

      // 2. Создаем индексы для оптимизации
      await this.createOptimizationIndexes();

      // 3. Добавляем тестовые данные если нужно (только если включено в .env)
      if (process.env.AUTO_SEED_DATA === 'true') {
        const seedResult = await this.seedInitialData();
        if (!seedResult) {
          console.warn("⚠️ Failed to seed initial data, but continuing...");
        }
      } else {
        console.log("ℹ️ Auto-seeding disabled (set AUTO_SEED_DATA=true to enable)");
      }

      // 4. Очищаем старые сессии
      await this.cleanupOldSessions(30);

      console.log("🎉 Database initialized successfully");
      return true;

    } catch (error) {
      console.error("💥 Database setup failed:", error);
      return false;
    }
  }

  // ========== ОСТАЛЬНЫЕ МЕТОДЫ ОСТАЮТСЯ БЕЗ ИЗМЕНЕНИЙ ==========

  async cleanupOldSessions(minutesOld = 30) {
    try {
      if (!this.isConnected) {
        console.warn("⚠️ Database not connected, skipping session cleanup");
        return null;
      }

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
      return null;
    }
  }

  // ... [Все остальные методы остаются точно такими же как в оригинальном файле]
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

  async updateUser(userId, updateData) {
    try {
      const allowedFields = ["name", "email", "password", "role"];
      const updates = [];
      const values = [];

      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          updates.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (updates.length === 0) {
        throw new Error("No valid fields to update");
      }

      values.push(userId);

      const [result] = await this.pool.execute(
        `UPDATE users SET ${updates.join(
          ", "
        )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.getUserById(userId);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const [result] = await this.pool.execute(
        "DELETE FROM users WHERE id = ?",
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
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
      if (!this.isConnected) {
        console.warn("⚠️ Database not connected, skipping session add");
        return null;
      }

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
      return null; // Возвращаем null вместо throw для graceful degradation
    }
  }

  async removeActiveSession(sessionId) {
    try {
      if (!this.isConnected) {
        console.warn("⚠️ Database not connected, skipping session removal");
        return null;
      }

      const [result] = await this.pool.execute(
        "UPDATE user_sessions SET is_active = 0 WHERE session_id = ?",
        [sessionId]
      );
      return result;
    } catch (error) {
      console.error("Error removing session:", error);
      return null;
    }
  }

  async getActiveSessionsByUserId(userId) {
    try {
      if (!this.isConnected) {
        console.warn("⚠️ Database not connected, returning empty sessions");
        return [];
      }

      const [rows] = await this.pool.execute(
        "SELECT session_id, ip_address, user_agent, created_at, updated_at FROM user_sessions WHERE user_id = ? AND is_active = 1",
        [userId]
      );
      return rows;
    } catch (error) {
      console.error("Error getting user sessions:", error);
      return [];
    }
  }

  async getActiveSessionsCount() {
    try {
      if (!this.isConnected) {
        return 0;
      }

      const rows = await this.query("SELECT COUNT(*) as count FROM user_sessions WHERE is_active = 1");
      return rows?.[0]?.count ?? 0;
    } catch (error) {
      console.error("Error getting sessions count:", error);
      return 0;
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
    try {
      const [result] = await this.pool.execute(
        "INSERT INTO orders (title, description, date) VALUES (?, ?, ?)",
        [title, description, date]
      );

      return await this.getOrderById(result.insertId);
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async updateOrder(orderId, { title, description, date }) {
    try {
      const [result] = await this.pool.execute(
        "UPDATE orders SET title = ?, description = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [title, description, date, orderId]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error("Error updating order:", error);
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
        `SELECT 
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
        WHERE p.id = ?`,
        [productId]
      );

      if (products.length === 0) {
        return null;
      }

      const product = products[0];
      product.guarantee = {
        start: product.guarantee_start,
        end: product.guarantee_end,
      };
      delete product.guarantee_start;
      delete product.guarantee_end;

      product.price = await this.getProductPrices(product.id);
      
      return product;
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      throw error;
    }
  }

  async createProduct(productData) {
    return await this.transaction(async (connection) => {
      // Проверяем уникальность серийного номера
      const [existing] = await connection.execute(
        "SELECT id FROM products WHERE serial_number = ?",
        [productData.serialNumber]
      );

      if (existing.length > 0) {
        throw new Error(
          `Product with serial number ${productData.serialNumber} already exists`
        );
      }

      const [result] = await connection.execute(
        `INSERT INTO products 
        (serial_number, is_new, photo, title, type, specification, guarantee_start, guarantee_end, order_id, date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productData.serialNumber,
          productData.isNew,
          productData.photo || "pathToFile.jpg",
          productData.title,
          productData.type,
          productData.specification,
          productData.guarantee.start,
          productData.guarantee.end,
          productData.order,
          productData.date,
        ]
      );

      const productId = result.insertId;

      if (productData.price && Array.isArray(productData.price)) {
        for (let priceData of productData.price) {
          await connection.execute(
            "INSERT INTO product_prices (product_id, value, symbol, is_default) VALUES (?, ?, ?, ?)",
            [
              productId,
              priceData.value,
              priceData.symbol,
              priceData.isDefault || 0,
            ]
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
        "SELECT id FROM products WHERE id = ?",
        [productId]
      );

      if (existing.length === 0) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Если обновляется серийный номер, проверяем уникальность
      if (productData.serialNumber) {
        const [duplicate] = await connection.execute(
          "SELECT id FROM products WHERE serial_number = ? AND id != ?",
          [productData.serialNumber, productId]
        );

        if (duplicate.length > 0) {
          throw new Error(
            `Product with serial number ${productData.serialNumber} already exists`
          );
        }
      }

      // Обновляем основные данные продукта
      const updateFields = [];
      const updateValues = [];

      const allowedFields = {
        serialNumber: "serial_number",
        isNew: "is_new",
        photo: "photo",
        title: "title",
        type: "type",
        specification: "specification",
        order: "order_id",
        date: "date",
      };

      Object.keys(allowedFields).forEach((key) => {
        if (productData[key] !== undefined) {
          updateFields.push(`${allowedFields[key]} = ?`);
          updateValues.push(productData[key]);
        }
      });

      if (productData.guarantee) {
        if (productData.guarantee.start) {
          updateFields.push("guarantee_start = ?");
          updateValues.push(productData.guarantee.start);
        }
        if (productData.guarantee.end) {
          updateFields.push("guarantee_end = ?");
          updateValues.push(productData.guarantee.end);
        }
      }

      if (updateFields.length > 0) {
        updateValues.push(productId);
        await connection.execute(
          `UPDATE products SET ${updateFields.join(
            ", "
          )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          updateValues
        );
      }

      // Обновляем цены если переданы
      if (productData.price && Array.isArray(productData.price)) {
        // Удаляем старые цены
        await connection.execute(
          "DELETE FROM product_prices WHERE product_id = ?",
          [productId]
        );

        // Добавляем новые цены
        for (let priceData of productData.price) {
          await connection.execute(
            "INSERT INTO product_prices (product_id, value, symbol, is_default) VALUES (?, ?, ?, ?)",
            [
              productId,
              priceData.value,
              priceData.symbol,
              priceData.isDefault || 0,
            ]
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
        `SELECT 
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
        ORDER BY p.created_at DESC`,
        [orderId]
      );

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
      console.error("Error fetching products by order ID:", error);
      throw error;
    }
  }

  async getProductPrices(productId) {
    try {
      const [prices] = await this.pool.execute(
        `SELECT 
          pp.value,
          pp.symbol,
          pp.is_default as isDefault
        FROM product_prices pp
        WHERE pp.product_id = ?
        ORDER BY pp.is_default DESC, pp.symbol`,
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

  // Метод для получения статистики БД
  async getDatabaseStats() {
    try {
      if (!this.isConnected) {
        return {
          orders: 0,
          products: 0,
          users: 0,
          activeSessions: 0
        };
      }

      const stats = {};

      const orderRows = await this.query("SELECT COUNT(*) as count FROM orders");
      stats.orders = orderRows?.[0]?.count ?? 0;

      const productRows = await this.query("SELECT COUNT(*) as count FROM products");
      stats.products = productRows?.[0]?.count ?? 0;

      const userRows = await this.query("SELECT COUNT(*) as count FROM users");
      stats.users = userRows?.[0]?.count ?? 0;

      const sessionRows = await this.query("SELECT COUNT(*) as count FROM user_sessions WHERE is_active = 1");
      stats.activeSessions = sessionRows?.[0]?.count ?? 0;

      return stats;
    } catch (error) {
      console.error("Error fetching database stats:", error);
      return {
        orders: 0,
        products: 0,
        users: 0,
        activeSessions: 0
      };
    }
  }

  // ========== ДОПОЛНИТЕЛЬНЫЕ УТИЛИТЫ ==========

  // Проверка существования базы данных
  async checkDatabaseExists() {
    try {
      const dbName = process.env.DB_NAME || "orders_products";
      const [rows] = await this.pool.execute(
        "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
        [dbName]
      );
      return rows.length > 0;
    } catch (error) {
      console.error("Error checking database existence:", error);
      return false;
    }
  }

  // Создание базы данных если не существует
  async createDatabaseIfNotExists() {
    try {
      const dbName = process.env.DB_NAME || "orders_products";
      await this.query(
        `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      await this.query(`USE \`${dbName}\``);
      console.log(`✅ Database '${dbName}' created/verified`);
      return true;
    } catch (error) {
      console.error("Error creating database:", error);
      return false;
    }
  }

  // Полная диагностика системы
  async systemDiagnostics() {
    try {
      console.log("🔍 Running system diagnostics...");
      
      const diagnostics = {
        connection: false,
        database: false,
        tables: {},
        dataCount: {},
        indexes: false
      };

      // Проверка подключения
      try {
        const connection = await this.pool.getConnection();
        await connection.ping();
        connection.release();
        diagnostics.connection = true;
      } catch (error) {
        console.error("❌ Connection failed:", error.message);
        return diagnostics;
      }

      if (diagnostics.connection) {
        // Проверка существования таблиц
        const tables = ['users', 'orders', 'products', 'product_prices', 'user_sessions'];
        for (const table of tables) {
          try {
            const result = await this.query(`SHOW TABLES LIKE '${table}'`);
            diagnostics.tables[table] = result.length > 0;
            
            if (diagnostics.tables[table]) {
              const countResult = await this.query(`SELECT COUNT(*) as count FROM ${table}`);
              diagnostics.dataCount[table] = countResult?.[0]?.count ?? 0;
            } else {
              diagnostics.dataCount[table] = 0;
            }
          } catch (error) {
            console.warn(`Warning checking table ${table}:`, error.message);
            diagnostics.tables[table] = false;
            diagnostics.dataCount[table] = 0;
          }
        }

        // Проверка индексов
        try {
          const indexes = await this.query("SHOW INDEX FROM products WHERE Key_name != 'PRIMARY'");
          diagnostics.indexes = indexes.length > 0;
        } catch (error) {
          diagnostics.indexes = false;
        }
      }

      console.log("📊 System Diagnostics Results:");
      console.log("  Connection:", diagnostics.connection ? "✅" : "❌");
      console.log("  Tables:");
      Object.entries(diagnostics.tables).forEach(([table, exists]) => {
        const count = diagnostics.dataCount[table] || 0;
        console.log(`    ${table}: ${exists ? "✅" : "❌"} (${count} records)`);
      });
      console.log("  Indexes:", diagnostics.indexes ? "✅" : "❌");

      return diagnostics;
    } catch (error) {
      console.error("❌ Diagnostics failed:", error);
      return null;
    }
  }
}

// Создаем единственный экземпляр
const db = new Database();

module.exports = db;