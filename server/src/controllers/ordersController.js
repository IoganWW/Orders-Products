const ordersService = require('../services/ordersService');

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await ordersService.getAllOrders();
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await ordersService.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { title, description, date } = req.body;
    
    const newOrder = await ordersService.createOrder({ 
      title, 
      description, 
      date,
      userId: req.user.id 
    });
    
    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id);
    
    const deleted = await ordersService.deleteOrder(orderId, req.user.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found or access denied' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Order and related products deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  deleteOrder
};