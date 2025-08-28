// client/src/hooks/useTypedTranslation.ts - Расширенная версия
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';
import type { Language, Namespace, ResourceKey } from '../locales';

// Существующие типы остаются без изменений...
type WithNamespace<N extends Namespace, K extends string> = `${N}:${K}`;

type PrefixedKeys<T extends Namespace[]> =
  T[number] extends infer U
    ? U extends Namespace
      ? WithNamespace<U, Extract<ResourceKey<U>, string>>
      : never
    : never;

type UnprefixedKeys<T extends Namespace[]> =
  T extends [infer First, ...any[]]
    ? First extends Namespace
      ? ResourceKey<First>
      : never
    : never;

type KeysFromNamespaces<T extends Namespace | Namespace[]> =
  T extends Namespace
    ? ResourceKey<T>
    : T extends Namespace[]
      ? PrefixedKeys<T> | UnprefixedKeys<T>
      : never;

// Расширенные опции для переводов
interface TranslationOptions {
  [key: string]: any;
  count?: number;
  defaultValue?: string;
  returnObjects?: false;
  context?: string;
  replace?: Record<string, any>;
  lng?: Language;
  fallbackLng?: Language;
  // Новые опции
  ordinal?: boolean; // для порядковых числительных
  postProcess?: string | string[];
  interpolation?: {
    escape?: boolean;
    escapeValue?: boolean;
  };
}

// Интерфейс для форматирования
interface FormatOptions {
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export const useTypedTranslation = <T extends Namespace | Namespace[] = 'common'>(
  namespaces?: T
) => {
  const { t: originalT, i18n, ready } = useTranslation(namespaces);

  // Типизированная функция перевода
  const t = useCallback(<K extends KeysFromNamespaces<T>>(
    key: K,
    options?: TranslationOptions
  ): string => {
    try {
      return originalT(key as string, { returnObjects: false, ...options }) as string;
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return String(key);
    }
  }, [originalT]);

  // Улучшенная функция смены языка
  const changeLanguage = useCallback(async (lng: Language): Promise<void> => {
    try {
      await i18n.changeLanguage(lng);
      
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', lng);
        
        // Обновляем lang атрибут документа для accessibility
        document.documentElement.lang = lng;
        
        // Опционально обновляем dir атрибут для RTL языков
        // document.documentElement.dir = isRTL(lng) ? 'rtl' : 'ltr';
      }
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  }, [i18n]);

  // Функция для проверки наличия перевода с fallback
  const hasTranslation = useCallback((
    key: string, 
    ns?: Namespace,
    options?: { includeFallback?: boolean }
  ): boolean => {
    const exists = i18n.exists(key, { ns });
    if (exists || !options?.includeFallback) return exists;
    
    // Проверяем fallback язык
    const fallbackExists = i18n.exists(key, { 
      ns, 
      lng: i18n.options.fallbackLng as Language 
    });
    return fallbackExists;
  }, [i18n]);

  // Функция для форматирования чисел
  const formatNumber = useCallback((
    number: number, 
    options?: FormatOptions
  ): string => {
    try {
      return new Intl.NumberFormat(i18n.language, options).format(number);
    } catch (error) {
      console.warn('Number formatting error:', error);
      return String(number);
    }
  }, [i18n.language]);

  // Функция для форматирования дат
  const formatDate = useCallback((
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    try {
      const dateObj = typeof date === 'string' || typeof date === 'number' 
        ? new Date(date) 
        : date;
      return new Intl.DateTimeFormat(i18n.language, options).format(dateObj);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return String(date);
    }
  }, [i18n.language]);

  // Функция для плюрализации
  const plural = useCallback(<K extends KeysFromNamespaces<T>>(
    key: K,
    count: number,
    options?: Omit<TranslationOptions, 'count'>
  ): string => {
    return t(key, { ...options, count });
  }, [t]);

  // Функция для получения массива переводов
  const getTranslationArray = useCallback((
    keyPrefix: string,
    ns?: Namespace
  ): string[] => {
    const result: string[] = [];
    let index = 0;
    
    while (true) {
      const key = `${keyPrefix}.${index}`;
      if (!hasTranslation(key, ns)) break;
      result.push(originalT(key, { ns }));
      index++;
    }
    
    return result;
  }, [hasTranslation, originalT]);

  // Эффект для отслеживания изменений языка
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.debug(`Language changed to: ${lng}`);
      
      // Можно добавить дополнительную логику, например:
      // - обновление заголовков HTTP
      // - отправка аналитики
      // - обновление мета-тегов
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  return {
    // Основные функции
    t,
    plural,
    i18n,
    ready,
    
    // Информация о языке
    language: i18n.language as Language,
    isLanguage: (lng: Language) => i18n.language === lng,
    
    // Управление языками
    changeLanguage,
    getAvailableLanguages: () => Object.keys(i18n.store.data) as Language[],
    
    // Проверки и утилиты
    hasTranslation,
    getTranslationArray,
    
    // Форматирование
    formatNumber,
    formatDate,
    
    // Дебаг утилиты (только в development)
    ...(process.env.NODE_ENV === 'development' && {
      debugInfo: {
        loadedNamespaces: i18n.loadedNamespaces,
        loadedLanguages: i18n.loadedLanguages,
        missingKeys: i18n.store?.data?.[i18n.language]?.translation || {},
      }
    })
  };
};


// Дополнительный хук для работы с формами
/*export const useTranslatedValidation = () => {
  const { t } = useTypedTranslation('common');
  
  return {
    required: (field?: string) => t('validation.required', { 
      field: field || t('validation.field') 
    }),
    email: () => t('validation.email'),
    minLength: (min: number) => t('validation.minLength', { min }),
    maxLength: (max: number) => t('validation.maxLength', { max }),
    pattern: (pattern: string) => t('validation.pattern', { pattern }),
  };
};*/


/* 
Примеры использования:

// Один namespace
const { t } = useTypedTranslation('navigation');
t('home') // ✅ Автокомплит из navigation.*

// Несколько namespaces  
const { t } = useTypedTranslation(['common', 'navigation']);
t('save')           // ✅ Из common (первый namespace)
t('navigation:home') // ✅ С префиксом
t('common:loading')  // ✅ С префиксом

// С опциями
t('welcome', { defaultValue: 'Hello!', count: 5 })
*/
