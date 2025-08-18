const productsService = require('../services/productsService');

const getAllProducts = async (req, res, next) => {
  try {
    const products = await productsService.getAllProducts();
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await productsService.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
    };
    
    console.log('Creating product:', productData);
    
    const newProduct = await productsService.createProduct(productData);
    console.log('Product created:', newProduct);
    
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    // Если ошибка валидации или доступа, возвращаем 400
    if (error.message.includes('Missing required fields') || 
        error.message.includes('not found') ||
        error.message.includes('Access denied')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const updateData = req.body;
    
    const updatedProduct = await productsService.updateProduct(productId, updateData, req.user.id);
    
    if (!updatedProduct) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found or access denied' 
      });
    }
    
    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    
    // Убираем проверку userId для обратной совместимости
    const deleted = await productsService.deleteProduct(productId);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};