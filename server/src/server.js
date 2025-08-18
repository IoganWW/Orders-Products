const app = require('./app');
const socketService = require('./services/socketService');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Функция запуска сервера
const startServer = async () => {
  try {
    const { server } = await app.initialize();
    
    // Инициализация WebSocket
    await socketService.initialize(server);
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io server ready`);
      console.log(`🗄️  Database: ${process.env.DB_NAME || 'orders_products'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 JWT Auth: enabled`);
    });

    return server;
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const setupGracefulShutdown = (server) => {
  process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    
    try {
      await socketService.cleanup();
      
      server.close(() => {
        console.log('✅ Server shut down gracefully');
        process.exit(0);
      });
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
};

// Запуск сервера
startServer().then(server => {
  setupGracefulShutdown(server);
});