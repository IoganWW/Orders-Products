// server/src/models/Order.js
const db = require('../services/database');

class Order {
  static async findAll() {
    const sql = `
      SELECT 
        o.id, o.title, o.description, o.date,
        o.created_at, o.updated_at
      FROM orders o
      ORDER BY o.date DESC
    `;
    return await db.query(sql);
  }

  static async findById(id) {
    const sql = `
      SELECT 
        o.id, o.title, o.description, o.date,
        o.created_at, o.updated_at
      FROM orders o
      WHERE o.id = ?
    `;
    const orders = await db.query(sql, [id]);
    return orders[0];
  }

  static async findWithProducts(id) {
    const order = await this.findById(id);
    if (!order) return null;

    // Получаем продукты заказа с ценами
    const productsSql = `
      SELECT 
        p.id, p.serial_number as serialNumber, p.is_new as isNew,
        p.photo, p.title, pt.name as type, p.specification,
        p.guarantee_start, p.guarantee_end, p.date,
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
      WHERE p.order_id = ?
      GROUP BY p.id
      ORDER BY p.created_at ASC
    `;
    
    const products = await db.query(productsSql, [id]);
    
    // Обрабатываем результат
    order.products = products.map(product => ({
      ...product,
      guarantee: {
        start: product.guarantee_start,
        end: product.guarantee_end
      },
      price: JSON.parse(product.prices)
    }));

    return order;
  }

  static async findAllWithProducts() {
    const orders = await this.findAll();
    
    for (let order of orders) {
      const orderWithProducts = await this.findWithProducts(order.id);
      order.products = orderWithProducts ? orderWithProducts.products : [];
    }
    
    return orders;
  }

  static async create(orderData) {
    const { title, description, date } = orderData;
    const sql = `
      INSERT INTO orders (title, description, date)
      VALUES (?, ?, ?)
    `;
    const result = await db.query(sql, [title, description, date]);
    return await this.findById(result.insertId);
  }

  static async update(id, orderData) {
    const { title, description, date } = orderData;
    const sql = `
      UPDATE orders 
      SET title = ?, description = ?, date = ?
      WHERE id = ?
    `;
    await db.query(sql, [title, description, date, id]);
    return await this.findById(id);
  }

  static async delete(id) {
    // Проверяем существование заказа
    const order = await this.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Удаляем заказ (продукты удалятся автоматически через CASCADE)
    const sql = 'DELETE FROM orders WHERE id = ?';
    await db.query(sql, [id]);
    
    return { message: 'Order deleted successfully', deletedOrder: order };
  }

  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as totalOrders,
        SUM(product_count.count) as totalProducts,
        AVG(product_count.count) as avgProductsPerOrder
      FROM orders o
      LEFT JOIN (
        SELECT order_id, COUNT(*) as count
        FROM products
        GROUP BY order_id
      ) product_count ON o.id = product_count.order_id
    `;
    const stats = await db.query(sql);
    return stats[0];
  }
}

module.exports = Order;