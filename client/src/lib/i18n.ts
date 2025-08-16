// client/src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Переводы по namespace'ам
const resources = {
  en: {
    // Общие переводы
    common: {
      loading: 'Loading...',
      error: 'Error!',
      login: 'Login',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      total: 'Total',
      actions: 'Actions',
      status: 'Status',
      created: 'Created',
      updated: 'Updated',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      // Дни недели
      monday: 'Monday',
      tuesday: 'Tuesday', 
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      // Месяцы (сокращенные)
      jan: 'Jan',
      feb: 'Feb',
      mar: 'Mar',
      apr: 'Apr',
      may: 'May',
      jun: 'Jun',
      jul: 'Jul',
      aug: 'Aug',
      sep: 'Sep',
      oct: 'Oct',
      nov: 'Nov',
      dec: 'Dec'
    },
    // Навигация
    navigation: {
      orders: 'Orders',
      groups: 'Groups',
      products: 'Products',
      users: 'Users',
      settings: 'Settings'
    },
    // Приходы
    orders: {
      title: 'Orders Management',
      addOrder: 'Add Order',
      orderDetails: 'Order Details',
      products: 'Products',
      deleteConfirm: 'Are you sure you want to delete this order?'
    },
    // Продукты  
    products: {
      title: 'Products Catalog',
      subtitle: 'Browse and filter products by category',
      addProduct: 'Add Product',
      category: 'Category',
      condition: 'Condition',
      price: 'Price',
      guarantee: 'Guarantee',
      all: 'All',
      new: 'New',
      used: 'Used',
      type: 'Type',
      specifications: 'Specifications',
      monitors: 'Monitors',
      laptops: 'Laptops',
      keyboards: 'Keyboards',
      phones: 'Phones',
      tablets: 'Tablets'
    },
    // Пользователи
    users: {
      title: 'System Users',
      subtitle: 'Manage users and their access rights',
      addUser: 'Add User',
      registration: 'Registration',
      lastUpdate: 'Last Update',
      totalUsers: 'Total users',
      admins: 'Administrators',
      admin: 'Administrator',
      manager: 'Manager', 
      user: 'User'
    }
  },
  uk: {
    common: {
      loading: 'Завантаження...',
      error: 'Помилка!',
      login: 'Увійти',
      logout: 'Вийти',
      save: 'Зберегти',
      cancel: 'Скасувати',
      delete: 'Видалити',
      edit: 'Редагувати',
      add: 'Додати',
      search: 'Пошук',
      total: 'Всього',
      actions: 'Дії',
      status: 'Статус',
      created: 'Створено',
      updated: 'Оновлено',
      name: "Ім'я",
      email: 'Email',
      role: 'Роль',
      // Дні тижня
      monday: 'Понеділок',
      tuesday: 'Вівторок',
      wednesday: 'Середа',
      thursday: 'Четвер',
      friday: "П'ятниця",
      saturday: 'Субота',
      sunday: 'Неділя',
      // Місяці (скорочені)
      jan: 'Січ',
      feb: 'Лют',
      mar: 'Бер',
      apr: 'Кві',
      may: 'Тра',
      jun: 'Чер',
      jul: 'Лип',
      aug: 'Сер',
      sep: 'Вер',
      oct: 'Жов',
      nov: 'Лис',
      dec: 'Гру'
    },
    navigation: {
      orders: 'Приходи',
      groups: 'Групи',
      products: 'Продукти', 
      users: 'Користувачі',
      settings: 'Налаштування'
    },
    orders: {
      title: 'Управління приходами',
      addOrder: 'Додати приход',
      orderDetails: 'Деталі приходу',
      deleteConfirm: 'Ви впевнені, що хочете видалити цей приход?'
    },
    products: {
      title: 'Каталог продуктів',
      subtitle: 'Перегляд та фільтрація продуктів за категоріями',
      addProduct: 'Додати продукт',
      category: 'Категорія',
      condition: 'Стан',
      price: 'Ціна',
      guarantee: 'Гарантія',
      all: 'Всі',
      new: 'Новий',
      used: 'Вживаний',
      type: 'Тип',
      specifications: 'Характеристики',
      monitors: 'Монітори',
      laptops: 'Ноутбуки',
      keyboards: 'Клавіатури',
      phones: 'Телефони',
      tablets: 'Планшети'
    },
    users: {
      title: 'Користувачі системи',
      subtitle: 'Управління користувачами та їх правами доступу',
      addUser: 'Додати користувача',
      registration: 'Реєстрація',
      lastUpdate: 'Останнє оновлення',
      totalUsers: 'Всього користувачів',
      admins: 'Адміністратори',
      admin: 'Адміністратор',
      manager: 'Менеджер',
      user: 'Користувач'
    }
  },
  ru: {
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка!',
      login: 'Войти',
      logout: 'Выйти',
      save: 'Сохранить',
      cancel: 'Отменить',
      delete: 'Удалить',
      edit: 'Редактировать',
      add: 'Добавить',
      search: 'Поиск',
      total: 'Всего',
      actions: 'Действия',
      status: 'Статус',
      created: 'Создано',
      updated: 'Обновлено',
      name: 'Имя',
      email: 'Email',
      role: 'Роль',
      // Дни недели
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье',
      // Месяцы (сокращенные)
      jan: 'Янв',
      feb: 'Фев',
      mar: 'Мар',
      apr: 'Апр',
      may: 'Май',
      jun: 'Июн',
      jul: 'Июл',
      aug: 'Авг',
      sep: 'Сен',
      oct: 'Окт',
      nov: 'Ноя',
      dec: 'Дек'
    },
    navigation: {
      orders: 'Приходы',
      groups: 'Группы',
      products: 'Продукты',
      users: 'Пользователи',
      settings: 'Настройки'
    },
    orders: {
      title: 'Управление приходами',
      addOrder: 'Добавить приход',
      orderDetails: 'Детали прихода',
      deleteConfirm: 'Вы уверены, что хотите удалить этот приход?'
    },
    products: {
      title: 'Каталог продуктов',
      subtitle: 'Просмотр и фильтрация продуктов по категориям',
      addProduct: 'Добавить продукт',
      category: 'Категория',
      condition: 'Состояние',
      price: 'Цена',
      guarantee: 'Гарантия',
      all: 'Все',
      new: 'Новый',
      used: 'Б/у',
      type: 'Тип',
      specifications: 'Характеристики',
      monitors: 'Мониторы',
      laptops: 'Ноутбуки',
      keyboards: 'Клавиатуры',
      phones: 'Телефоны',
      tablets: 'Планшеты'
    },
    users: {
      title: 'Пользователи системы',
      subtitle: 'Управление пользователями и их правами доступа',
      addUser: 'Добавить пользователя',
      registration: 'Регистрация',
      lastUpdate: 'Последнее обновление',
      totalUsers: 'Всего пользователей',
      admins: 'Администраторы',
      admin: 'Администратор',
      manager: 'Менеджер',
      user: 'Пользователь'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'uk', // Украинский по умолчанию
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    // Определяем namespace'ы
    ns: ['common', 'navigation', 'orders', 'products', 'users'],
    defaultNS: 'common', // По умолчанию используем 'common'
  });

export default i18n;