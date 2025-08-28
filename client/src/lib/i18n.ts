// client/src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
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

// Конфигурация детектора языка
const detectionOptions = {
  order: ['localStorage', 'navigator', 'htmlTag'],
  lookupLocalStorage: 'language',
  caches: ['localStorage'],
  excludeCacheFor: ['cimode'], // не кешировать в режиме разработки
};

i18n
  .use(LanguageDetector) // Добавляем автодетекцию
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',

    detection: detectionOptions,
    
    ns: ['common', 'navigation', 'orders', 'products', 'users'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React уже экранирует
    },
    
    react: {
      useSuspense: false, // Отключаем suspense для SSR
      // Добавляем для лучшей совместимости с SSR
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '', // Что показывать для пустых узлов
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },

    // Настройки производительности
    initImmediate: false, // Для SSR
    cleanCode: true,
    
    // Дополнительные опции
    returnEmptyString: false, // Возвращать fallback вместо пустой строки
    returnNull: false,
    returnObjects: false,
    
    // Настройки плюрализации
    pluralSeparator: '_',
    contextSeparator: '_',
  });

export default i18n;


// Дополнительная утилита для серверного рендеринга
export const initI18nForSSR = async (language?: string) => {
  if (!i18n.isInitialized) {
    await i18n.init();
  }
  
  if (language && language !== i18n.language) {
    await i18n.changeLanguage(language);
  }
  
  return i18n;
};