-- server/database/seeds.sql
USE orders_products_dev;

-- Вставка тестовых заказов (точно как в app.js)
INSERT IGNORE INTO orders (id, title, description, date) VALUES
(1, 'Order 1', 'Длинное предлинное длинночнее длиннючее название прихода', '2017-06-29 12:09:33'),
(2, 'Order 2', 'Длинное название прихода', '2017-06-29 12:09:33'),
(3, 'Order 3', 'Длинное предлинное длинночнее название прихода', '2017-06-29 12:09:33');

-- Вставка тестовых продуктов (точно как в app.js)
INSERT IGNORE INTO products (id, serial_number, is_new, photo, title, type, specification, guarantee_start, guarantee_end, order_id, date) VALUES
(1, '1234', 1, 'pathToFile.jpg', 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3', 'Monitors', 'Specification 1', '2017-06-29 12:09:33', '2019-06-29 12:09:33', 1, '2017-06-29 12:09:33'),
(2, '1235', 1, 'pathToFile.jpg', 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3', 'Monitors', 'Specification 1', '2017-06-29 12:09:33', '2019-06-29 12:09:33', 2, '2017-06-29 12:09:33'),
(3, '1236', 0, 'pathToFile.jpg', 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3', 'Keyboards', 'Specification 3', '2017-06-29 12:09:33', '2019-06-29 12:09:33', 1, '2017-06-29 12:09:33'),
(4, '1237', 1, 'pathToFile.jpg', 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3', 'Phones', 'Specification 4', '2017-06-29 12:09:33', '2019-06-29 12:09:33', 3, '2017-06-29 12:09:33');

-- Вставка цен для продуктов (точно как в app.js)
INSERT IGNORE INTO product_prices (product_id, value, symbol, is_default) VALUES
-- Product 1 prices
(1, 100.00, 'USD', 0),
(1, 2600.00, 'UAH', 1),
-- Product 2 prices  
(2, 200.00, 'USD', 0),
(2, 5200.00, 'UAH', 1),
-- Product 3 prices
(3, 50.00, 'USD', 0),
(3, 1300.00, 'UAH', 1),
-- Product 4 prices
(4, 300.00, 'USD', 0),
(4, 7800.00, 'UAH', 1);

-- Вставка тестовых пользователей (пароль: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2b$10$rXKSGZF.T8pATpyKvZW5.eF4h0r3.Bq9.L7FZiNZ9Y6E0GaZXRpay', 'admin'),
('Test User', 'user@example.com', '$2b$10$rXKSGZF.T8pATpyKvZW5.eF4h0r3.Bq9.L7FZiNZ9Y6E0GaZXRpay', 'user');