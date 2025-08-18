const db = require('./database');

const getAllProducts = async () => {
  return await db.getAllProducts();
};

const getProductById = async (productId) => {
  return await db.getProductById(productId);
};

const createProduct = async (productData) => {
  // Извлекаем нужные поля и преобразуем формат
  const { 
    title, 
    type, 
    specification, 
    guarantee_start, 
    guarantee_end, 
    order_id,
    order, // поддержка обоих форматов
    prices,
    price, // поддержка обоих форматов
    serialNumber,
    isNew,
    userId 
  } = productData;

  // Используем order_id или order
  const actualOrderId = order_id || order;
  const actualPrices = prices || price || [];
  
  // Генерируем серийный номер если нет
  const serial_number = serialNumber || Date.now();
  
  // Преобразуем тип для ENUM БД
  const dbType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

  // Вызываем существующий метод БД в правильном формате
  return await db.createProduct({
    serialNumber: serial_number,
    isNew: isNew || 1,
    photo: 'pathToFile.jpg',
    title,
    type: dbType,
    specification,
    guarantee: {
      start: guarantee_start || new Date().toISOString().slice(0, 19).replace('T', ' '),
      end: guarantee_end || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    },
    order: actualOrderId,
    date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    price: actualPrices.map(p => ({
      value: parseFloat(p.value),
      symbol: p.symbol,
      isDefault: p.isDefault ? 1 : 0
    }))
  });
};

const updateProduct = async (productId, updateData, userId) => {
  try {
    // Проверяем существование продукта
    const product = await db.getProductById(productId);
    if (!product) {
      console.log(`Product ${productId} not found`);
      return null;
    }

    const { 
      title, 
      type, 
      specification, 
      guarantee_start, 
      guarantee_end, 
      prices,
      serialNumber,
      isNew
    } = updateData;
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Преобразуем тип если передан
      const dbType = type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : product.type;

      // Обновляем основные данные продукта
      await connection.execute(`
        UPDATE products 
        SET 
          serial_number = ?, 
          is_new = ?, 
          title = ?, 
          type = ?, 
          specification = ?, 
          guarantee_start = ?, 
          guarantee_end = ?, 
          updated_at = NOW()
        WHERE id = ?
      `, [
        serialNumber || product.serial_number,
        isNew !== undefined ? (isNew ? 1 : 0) : product.is_new,
        title || product.title,
        dbType,
        specification || product.specification,
        guarantee_start !== undefined ? guarantee_start : product.guarantee_start,
        guarantee_end !== undefined ? guarantee_end : product.guarantee_end,
        productId
      ]);

      // Обновляем цены если они переданы
      if (prices && Array.isArray(prices)) {
        // Удаляем старые цены
        await connection.execute(`DELETE FROM product_prices WHERE product_id = ?`, [productId]);
        
        // Добавляем новые цены
        for (const price of prices) {
          const { value, symbol, isDefault = false } = price;
          
          if (value && symbol) {
            await connection.execute(`
              INSERT INTO product_prices (product_id, value, symbol, is_default, created_at)
              VALUES (?, ?, ?, ?, NOW())
            `, [productId, parseFloat(value), symbol, isDefault ? 1 : 0]);
          }
        }
      }

      await connection.commit();

      // Получаем обновленный продукт
      const updatedProduct = await getProductById(productId);
      console.log('Product updated successfully:', updatedProduct);
      
      return updatedProduct;
    } catch (error) {
      await connection.rollback();
      console.error('Error in product update transaction:', error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in updateProduct service:', error);
    throw error;
  }
};

const deleteProduct = async (productId, userId = null) => {
  try {
    // Проверяем существование продукта
    const product = await db.getProductById(productId);
    if (!product) {
      console.log(`Product ${productId} not found`);
      return false;
    }
    
    // Удаляем продукт (цены удалятся автоматически через CASCADE)
    await db.deleteProduct(productId);
    console.log(`Product ${productId} deleted successfully`);
    return true;
  } catch (error) {
    console.error('Error in deleteProduct service:', error);
    throw error;
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};