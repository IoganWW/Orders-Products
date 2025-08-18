// server/src/services/database.js
const mysql = require('mysql2/promise');

// Функция для парсинга MYSQL_URL
const parseConnectionString = (url) => {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 3306,
      user: urlObj.username,
      password: urlObj.password,
      database: urlObj.pathname.slice(1),
      ssl: { rejectUnauthorized: false }
    };
  } catch (error) {
    console.error('❌ Error parsing connection string:', error.message);
    return null;
  }
};

// Конфигурация для MySQL 9 совместимости
let dbConfig;

if (process.env.MYSQL_URL) {
  console.log('🔗 Using MYSQL_URL (internal Railway connection)');
  dbConfig = parseConnectionString(process.env.MYSQL_URL);
} else if (process.env.MYSQL_PUBLIC_URL) {
  console.log('🔗 Using MYSQL_PUBLIC_URL (external Railway connection)');
  dbConfig = parseConnectionString(process.env.MYSQL_PUBLIC_URL);
} else if (process.env.MYSQLHOST) {
  console.log('🔗 Using individual Railway environment variables');
  dbConfig = {
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway',
    port: parseInt(process.env.MYSQLPORT || '3306'),
    ssl: { rejectUnauthorized: false }
  };
} else {
  console.log('🔗 Using fallback configuration');
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway',
    port: parseInt(process.env.DB_PORT || '3306'),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
}

// MySQL 9 совместимые настройки пула
if (dbConfig) {
  dbConfig = {
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 5, // Уменьшено для Railway
    queueLimit: 0,
    // Убираем несовместимые с MySQL2 опции
    charset: 'utf8mb4',
    timezone: '+00:00',
    // Таймауты для стабильности
    connectTimeout: 30000,
    acquireTimeout: 30000,
    // MySQL 9 authentication
    authPlugins: {
      mysql_native_password: () => () => Buffer.alloc(0),
      caching_sha2_password: () => () => Buffer.alloc(0)
    }
  };
}

console.log('🔍 Available Railway variables:');
console.log(' NODE_ENV:', process.env.NODE_ENV || '❌ Missing');
console.log(' MYSQL_URL:', process.env.MYSQL_URL ? '✅ Set (internal)' : '❌ Missing');
console.log(' MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL ? '✅ Set (external)' : '❌ Missing');
console.log(' MYSQLDATABASE:', process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || '❌ Missing');
console.log(' MYSQLHOST:', process.env.MYSQLHOST || '❌ Missing');

if (dbConfig) {
  console.log('🔗 Final DB config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port,
    ssl: !!dbConfig.ssl,
    connectionLimit: dbConfig.connectionLimit,
    charset: dbConfig.charset
  });
} else {
  console.error('❌ Failed to create database configuration');
}

let pool;

