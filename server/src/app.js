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
    // Инициализируем БД, но не блокируем запуск при ошибке
    await db.initDatabase();

    // Middleware setup
    app.use(corsMiddleware);
    app.use(loggerMiddleware);
    app.use(express.json());

    // Routes
    app.use('/api', routes);
    app.use(errorHandler);

    const server = createServer(app);
    
    return { app, server };
  } catch (error) {
    console.error('❌ App initialization error:', error);
    // НЕ бросаем ошибку, продолжаем работу
    
    // Базовая настройка без БД
    app.use(corsMiddleware);
    app.use(express.json());
    app.use('/api', routes);
    
    const server = createServer(app);
    return { app, server };
  }
};

module.exports = { initialize };
