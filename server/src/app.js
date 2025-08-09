// server/src/app.js
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const db = require('./services/database');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io обработчики с БД
io.on('connection', async (socket) => {
  console.log('Client connected:', socket.id);
  
  try {
    // Добавляем сессию в БД
    await db.addActiveSession(
      socket.id, 
      null, // userId - пока null, позже добавим авторизацию
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

// API роуты с БД
app.get('/api/health', async (req, res) => {
  try {
    const sessionCount = await db.getActiveSessionsCount();
    res.json({ 
      status: 'OK', 
      activeSessions: sessionCount,
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { title, description, date } = req.body;
    
    if (!title || !description || !date) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    const newOrder = await db.createOrder({ title, description, date });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await db.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    // Проверяем существование заказа
    const order = await db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Удаляем заказ (продукты удалятся автоматически через CASCADE)
    await db.deleteOrder(orderId);
    
    res.json({ message: 'Order and related products deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const productData = req.body;
    console.log('Creating product:', productData);
    
    if (!productData.title || !productData.type || !productData.specification) {
      return res.status(400).json({ error: 'Обязательные поля не заполнены' });
    }
    
    const newProduct = await db.createProduct(productData);
    console.log('Product created:', newProduct);
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    // Проверяем существование продукта
    const product = await db.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Удаляем продукт (цены удалятся автоматически через CASCADE)
    await db.deleteProduct(productId);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    // Пока что возвращаем ошибку, так как update не реализован
    res.status(501).json({ error: 'Product update not implemented yet' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Дополнительные API endpoints
app.get('/api/product-types', async (req, res) => {
  try {
    const types = await db.getProductTypes();
    res.json(types);
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).json({ error: 'Failed to fetch product types' });
  }
});

app.get('/api/currencies', async (req, res) => {
  try {
    const currencies = await db.getCurrencies();
    res.json(currencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

const PORT = process.env.PORT || 3001;

// Инициализация сервера с проверкой БД
const startServer = async () => {
  try {
    // Проверяем подключение к БД
    const dbConnected = await db.initDatabase();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Server not started.');
      process.exit(1);
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io server ready`);
      console.log(`🗄️  Database: ${process.env.DB_NAME || 'orders_products'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  
  try {
    // Закрываем все активные сессии
    await db.cleanupOldSessions(0); // Закрываем все сессии
    
    // Закрываем пул соединений
    await db.pool.end();
    
    server.close(() => {
      console.log('✅ Server shut down gracefully');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Запускаем сервер
startServer();