const initDatabase = async () => {
  try {
    if (!dbConfig) {
      console.error('❌ No database configuration available');
      return false;
    }

    console.log('🔄 Initializing MySQL 9 compatible connection...');
    
    // Создаем пул с MySQL 9 совместимостью
    pool = mysql.createPool(dbConfig);
    
    console.log('✅ MySQL pool created successfully');
    
    // Расширенная проверка соединения для MySQL 9
    let retries = 5;
    while (retries > 0) {
      try {
        console.log(`⏳ MySQL connection attempt ${6 - retries}/5...`);
        const connection = await pool.getConnection();
        
        // Проверяем версию MySQL
        const [versionRows] = await connection.execute('SELECT VERSION() as version');
        console.log('🗃️ MySQL version:', versionRows[0].version);
        
        // Тестируем соединение
        await connection.ping();
        console.log('🔌 Connection ping successful');
        
        // Проверяем доступ к базе
        const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
        console.log('📊 Database query test:', rows[0]);
        
        // Проверяем текущую базу данных
        const [dbRows] = await connection.execute('SELECT DATABASE() as current_db');
        console.log('🗄️ Current database:', dbRows[0].current_db);
        
        connection.release();
        
        console.log('✅ Database connected successfully!');
        
        // Создаем таблицы с MySQL 9 совместимостью
        await createMysql9CompatibleTables();
        
        return true;
      } catch (error) {
        console.log(`❌ MySQL connection attempt ${6 - retries}/5 failed:`);
        console.log(` Error: ${error.message}`);
        console.log(` Code: ${error.code}`);
        console.log(` SQL State: ${error.sqlState || 'N/A'}`);
        retries--;
        
        if (retries > 0) {
          console.log('⏸️ Waiting 5s before retry...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    console.error('❌ Failed to connect to database after 5 attempts');
    return false;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

const createMysql9CompatibleTables = async () => {
  try {
    console.log('📋 Creating MySQL 9 compatible tables...');
    
    // Создаем таблицы с современным синтаксисом MySQL 9
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email),
        INDEX idx_users_role (role)
      ) ENGINE=InnoDB 
        DEFAULT CHARSET=utf8mb4 
        COLLATE=utf8mb4_unicode_ci
        COMMENT='Users table for authentication'
    `);
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        total_amount DECIMAL(10,2) DEFAULT 0.00,
        currency CHAR(3) DEFAULT 'USD',
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_orders_user_id (user_id),
        INDEX idx_orders_created (created_at),
        CONSTRAINT fk_orders_user_id 
          FOREIGN KEY (user_id) REFERENCES users(id) 
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB 
        DEFAULT CHARSET=utf8mb4 
        COLLATE=utf8mb4_unicode_ci
        COMMENT='Orders table'
    `);
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        specification TEXT,
        guarantee_start DATE,
        guarantee_end DATE,
        order_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_products_order_id (order_id),
        INDEX idx_products_type (type),
        INDEX idx_products_created (created_at),
        CONSTRAINT fk_products_order_id 
          FOREIGN KEY (order_id) REFERENCES orders(id) 
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB 
        DEFAULT CHARSET=utf8mb4 
        COLLATE=utf8mb4_unicode_ci
        COMMENT='Products table'
    `);
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        socket_id VARCHAR(255) NOT NULL UNIQUE,
        user_id INT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sessions_user_id (user_id),
        INDEX idx_sessions_updated (updated_at),
        INDEX idx_sessions_socket_id (socket_id),
        CONSTRAINT fk_sessions_user_id 
          FOREIGN KEY (user_id) REFERENCES users(id) 
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB 
        DEFAULT CHARSET=utf8mb4 
        COLLATE=utf8mb4_unicode_ci
        COMMENT='Active user sessions for WebSocket'
    `);
    
    // Создаем тестового пользователя (пароль: password123)
    await pool.execute(`
      INSERT IGNORE INTO users (name, email, password, role) 
      VALUES ('Railway Admin', 'admin@railway.app', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewaBnADXvK6xg7l2', 'admin')
    `);
    
    // Создаем тестовые данные
    await pool.execute(`
      INSERT IGNORE INTO orders (id, title, description, total_amount, currency, user_id) 
      VALUES (1, 'Welcome Order', 'Sample order for Railway deployment testing', 299.99, 'USD', 1)
    `);
    
    await pool.execute(`
      INSERT IGNORE INTO products (title, type, specification, order_id) 
      VALUES 
        ('Railway Product 1', 'software', 'Test product for Railway MySQL 9', 1),
        ('Railway Product 2', 'hardware', 'Another test product for MySQL 9', 1)
    `);
    
    console.log('✅ MySQL 9 compatible tables and test data created successfully');
    
  } catch (error) {
    console.error('❌ Error creating MySQL 9 compatible tables:', error.message);
    console.error('❌ SQL State:', error.sqlState);
    console.error('❌ SQL Message:', error.sqlMessage);
    // Не бросаем ошибку, чтобы приложение продолжило работу
  }
};

// API функции с улучшенной обработкой ошибок для MySQL 9
const getAllOrders = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        o.id,
        o.title,
        o.description,
        o.total_amount,
        o.currency,
        o.created_at,
        o.updated_at,
        COUNT(p.id) as products_count 
      FROM orders o 
      LEFT JOIN products p ON o.id = p.order_id 
      GROUP BY o.id, o.title, o.description, o.total_amount, o.currency, o.created_at, o.updated_at
      ORDER BY o.created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    return [];
  }
};

