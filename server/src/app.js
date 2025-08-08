const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
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

// Socket.io обработчики
const connectedClients = new Set();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Добавляем клиента в Set
  connectedClients.add(socket.id);
  const currentSessions = connectedClients.size;
  
  console.log(`Active sessions: ${currentSessions}`);
  
  // Отправляем обновленное количество всем клиентам
  io.emit('activeSessionsUpdate', currentSessions);

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
    
    // Удаляем клиента из Set
    connectedClients.delete(socket.id);
    const currentSessions = connectedClients.size;
    
    console.log(`Active sessions: ${currentSessions}`);
    
    // Отправляем обновленное количество всем клиентам
    io.emit('activeSessionsUpdate', currentSessions);
  });

  // Обработка принудительного закрытия вкладки
  socket.on('beforeUnload', () => {
    console.log('Client beforeUnload (forced):', socket.id);
    connectedClients.delete(socket.id);
    const currentSessions = connectedClients.size;
    io.emit('activeSessionsUpdate', currentSessions);
    socket.disconnect(); // Принудительно отключаем
  });
});

// Базовые роуты
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    activeSessions: connectedClients.size,
    timestamp: new Date().toISOString(),
    connectedClients: Array.from(connectedClients)
  });
});

// Временные данные (позже заменим на БД)
const orders = [
  {
    id: 1,
    title: 'Длинное предлинное длиннющее название прихода',
    date: '2017-06-29 12:09:33',
    description: 'First test order',
  },
  {
    id: 2,
    title: 'Длинное название прихода', 
    date: '2017-06-29 12:09:33',
    description: 'Second test order',
  },
  {
    id: 3,
    title: 'Длинное предлинное длиннющее название прихода',
    date: '2017-06-29 12:09:33',
    description: 'Third test order',
  },
  {
    id: 4,
    title: 'Длинное предлинное название прихода',
    date: '2017-06-29 12:09:33',
    description: 'First test order',
  }
];

const products = [
  {
    id: 1,
    serialNumber: 123456789,
    isNew: 1,
    photo: 'pathToFile.jpg',
    title: 'Gigabyte Technology X58 USB3 (Socket 1366) G X58 USB3',
    type: 'Monitors',
    specification: 'Specification 1',
    guarantee: {
      start: '2017-06-29 12:09:33',
      end: '2019-06-29 12:09:33'
    },
    price: [
      {value: 100, symbol: 'USD', isDefault: 0},
      {value: 2600, symbol: 'UAH', isDefault: 1}
    ],
    order: 1,
    date: '2017-06-29 12:09:33'
  },
  {
    id: 2,
    serialNumber: 123456789,
    isNew: 1,
    photo: 'pathToFile.jpg',
    title: 'Gigabyte Technology X58 USB3 (Socket 1366) G X58 USB3',
    type: 'Laptops',
    specification: 'Specification 2',
    guarantee: {
      start: '2017-06-29 12:09:33',
      end: '2019-06-29 12:09:33'
    },
    price: [
      {value: 200, symbol: 'USD', isDefault: 0},
      {value: 5200, symbol: 'UAH', isDefault: 1}
    ],
    order: 2,
    date: '2017-06-29 12:09:33'
  },
  {
    id: 3,
    serialNumber: 123456789,
    isNew: 0,
    photo: 'pathToFile.jpg',
    title: 'Gigabyte Technology X58 USB3 (Socket 1366) G X58 USB3',
    type: 'Keyboards',
    specification: 'Specification 3',
    guarantee: {
      start: '2017-06-29 12:09:33',
      end: '2019-06-29 12:09:33'
    },
    price: [
      {value: 50, symbol: 'USD', isDefault: 0},
      {value: 1300, symbol: 'UAH', isDefault: 1}
    ],
    order: 1,
    date: '2017-06-29 12:09:33'
  },
  {
    id: 4,
    serialNumber: 123456789,
    isNew: 0,
    photo: 'pathToFile.jpg',
    title: 'Gigabyte Technology X58 USB3 (Socket 1366) G X58 USB3',
    type: 'Keyboards',
    specification: 'Specification 3',
    guarantee: {
      start: '2017-06-29 12:09:33',
      end: '2019-06-29 12:09:33'
    },
    price: [
      {value: 50, symbol: 'USD', isDefault: 0},
      {value: 1300, symbol: 'UAH', isDefault: 1}
    ],
    order: 4,
    date: '2017-06-29 12:09:33'
  }
];

// API роуты
app.get('/api/orders', (req, res) => {
  const ordersWithProducts = orders.map(order => ({
    ...order,
    products: products.filter(product => product.order === order.id)
  }));
  res.json(ordersWithProducts);
});

app.post('/api/orders', (req, res) => {
  const { title, description, date } = req.body;
  
  // Простая валидация
  if (!title || !description || !date) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  
  const newOrder = {
    id: Math.max(...orders.map(o => o.id)) + 1,
    title,
    description,
    date
  };
  
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const productData = req.body;
  
  // Простая валидация
  if (!productData.title || !productData.type || !productData.specification) {
    return res.status(400).json({ error: 'Обязательные поля не заполнены' });
  }
  
  const newProduct = {
    id: Math.max(...products.map(p => p.id)) + 1,
    ...productData
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.get('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  const orderWithProducts = {
    ...order,
    products: products.filter(product => product.order === orderId)
  };
  
  res.json(orderWithProducts);
});

app.delete('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  // Удаляем также все продукты этого заказа
  const productIndexes = [];
  for (let i = products.length - 1; i >= 0; i--) {
    if (products[i].order === orderId) {
      productIndexes.push(i);
    }
  }
  
  // Удаляем продукты
  productIndexes.forEach(index => {
    products.splice(index, 1);
  });
  
  // Удаляем заказ
  orders.splice(orderIndex, 1);
  
  res.json({ message: 'Order and related products deleted successfully' });
});

app.delete('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  res.json({ message: 'Product deleted successfully' });
});

app.put('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  // Обновляем продукт
  products[productIndex] = {
    ...products[productIndex],
    ...req.body,
    id: productId // Защищаем ID от изменения
  };
  
  res.json(products[productIndex]);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready`);
});