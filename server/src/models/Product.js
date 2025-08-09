// server/src/models/Product.js
const db = require('../services/database');

class Product {
  static async findAll() {
    const sql = `
      SELECT 
        p.id, p.serial_number as serialNumber, p.is_new as isNew,
        p.photo, p.title, pt.name as type, p.specification,
        p.guarantee_start, p.guarantee_end, p.order_id as order, p.date,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'value', pp.value,
            'symbol', c.symbol,
            'isDefault', pp.is_default
          )
        ) as prices
      FROM products p
      JOIN product_types pt ON p.type_id = pt.id
      JOIN product_prices pp ON p.id = pp.product_id
      JOIN currencies c ON pp.currency_id = c.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    
    const products = await db.query(sql);
    
    return products.map(product => ({
      ...product,
      guarantee: {
        start: product.guarantee_start,
        end: product.guarantee_end
      },
      price: JSON.parse(product.prices)
    }));
  }

  static async findById(id) {
    const sql = `
      SELECT 
        p.id, p.serial_number as serialNumber, p.is_new as isNew,
        p.photo, p.title, pt.name as type, p.specification,
        p.guarantee_start, p.guarantee_end, p.order_id as order, p.date
      FROM products p
      JOIN product_types pt ON p.type_id = pt.id
      WHERE p.id = ?
    `;
    const products = await db.query(sql, [id]);
    if (!products[0]) return null;

    // Получаем цены
    const pricesSql = `
      SELECT pp.value, c.symbol, pp.is_default as isDefault
      FROM product_prices pp
      JOIN currencies c ON pp.currency_id = c.id
      WHERE pp.product_id = ?
    `;
    const prices = await db.query(pricesSql, [id]);

    const product = products[0];
    product.guarantee = {
      start: product.guarantee_start,
      end: product.guarantee_end
    };
    product.price = prices;

    return product;
  }

  static async create(productData) {
    return await db.transaction(async (connection) => {
      const {
        serialNumber, isNew, photo, title, type, specification,
        guaranteeStart, guaranteeEnd, order, date, prices
      } = productData;

      // Получаем ID типа продукта
      const typeResult = await connection.execute(
        'SELECT id FROM product_types WHERE name = ?',
        [type]
      );
      
      if (typeResult[0].length === 0) {
        throw new Error(`Product type "${type}" not found`);
      }
      
      const typeId = typeResult[0][0].id;

      // Создаем продукт
      const productSql = `
        INSERT INTO products 
        (serial_number, is_new, photo, title, type_id, specification, 
         guarantee_start, guarantee_end, order_id, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const productResult = await connection.execute(productSql, [
        serialNumber, isNew, photo, title, typeId, specification,
        guaranteeStart, guaranteeEnd, order, date
      ]);

      const productId = productResult[0].insertId;

      // Добавляем цены
      if (prices && prices.length > 0) {
        for (const price of prices) {
          // Получаем ID валюты
          const currencyResult = await connection.execute(
            'SELECT id FROM currencies WHERE symbol = ?',
            [price.symbol]
          );
          
          if (currencyResult[0].length > 0) {
            const currencyId = currencyResult[0][0].id;
            
            await connection.execute(
              'INSERT INTO product_prices (product_id, currency_id, value, is_default) VALUES (?, ?, ?, ?)',
              [productId, currencyId, price.value, price.isDefault]
            );
          }
        }
      }

      return await this.findById(productId);
    });
  }

  static async update(id, productData) {
    return await db.transaction(async (connection) => {
      const {
        serialNumber, isNew, photo, title, type, specification,
        guaranteeStart, guaranteeEnd, order, prices
      } = productData;

      // Получаем ID типа продукта
      const typeResult = await connection.execute(
        'SELECT id FROM product_types WHERE name = ?',
        [type]
      );
      
      if (typeResult[0].length === 0) {
        throw new Error(`Product type "${type}" not found`);
      }
      
      const typeId = typeResult[0][0].id;

      // Обновляем продукт
      const productSql = `
        UPDATE products 
        SET serial_number = ?, is_new = ?, photo = ?, title = ?, type_id = ?, 
            specification = ?, guarantee_start = ?, guarantee_end = ?, order_id = ?
        WHERE id = ?
      `;
      
      await connection.execute(productSql, [
        serialNumber, isNew, photo, title, typeId, specification,
        guaranteeStart, guaranteeEnd, order, id
      ]);

      // Обновляем цены (удаляем старые и добавляем новые)
      await connection.execute('DELETE FROM product_prices WHERE product_id = ?', [id]);
      
      if (prices && prices.length > 0) {
        for (const price of prices) {
          const currencyResult = await connection.execute(
            'SELECT id FROM currencies WHERE symbol = ?',
            [price.symbol]
          );
          
          if (currencyResult[0].length > 0) {
            const currencyId = currencyResult[0][0].id;
            
            await connection.execute(
              'INSERT INTO product_prices (product_id, currency_id, value, is_default) VALUES (?, ?, ?, ?)',
              [productId, currencyId, price.value, price.isDefault]
            );
          }
        }
      }

      return await this.findById(id);
    });
  }

  static async delete(id) {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Удаляем продукт (цены удалятся автоматически через CASCADE)
    const sql = 'DELETE FROM products WHERE id = ?';
    await db.query(sql, [id]);
    
    return { message: 'Product deleted successfully', deletedProduct: product };
  }

  static async getProductTypes() {
    const sql = 'SELECT name FROM product_types ORDER BY name';
    const types = await db.query(sql);
    return types.map(type => type.name);
  }

  static async getCurrencies() {
    const sql = 'SELECT id, code, symbol, name, is_default FROM currencies ORDER BY is_default DESC, name';
    return await db.query(sql);
  }
}

module.exports = Product;