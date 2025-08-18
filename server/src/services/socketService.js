const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('./database');

const JWT_SECRET = process.env.JWT_SECRET;

let io = null;

const initialize = async (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Socket.io обработчики с авторизацией
  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);
    
    try {
      // Пытаемся получить userId из токена
      let userId = null;
      const token = socket.handshake.auth?.token;
      
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.id;
          console.log(`Authenticated user ${userId} connected`);
        } catch (err) {
          console.log('Invalid token for socket connection');
        }
      }

      // Добавляем сессию в БД
      await db.addActiveSession(
        socket.id, 
        userId,
        socket.handshake.address,
        socket.handshake.headers['user-agent']
      );
      
      // Отправляем обновленное количество сессий
      const sessionCount = await db.getActiveSessionsCount();
      io.emit('activeSessionsUpdate', sessionCount);
      console.log(`Active sessions: ${sessionCount}`);
      
    } catch (error) {
      console.error('Error adding session:', error);
    }

    socket.on('disconnect', async (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
      
      try {
        // Удаляем сессию из БД
        await db.removeActiveSession(socket.id);
        
        // Отправляем обновленное количество сессий
        const sessionCount = await db.getActiveSessionsCount();
        io.emit('activeSessionsUpdate', sessionCount);
        console.log(`Active sessions: ${sessionCount}`);
        
      } catch (error) {
        console.error('Error removing session:', error);
      }
    });

    socket.on('beforeUnload', async () => {
      console.log('Client beforeUnload (forced):', socket.id);
      try {
        await db.removeActiveSession(socket.id);
        const sessionCount = await db.getActiveSessionsCount();
        io.emit('activeSessionsUpdate', sessionCount);
      } catch (error) {
        console.error('Error in beforeUnload:', error);
      }
    });
  });

  // Очистка старых сессий каждые 5 минут
  setInterval(async () => {
    try {
      const timeoutMinutes = parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 30;
      await db.cleanupOldSessions(timeoutMinutes);
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
    }
  }, (parseInt(process.env.SESSION_CLEANUP_INTERVAL) || 5) * 60 * 1000);

  console.log('📡 Socket.io service initialized');
};

const getActiveSessionsCount = async () => {
  return await db.getActiveSessionsCount();
};

const cleanup = async () => {
  try {
    console.log('🧹 Cleaning up socket sessions...');
    
    // Закрываем все активные сессии
    await db.cleanupOldSessions(0); // Закрываем все сессии
    
    // Закрываем пул соединений БД
    if (db.pool) {
      await db.pool.end();
    }
    
    console.log('✅ Socket service cleanup completed');
  } catch (error) {
    console.error('❌ Error during socket cleanup:', error);
    throw error;
  }
};

module.exports = {
  initialize,
  getActiveSessionsCount,
  cleanup
};