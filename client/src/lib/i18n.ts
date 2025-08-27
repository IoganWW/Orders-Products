// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from '../locales';

const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'uk';
  
  // 1️⃣ Проверяем localStorage
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && resources[savedLanguage as keyof typeof resources]) {
    return savedLanguage;
  }
  
  // 2️⃣ Проверяем язык браузера  
  if (navigator.language) {
    const browserLang = navigator.language.split('-')[0];
    if (resources[browserLang as keyof typeof resources]) {
      return browserLang;
    }
  }
  
  // 3️⃣ Дефолт
  return 'uk';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    
    // Настройки namespace
    ns: ['common', 'navigation', 'orders', 'products', 'users'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React уже экранирует
    },
    
    // Дополнительные настройки
    react: {
      useSuspense: false, // Отключаем suspense для SSR
    },
    
    // Для отладки (убрать в продакшене)
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;