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
      database: urlObj.pathname.slice(1), // убираем первый слеш
      ssl: { rejectUnauthorized: false }
    };
  } catch (error) {
    console.error('❌ Error parsing connection string:', error.message);
    return null;
  }
};

// Конфигурация базы данных - пробуем все варианты Railway
let dbConfig;

if (process.env.MYSQL_URL) {
  // Приоритет - внутренний Railway MYSQL_URL
  console.log('🔗 Using MYSQL_URL (internal Railway connection)');
  dbConfig = parseConnectionString(process.env.MYSQL_URL);
} else if (process.env.MYSQL_PUBLIC_URL) {
  // Fallback - внешний Railway URL
  console.log('🔗 Using MYSQL_PUBLIC_URL (external Railway connection)');
  dbConfig = parseConnectionString(process.env.MYSQL_PUBLIC_URL);
} else if (process.env.MYSQLHOST) {
  // Fallback - отдельные Railway переменные
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
  // Последний fallback - пользовательские переменные
  console.log('🔗 Using custom environment variables');
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway',
    port: parseInt(process.env.DB_PORT || '3306'),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
}

// Добавляем настройки пула
if (dbConfig) {
  dbConfig = {
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  };
}

console.log('🔍 Available Railway variables:');
console.log(' NODE_ENV:', process.env.NODE_ENV || '❌ Missing');
console.log(' MYSQL_URL:', process.env.MYSQL_URL ? '✅ Set (internal)' : '❌ Missing');
console.log(' MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL ? '✅ Set (external)' : '❌ Missing');
console.log(' MYSQLDATABASE:', process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || '❌ Missing');
console.log(' MYSQLHOST:', process.env.MYSQLHOST || '❌ Missing');
console.log(' MYSQLUSER:', process.env.MYSQLUSER || '❌ Missing');
console.log(' MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? '✅ Set' : '❌ Missing');
console.log(' MYSQL_ROOT_PASSWORD:', process.env.MYSQL_ROOT_PASSWORD ? '✅ Set' : '❌ Missing');

if (dbConfig) {
  console.log('🔗 Final DB config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port,
    ssl: !!dbConfig.ssl,
    connectionLimit: dbConfig.connectionLimit
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

    console.log('🔄 Initializing database connection...');
    
    // Создаем пул соединений
    pool = mysql.createPool(dbConfig);
    
    console.log('✅ MySQL pool created successfully');
    
    // Проверяем соединение с повторными попытками
    let retries = 5;
    while (retries > 0) {
      try {
        console.log(`⏳ MySQL connection attempt ${6 - retries}/5...`);
        const connection = await pool.getConnection();
        
        // Тестируем соединение
        await connection.ping();
        console.log('🔌 Connection ping successful');
        
        // Проверяем доступ к базе
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('📊 Database query test:', rows[0]);
        
        connection.release();
        
        console.log('✅ Database connected successfully!');
        
        // Создаем базовые таблицы
        await createBasicTables();
        
        return true;
      } catch (error) {
        console.log(`❌ MySQL connection attempt ${6 - retries}/5 failed:`);
        console.log(` Error: ${error.message}`);
        console.log(` Code: ${error.code}`);
        retries--;
        
        if (retries > 0) {
          console.log('⏸️ Waiting 3s before retry...');
          await new Promise(resolve => setTimeout(resolve, 3000));
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

const createBasicTables = async () => {
  try {
    console.log('📋 Creating basic tables...');
    
    // Создаем таблицу пользователей
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Создаем таблицу заказов
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        total_amount DECIMAL(10,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'USD',
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Создаем таблицу продуктов
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        specification TEXT,
        guarantee_start DATE,
        guarantee_end DATE,
        order_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Создаем таблицу сессий
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        socket_id VARCHAR(255) UNIQUE NOT NULL,
        user_id INT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Создаем индексы для производительности
    await pool.execute(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`);
    await pool.execute(`CREATE INDEX IF NOT EXISTS idx_products_order_id ON products(order_id)`);
    await pool.execute(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)`);
    await pool.execute(`CREATE INDEX IF NOT EXISTS idx_sessions_updated ON user_sessions(updated_at)`);
    
    // Создаем тестового пользователя (пароль: password123)
    await pool.execute(`
      INSERT IGNORE INTO users (name, email, password, role) 
      VALUES ('Railway Admin', 'admin@railway.app', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewaBnADXvK6xg7l2', 'admin')
    `);
    
    // Добавляем тестовые данные
    await pool.execute(`
      INSERT IGNORE INTO orders (id, title, description, total_amount, currency, user_id) 
      VALUES (1, 'Test Order', 'Sample order for testing', 100.00, 'USD', 1)
    `);
    
    await pool.execute(`
      INSERT IGNORE INTO products (title, type, specification, order_id) 
      VALUES ('Test Product', 'electronics', 'Sample product for testing', 1)
    `);
    
    console.log('✅ Basic tables and test data created successfully');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    // Не бросаем ошибку, чтобы приложение могло запуститься
  }
};

// API функции базы данных
const getAllOrders = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT o.*, COUNT(p.id) as products_count 
      FROM orders o 
      LEFT JOIN products p ON o.id = p.order_id 
      GROUP BY o.id 
      ORDER BY o.created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

const getOrderById = async (id) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching order by id:', error);
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
    console.error('Error creating order:', error);
    throw error;
  }
};

const deleteOrder = async (id) => {
  try {
    await pool.execute('DELETE FROM orders WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    return false;
  }
};

const getAllProducts = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, o.title as order_title 
      FROM products p 
      LEFT JOIN orders o ON p.order_id = o.id 
      ORDER BY p.created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

const getProductById = async (id) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching product by id:', error);
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
    console.error('Error creating product:', error);
    throw error;
  }
};

const deleteProduct = async (id) => {
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

const getAllUsers = async () => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC');
    return rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

const getUserByEmail = async (email) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
};

const getUserById = async (id) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching user by id:', error);
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
    console.error('Error creating user:', error);
    throw error;
  }
};

const getActiveSessionsCount = async () => {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM user_sessions WHERE updated_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)');
    return rows[0].count;
  } catch (error) {
    console.error('Error getting sessions count:', error);
    return 0;
  }
};

const addActiveSession = async (socketId, userId, ipAddress, userAgent) => {
  try {
    await pool.execute(
      'INSERT INTO user_sessions (socket_id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP',
      [socketId, userId, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Error adding session:', error);
  }
};

const removeActiveSession = async (socketId) => {
  try {
    await pool.execute('DELETE FROM user_sessions WHERE socket_id = ?', [socketId]);
  } catch (error) {
    console.error('Error removing session:', error);
  }
};

const cleanupOldSessions = async (timeoutMinutes) => {
  try {
    await pool.execute('DELETE FROM user_sessions WHERE updated_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)', [timeoutMinutes]);
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
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
