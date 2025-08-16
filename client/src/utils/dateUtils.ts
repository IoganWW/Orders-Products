// client/src/utils/dateUtils.ts
import i18n from '@/lib/i18n';

export const formatDate = (dateString: string, lang: string) => {
  // Проверяем, что входная строка валидна
  if (!dateString || dateString.trim() === '') {
    const fallbackDate = new Date();
    return {
      short: 'N/A',
      long: 'Invalid Date',
      full: 'N/A',
      iso: fallbackDate.toISOString().slice(0, 16),
      shortMonStr: 'N/A'
    };
  }

  const date = new Date(dateString);
  
  // Проверяем, что дата валидна
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return {
      short: 'N/A',
      long: 'Invalid Date',
      full: 'N/A',
      iso: new Date().toISOString().slice(0, 16),
      shortMonStr: 'N/A'
    };
  }
  
  try {
    return {
      // Формат: 29.06.2017
      short: date.toLocaleDateString(lang, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      // Формат: June 29, 2017
      long: date.toLocaleDateString(lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      // Формат: 29.06.2017 12:09:33
      full: `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB')}`,
      // ISO формат для datetime-local input
      iso: date.toISOString().slice(0, 16),
      // Формат: 29 / Июн / 2017 (ваш метод)
      shortMonStr: `${date.getDate().toString().padStart(2, '0')} / ${getTranslatedMonth(date)} / ${date.getFullYear()}`
    };
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return {
      short: 'N/A',
      long: 'Date Error',
      full: 'N/A',
      iso: new Date().toISOString().slice(0, 16),
      shortMonStr: 'N/A'
    };
  }
};

export const isDateExpired = (dateString: string) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  
  return date < new Date();
};

export const getDaysBetween = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Безопасная функция для форматирования даты с fallback
export const safeDateFormat = (
  dateString?: string | null,
  fallback: string = 'Не указано',
  lang: string = i18n.language // 👈 язык по умолчанию из i18n
) => {
  if (!dateString) return fallback;

  try {
    const formatted = formatDate(dateString, lang);
    return formatted.short !== 'N/A' ? formatted.short : fallback;
  } catch (error) {
    return fallback;
  }
};

// ============= НОВЫЕ i18n ФУНКЦИИ =============

// Функция для получения переведенного дня недели
export const getTranslatedWeekday = (date: Date) => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return i18n.t(`common:${dayKeys[dayOfWeek]}`);
};

// Функция для получения переведенного месяца
export const getTranslatedMonth = (date: Date) => {
  const month = date.getMonth(); // 0 = January, 1 = February, etc.
  const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return i18n.t(`common:${monthKeys[month]}`);
};

// Форматирование для Header с переводами
export const formatHeaderDate = (date: Date) => {
  const day = date.getDate();
  const month = getTranslatedMonth(date);
  const year = date.getFullYear();
  const today = `${day} ${month} ${year}`;

  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const weekly = getTranslatedWeekday(date);

  return { today, time, weekly };
};