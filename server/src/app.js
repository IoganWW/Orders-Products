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
    // Проверяем подключение к БД
    const dbConnected = await db.initDatabase();

    if (!dbConnected) {
      throw new Error("Failed to connect to database");
    }

    // Middleware setup
    app.use(corsMiddleware);
    app.use(loggerMiddleware);
    app.use(express.json());

    // Routes
    app.use("/api", routes);

    // Error handling (должен быть последним)
    app.use(errorHandler);

    // 404 handler
    app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "API endpoint not found",
      });
    });

    const server = createServer(app);

    return { app, server };
  } catch (error) {
    console.error("❌ App initialization failed:", error);
    throw error;
  }
};

module.exports = { initialize };