const getOrderById = async (id) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching order by id:', error.message);
    return null;
  }
};

const createOrder = async (orderData) => {
  try {
    const { title, description, date, user_id } = orderData;
    const [result] = await pool.execute(
      'INSERT INTO orders (title, description, user_id) VALUES (?, ?, ?)',
      [title, description, user_id]
    );
    return { id: result.insertId, title, description, user_id };
  } catch (error) {
    console.error('Error creating order:', error.message);
    throw error;
  }
};

const deleteOrder = async (id) => {
  try {
    const [result] = await pool.execute('DELETE FROM orders WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting order:', error.message);
    return false;
  }
};

const getAllProducts = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.*,
        o.title as order_title 
      FROM products p 
      LEFT JOIN orders o ON p.order_id = o.id 
      ORDER BY p.created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
};

const getProductById = async (id) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching product by id:', error.message);
    return null;
  }
};

const createProduct = async (productData) => {
  try {
    const { title, type, specification, order_id } = productData;
    const [result] = await pool.execute(
      'INSERT INTO products (title, type, specification, order_id) VALUES (?, ?, ?, ?)',
      [title, type, specification, order_id]
    );
    return { id: result.insertId, title, type, specification, order_id };
  } catch (error) {
    console.error('Error creating product:', error.message);
    throw error;
  }
};

const deleteProduct = async (id) => {
  try {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting product:', error.message);
    return false;
  }
};

const getAllUsers = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, name, email, role, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return [];
  }
};

const getUserByEmail = async (email) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching user by email:', error.message);
    return null;
  }
};

const getUserById = async (id) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching user by id:', error.message);
    return null;
  }
};

const createUser = async (userData) => {
  try {
    const { name, email, password, role = 'user' } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return { id: result.insertId, name, email, role };
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
};

const getActiveSessionsCount = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM user_sessions 
      WHERE updated_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
    `);
    return rows[0].count;
  } catch (error) {
    console.error('Error getting sessions count:', error.message);
    return 0;
  }
};

const addActiveSession = async (socketId, userId, ipAddress, userAgent) => {
  try {
    await pool.execute(`
      INSERT INTO user_sessions (socket_id, user_id, ip_address, user_agent) 
      VALUES (?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `, [socketId, userId, ipAddress, userAgent]);
  } catch (error) {
    console.error('Error adding session:', error.message);
  }
};

const removeActiveSession = async (socketId) => {
  try {
    await pool.execute('DELETE FROM user_sessions WHERE socket_id = ?', [socketId]);
  } catch (error) {
    console.error('Error removing session:', error.message);
  }
};

const cleanupOldSessions = async (timeoutMinutes) => {
  try {
    const [result] = await pool.execute(`
      DELETE FROM user_sessions 
      WHERE updated_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)
    `, [timeoutMinutes]);
    
    if (result.affectedRows > 0) {
      console.log(`🧹 Cleaned up ${result.affectedRows} old sessions`);
    }
  } catch (error) {
    console.error('Error cleaning up sessions:', error.message);
  }
};

module.exports = {
  initDatabase,
  pool,
  getAllOrders,
  getOrderById,
  createOrder,
  deleteOrder,
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
  getAllUsers,
  getUserByEmail,
  getUserById,
  createUser,
  getActiveSessionsCount,
  addActiveSession,
  removeActiveSession,
  cleanupOldSessions
};
