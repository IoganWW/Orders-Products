// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from '../locales';

const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'uk';
  
  // Проверяем localStorage
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && resources[savedLanguage as keyof typeof resources]) {
    return savedLanguage;
  }
  
  // Проверяем язык браузера  
  if (navigator.language) {
    const browserLang = navigator.language.split('-')[0];
    if (resources[browserLang as keyof typeof resources]) {
      return browserLang;
    }
  }
  
  // Дефолт
  return 'uk';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    
    ns: ['common', 'navigation', 'orders', 'products', 'users'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React уже экранирует
    },
    
    react: {
      useSuspense: false, // Отключаем suspense для SSR
    },
  });

export default i18n;