const express = require("express");
const { createServer } = require("http");
const db = require("./services/database");

// Middleware
const corsMiddleware = require("./middleware/cors");
const loggerMiddleware = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

// Routes
const routes = require("./routes");

const app = express();

const initialize = async () => {
  try {
    console.log("🔄 Initializing application...");

    // Инициализируем БД с автоматическим созданием таблиц и данных
    console.log("🗄️ Setting up database...");
    const dbInitialized = await db.initDatabase();
    
    if (dbInitialized) {
      console.log("✅ Database initialized successfully");
      
      // Получаем статистику БД
      try {
        const stats = await db.getDatabaseStats();
        console.log("📊 Database stats:", {
          orders: stats.orders,
          products: stats.products,
          users: stats.users,
          activeSessions: stats.activeSessions
        });
      } catch (statsError) {
        console.warn("⚠️ Could not fetch database stats:", statsError.message);
      }
      
    } else {
      console.warn("⚠️ Database not available, running in degraded mode");
      console.warn("   - Session tracking disabled");
      console.warn("   - API endpoints may return errors");
    }

    // Middleware setup
    app.use(corsMiddleware);
    app.use(loggerMiddleware);
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // API Routes
    app.use('/api', routes);
    
    const server = createServer(app);
    
    console.log("✅ Application initialized successfully");
    return { app, server };
    
  } catch (error) {
    console.error('❌ App initialization error:', error);
    
    // Fallback: базовая настройка без БД
    console.log("🔄 Setting up fallback configuration...");
    
    app.use(corsMiddleware);
    app.use(express.json());
    app.use('/api', routes);
    
    const server = createServer(app);
    console.log("⚠️ Application running in fallback mode");
    return { app, server };
  } finally {
    // Error handling middleware должен быть ПОСЛЕДНИМ всегда
    app.use(errorHandler);
  }
};

// Функция для graceful shutdown БД
const cleanup = async () => {
  try {
    console.log("🧹 Cleaning up database connections...");
    await db.close();
    console.log("✅ Database connections closed");
  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
  }
};

module.exports = { 
  initialize, 
  cleanup
};