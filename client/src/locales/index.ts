// locales/index.ts - Решение для Next.js/Webpack
const languages = ['en', 'uk', 'ru'] as const;
const namespaces = ['common', 'navigation', 'orders', 'products', 'users'] as const;

export type Language = (typeof languages)[number];
export type Namespace = (typeof namespaces)[number];

// 📦 Статические импорты для всех файлов (работает везде!)
import enCommon from './en/common.json';
import enNavigation from './en/navigation.json';
import enOrders from './en/orders.json';
import enProducts from './en/products.json';
import enUsers from './en/users.json';

import ukCommon from './uk/common.json';
import ukNavigation from './uk/navigation.json';
import ukOrders from './uk/orders.json';
import ukProducts from './uk/products.json';
import ukUsers from './uk/users.json';

import ruCommon from './ru/common.json';
import ruNavigation from './ru/navigation.json';
import ruOrders from './ru/orders.json';
import ruProducts from './ru/products.json';
import ruUsers from './ru/users.json';

const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    orders: enOrders,
    products: enProducts,
    users: enUsers,
  },
  uk: {
    common: ukCommon,
    navigation: ukNavigation,
    orders: ukOrders,
    products: ukProducts,
    users: ukUsers,
  },
  ru: {
    common: ruCommon,
    navigation: ruNavigation,
    orders: ruOrders,
    products: ruProducts,
    users: ruUsers,
  },
} as const;

// Типы для автокомплита в хуке
export type ResourceKey<T extends Namespace> = keyof (typeof resources)['en'][T];

export default resources;

// Дебаг функция для проверки загруженных переводов
export const debugTranslations = () => {
  console.log('Loaded translations:', resources);
  
  languages.forEach(lang => {
    namespaces.forEach(ns => {
      const keys = Object.keys(resources[lang][ns] || {});
      console.log(`📝 ${lang}/${ns}: ${keys.length} keys`);
    });
  });
};