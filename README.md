🚀 Orders & Products Management System

SPA-приложение для управления приходами и продуктами на уровне

Show Image
Show Image
Show Image
Show Image
Show Image
📖 Описание проекта
Полнофункциональная система управления приходами товаров и продуктами с современным веб-интерфейсом, real-time уведомлениями и полной контейнеризацией.
🎯 Основные возможности

📦 Управление приходами - создание, просмотр, удаление приходов товаров
🛍️ Управление продуктами - добавление, редактирование, фильтрация продуктов
⚡ Real-time обновления - счетчик активных пользователей через WebSocket
📱 Адаптивный дизайн - полная совместимость с мобильными устройствами
🔄 Валидация форм - клиентская и серверная валидация данных
📊 Dashboard - статистика и аналитика по приходам и продуктам

🛠️ Технологический стек
Frontend (Junior+)

Next.js 15 - React framework с SSR
TypeScript - типизированный JavaScript
Redux Toolkit - управление состоянием
Bootstrap 5 - CSS фреймворк
Animate.css - CSS анимации
Socket.io Client - WebSocket соединения

Backend

Node.js + Express.js - серверная часть
MySQL 8 - реляционная база данных
Socket.io - real-time коммуникация
bcryptjs - хеширование паролей
JWT - аутентификация (готово к использованию)

DevOps & Infrastructure

Docker + Docker Compose - контейнеризация
Nginx - reverse proxy и load balancer
Git - система контроля версий

🚀 Быстрый старт
Предварительные требования

Docker Desktop - для запуска в контейнерах
Git - для клонирования репозитория
ИЛИ
Node.js 18+ - для локальной разработки
MySQL 8+ - для локальной БД

🐳 Запуск с Docker (рекомендуется)
bash# 1. Клонирование репозитория
git clone <your-repo-url>
cd orders-products-app

# 2. Запуск в режиме разработки
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# 3. Запуск в production режиме
docker-compose --profile production up --build -d
💻 Локальная разработка
bash# 1. Установка зависимостей для сервера
cd server
npm install

# 2. Установка зависимостей для клиента
cd ../client  
npm install

# 3. Настройка базы данных
mysql -u root -p < server/database/schema.sql
mysql -u root -p < server/database/seeds.sql

# 4. Настройка переменных окружения
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# 5. Запуск сервера (терминал 1)
cd server
npm run dev

# 6. Запуск клиента (терминал 2)  
cd client
npm run dev
🌐 Доступ к приложению
Development режим:

Frontend: http://localhost:3000
Backend API: http://localhost:3001
API Health: http://localhost:3001/api/health
Database: localhost:3307

Production режим:

Application: http://localhost (через Nginx)
API: http://localhost/api
Database: localhost:3306

📁 Структура проекта
orders-products-app/
├── 🐳 docker-compose.yml           # Production Docker setup
├── 🐳 docker-compose.dev.yml       # Development override  
├── 📄 README.md                    # Документация проекта
├── 🙈 .gitignore                   # Git ignore правила
│
├── 📱 client/                      # Next.js Frontend
│   ├── 🐳 Dockerfile               # Client container
│   ├── ⚙️ next.config.js          # Next.js конфигурация
│   ├── 📦 package.json            # Зависимости
│   └── 📁 src/                    # Исходный код
│       ├── 📁 app/                # App Router (страницы)
│       ├── 📁 components/         # React компоненты
│       ├── 📁 hooks/              # Custom hooks
│       ├── 📁 store/              # Redux store
│       ├── 📁 types/              # TypeScript типы
│       └── 📁 utils/              # Утилиты
│
├── 🔧 server/                      # Express Backend
│   ├── 🐳 Dockerfile               # Server container  
│   ├── 📦 package.json            # Зависимости
│   ├── 📁 src/                    # Исходный код
│   │   ├── 📄 app.js              # Главный файл сервера
│   │   └── 📁 services/           # Сервисы (БД, авторизация)
│   └── 📁 database/               # Схема и данные БД
│       ├── 🗄️ schema.sql          # Схема базы данных
│       └── 🌱 seeds.sql           # Тестовые данные
│
└── 🌐 nginx/                       # Nginx (Production)
    └── ⚙️ nginx.conf              # Конфигурация Nginx
