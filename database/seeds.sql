USE orders_products;

-- Вставка тестовых заказов (точно как в app.js)
INSERT INTO orders (id, title, description, date) VALUES
(1, 'Order 1', 'desc', '2017-06-29 12:09:33'),
(2, 'Order 2', 'desc', '2017-06-29 12:09:33'),
(3, 'Order 3', 'desc', '2017-06-29 12:09:33');

-- Вставка тестовых продуктов (точно как в app.js)
INSERT INTO products (id, serial_number, is_new, photo, title, type, specification, guarantee_start, guarantee_end, order_id, date) VALUES
(1, '1234', 1, 'pathToFile.jpg', 'Product 1', 'Monitors', 'Specification 1', '2017-06-29 12:09:33', '2017-06-29 12:09:33', 1, '2017-06-29 12:09:33'),
(2, '1235', 1, 'pathToFile.jpg', 'Product 1', 'Monitors', 'Specification 1', '2017-06-29 12:09:33', '2017-06-29 12:09:33', 2, '2017-06-29 12:09:33');

-- Вставка цен для продуктов (точно как в app.js)
INSERT INTO product_prices (product_id, value, symbol, is_default) VALUES
-- Product 1 prices
(1, 100.00, 'USD', 0),
(1, 2600.00, 'UAH', 1),
-- Product 2 prices  
(2, 100.00, 'USD', 0),
(2, 2600.00, 'UAH', 1);

-- Вставка тестовых пользователей (пароль: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2b$10$rXKSGZF.T8pATpyKvZW5.eF4h0r3.Bq9.L7FZiNZ9Y6E0GaZXRpay', 'admin'),
('Test User', 'user@example.com', '$2b$10$rXKSGZF.T8pATpyKvZW5.eF4h0r3.Bq9.L7FZiNZ9Y6E0GaZXRpay', 'user');