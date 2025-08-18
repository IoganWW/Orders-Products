const db = require('./database');

const getAllOrders = async () => {
  return await db.getAllOrders();
};

const getOrderById = async (orderId, userId = null) => {
  // Если указан userId, проверяем права доступа
  if (userId) {
    const order = await db.getOrderById(orderId);
    if (order && order.user_id !== userId) {
      return null; // Нет доступа
    }
  }
  
  return await db.getOrderById(orderId);
};

const createOrder = async (orderData) => {
  const { title, description, date, userId } = orderData;
  
  return await db.createOrder({ 
    title, 
    description, 
    date,
    user_id: userId 
  });
};

const deleteOrder = async (orderId) => {
  try {
    // Просто проверяем существование
    const order = await db.getOrderById(orderId);
    if (!order) {
      return false;
    }
    
    await db.deleteOrder(orderId);
    return true;
  } catch (error) {
    console.error('Error in deleteOrder service:', error);
    throw error;
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  deleteOrder
};
