// hooks/useTypedTranslation.ts
import { useTranslation } from 'react-i18next';
import type { Language, Namespace, ResourceKey } from '../locales';

// Ключи с префиксом namespace
type WithNamespace<N extends Namespace, K extends string> = `${N}:${K}`;

// Все ключи с префиксом из массива namespaces
type PrefixedKeys<T extends Namespace[]> =
  T[number] extends infer U
    ? U extends Namespace
      ? WithNamespace<U, Extract<ResourceKey<U>, string>>
      : never
    : never;

// Ключи без префикса (только из первого namespace в массиве)
type UnprefixedKeys<T extends Namespace[]> =
  T extends [infer First, ...any[]]
    ? First extends Namespace
      ? ResourceKey<First>
      : never
    : never;

// Финальный тип ключей в зависимости от переданного namespace
type KeysFromNamespaces<T extends Namespace | Namespace[]> =
  T extends Namespace
    ? ResourceKey<T> // один namespace → только без префикса
    : T extends Namespace[]
      ? PrefixedKeys<T> | UnprefixedKeys<T> // массив → с префиксом + без префикса
      : never;

// Типизированные опции для переводов
interface TranslationOptions {
  [key: string]: any;
  count?: number;
  defaultValue?: string;
  returnObjects?: false; // Принудительно false для строк
  context?: string;
  replace?: Record<string, any>;
  lng?: Language;
  fallbackLng?: Language;
}

export const useTypedTranslation = <T extends Namespace | Namespace[] = 'common'>(
  namespaces?: T
) => {
  const { t: originalT, i18n, ready } = useTranslation(namespaces);

  // Типизированная функция перевода
  const t = <K extends KeysFromNamespaces<T>>(
    key: K,
    options?: TranslationOptions
  ): string => {
    return originalT(key as string, { returnObjects: false, ...options }) as string;
  };

  // Дополнительные утилиты
  const changeLanguage = async (lng: Language): Promise<void> => {
    await i18n.changeLanguage(lng);
    // Сохраняем в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lng);
    }
  };

  return {
    t,                                    // Типизированная функция перевода
    i18n,                                // Оригинальный i18n объект  
    ready,                               // Готовность переводов
    language: i18n.language as Language, // Текущий язык с типизацией
    changeLanguage,                      // Улучшенная смена языка с сохранением
    isLanguage: (lng: Language) => i18n.language === lng,
    
    // Дебаг утилиты
    getAvailableLanguages: () => Object.keys(i18n.store.data) as Language[],
    hasTranslation: (key: string, ns?: Namespace) => i18n.exists(key, { ns }),
  };
};


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
