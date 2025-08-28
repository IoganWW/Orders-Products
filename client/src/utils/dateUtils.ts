// client/src/utils/dateUtils.ts
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

// Базовые утилиты
export const formatDate = (dateString: string, locale: string = 'uk') => {
  if (!dateString?.trim()) {
    return {
      short: 'N/A',
      long: 'Invalid Date',
      full: 'N/A',
      iso: new Date().toISOString().slice(0, 16),
    };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      short: 'N/A',
      long: 'Invalid Date', 
      full: 'N/A',
      iso: new Date().toISOString().slice(0, 16),
    };
  }
  
  try {
    return {
      short: date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      }),
      long: date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',    // 👈 Браузер сам переведет
        day: 'numeric'
      }),
      full: `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB')}`,
      iso: date.toISOString().slice(0, 16),
    };
  } catch (error) {
    return {
      short: 'N/A',
      long: 'Date Error',
      full: 'N/A', 
      iso: new Date().toISOString().slice(0, 16),
    };
  }
};

export const isDateExpired = (dateString: string) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date < new Date();
};

export const getDaysBetween = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


// ============ ХУКИ ДЛЯ ПЕРЕВОДОВ ============

export const useDateFormatter = () => {
  const { language } = useTypedTranslation();
  const { t } = useTypedTranslation('common');

  // Единообразные сокращения месяцев (3 символа)
  const getUniformMonthAbbreviation = (date: Date) => {
    const monthAbbreviations = {
      'en': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      'uk': ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 
             'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'],
      'ru': ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 
             'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
    };

    const monthIndex = date.getMonth();
    return monthAbbreviations[language as keyof typeof monthAbbreviations]?.[monthIndex] || 
           monthAbbreviations['en'][monthIndex];
  };

  // Дни недели с заглавной буквы
  const getCapitalizedWeekday = (date: Date, format: 'short' | 'long' = 'long') => {
    const weekday = date.toLocaleDateString(language, { weekday: format });
    
    // Делаем первую букву заглавной
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  };

  // Браузерные локали для полных названий (когда нужны длинные)
  const getLocalizedMonth = (date: Date, format: 'short' | 'long' | 'uniform' = 'short') => {
    if (format === 'uniform') {
      return getUniformMonthAbbreviation(date);
    }
    return date.toLocaleDateString(language, { month: format });
  };

  const getLocalizedWeekday = (date: Date, format: 'short' | 'long' = 'long') => {
    return getCapitalizedWeekday(date, format);
  };

  const formatLocalizedDate = (
    dateString: string,
    options?: Intl.DateTimeFormatOptions
  ) => {
    if (!dateString?.trim()) return t('notSpecified', { defaultValue: 'Не указано' });

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return t('invalidDate', { defaultValue: 'Неверная дата' });

      // Fallback на стандартное форматирование
      return date.toLocaleDateString(language, options);
    } catch (error) {
      return t('dateError', { defaultValue: 'Ошибка даты' });
    }
  };

  // Специальный формат для Header
  const formatHeaderDate = (date: Date = new Date()) => {
    const day = date.getDate();
    const month = getUniformMonthAbbreviation(date);
    const year = date.getFullYear();
    const today = `${day} ${month} ${year}`;

    const time = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const weekly = getCapitalizedWeekday(date);

    return { today, time, weekly };
  };

  // Ваш кастомный формат с автоматическими переводами
  const formatCustomDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = getUniformMonthAbbreviation(date); 
    const year = date.getFullYear();
    
    return `${day} / ${month} / ${year}`;
  };

  return {
    formatLocalizedDate,
    getLocalizedMonth,
    getLocalizedWeekday,
    getCapitalizedWeekday,
    getUniformMonthAbbreviation,
    formatHeaderDate,
    formatCustomDate,
  };
};

export const useSafeDateFormat = () => {
  const { formatLocalizedDate } = useDateFormatter();
  const { t } = useTypedTranslation('common');

  return (
    dateString?: string | null,
    fallback?: string
  ) => {
    if (!dateString) {
      return fallback || t('notSpecified', { defaultValue: 'Не указано' });
    }

    return formatLocalizedDate(dateString, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
};

// Для обратной совместимости
export const safeDateFormat = (
  dateString?: string | null,
  fallback: string = 'Не указано'
) => {
  if (!dateString) return fallback;

  try {
    const formatted = formatDate(dateString, 'uk');
    return formatted.short !== 'N/A' ? formatted.short : fallback;
  } catch (error) {
    return fallback;
  }
};