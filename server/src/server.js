const app = require('./app');
const socketService = require('./services/socketService');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Функция запуска сервера
const startServer = async () => {
  try {
    console.log("🚀 Starting server...");
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Database: ${process.env.DB_NAME || 'orders_products'}`);
    
    const { server } = await app.initialize();
    
    // Инициализация WebSocket
    console.log("📡 Initializing WebSocket service...");
    await socketService.initialize(server);
    
    server.listen(PORT, () => {
      console.log(`\n🎉 Server successfully started!`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io server ready`);
      console.log(`🔐 JWT Auth: enabled`);
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`\n✅ All systems operational\n`);
    });

    return server;
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    
    // Попытка вывести более детальную информацию об ошибке
    if (error.code) {
      switch (error.code) {
        case 'EADDRINUSE':
          console.error(`🚫 Port ${PORT} is already in use`);
          break;
        case 'EACCES':
          console.error(`🚫 Permission denied to bind to port ${PORT}`);
          break;
        case 'ENOTFOUND':
          console.error(`🚫 Database host not found`);
          break;
        default:
          console.error(`🚫 Error code: ${error.code}`);
      }
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check if port is available');
    console.error('   2. Verify database connection settings');
    console.error('   3. Ensure all environment variables are set');
    console.error('   4. Check network connectivity\n');
    
    process.exit(1);
  }
};

// Graceful shutdown с улучшенной обработкой
const setupGracefulShutdown = (server) => {
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}, initiating graceful shutdown...`);
    
    const shutdownTimeout = setTimeout(() => {
      console.error('❌ Graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, 10000); // 10 секунд таймаут
    
    try {
      // Останавливаем принятие новых соединений
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          // Очищаем WebSocket соединения
          await socketService.cleanup();
          console.log('📡 WebSocket service cleaned up');
          
          // Закрываем соединения с БД
          await app.cleanup();
          console.log('🗄️ Database connections closed');
          
          clearTimeout(shutdownTimeout);
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
          
        } catch (cleanupError) {
          console.error('❌ Error during cleanup:', cleanupError);
          clearTimeout(shutdownTimeout);
          process.exit(1);
        }
      });
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  };

  // Обработка различных сигналов завершения
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Обработка необработанных исключений
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    shutdown('uncaughtException');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
};

// Запуск сервера
startServer().then(server => {
  setupGracefulShutdown(server);
}).catch(error => {
  console.error('💥 Fatal error during server startup:', error);
  process.exit(1);
});