🔧 Конфигурация
Server Environment (.env)
bashNODE_ENV=development
PORT=3001
DB_HOST=mysql                    # localhost для локальной разработки
DB_USER=dev_user
DB_PASSWORD=dev_password
DB_NAME=orders_products_dev
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_here
SESSION_TIMEOUT_MINUTES=30
SESSION_CLEANUP_INTERVAL=5
Client Environment (.env.local)
bashNEXT_PUBLIC_SERVER_URL=http://localhost:3001
NODE_ENV=development
📊 API Endpoints
Orders (Приходы)
httpGET    /api/orders          # Получить все приходы
POST   /api/orders          # Создать новый приход  
GET    /api/orders/:id      # Получить приход по ID
DELETE /api/orders/:id      # Удалить приход
Products (Продукты)
httpGET    /api/products        # Получить все продукты
POST   /api/products        # Создать новый продукт
DELETE /api/products/:id    # Удалить продукт
PUT    /api/products/:id    # Обновить продукт
System
httpGET    /api/health          # Статус системы
GET    /api/product-types   # Типы продуктов
GET    /api/currencies      # Валюты
🗄️ База данных
Схема БД (MySQL)

orders - приходы товаров
products - продукты в приходах
product_prices - цены продуктов в разных валютах
users - пользователи системы
user_sessions - активные сессии для WebSocket

Связи

products.order_id → orders.id (один ко многим)
product_prices.product_id → products.id (один ко многим)
user_sessions.user_id → users.id (один ко многим)

🧪 Тестирование
bash# Запуск unit тестов (фронтенд)
cd client
npm test

# Запуск unit тестов (бекенд)  
cd server
npm test

# Проверка типов TypeScript
cd client  
npm run type-check
🚢 Деплой
Production с Docker
bash# Сборка и запуск production версии
docker-compose --profile production up --build -d

# Проверка логов
docker-compose logs -f

# Остановка
docker-compose down
Деплой на VPS
bash# 1. Клонирование на сервер
git clone <repo-url>
cd orders-products-app

# 2. Настройка переменных окружения
cp server/.env.example server/.env
# Отредактируйте server/.env под production

# 3. Запуск с SSL (опционально)
# Поместите SSL сертификаты в nginx/ssl/
docker-compose --profile production up -d
🔍 Troubleshooting
Проблемы с базой данных
bash# Проверка подключения к БД
docker exec -it orders_products_mysql mysql -u dev_user -pdev_password orders_products_dev

# Пересоздание БД
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
Проблемы с Docker
bash# Полная очистка Docker
docker system prune -a
docker volume prune -f

# Пересборка без кеша
docker-compose build --no-cache
🤝 Участие в разработке

Fork репозитория
Создайте feature branch (git checkout -b feature/amazing-feature)
Commit изменения (git commit -m 'Add amazing feature')
Push в branch (git push origin feature/amazing-feature)
Создайте Pull Request

📝 Changelog
v1.0.0 (Текущая версия)

✅ Базовый CRUD для приходов и продуктов
✅ Real-time счетчик активных пользователей
✅ Валидация форм на клиенте и сервере
✅ Адаптивный дизайн по макету
✅ Docker контейнеризация
✅ MySQL база данных с отношениями

📄 Лицензия
Этот проект создан в образовательных целях как тестовое задание.
👥 Авторы

Ivan Kulinich - GitHub

🆘 Поддержка
Если у вас есть вопросы или проблемы:

Проверьте раздел Troubleshooting
Создайте Issue
Напишите на email: ivankulini4@gmail.com


⭐ Если проект оказался полезным, поставьте звездочку!