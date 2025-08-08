export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // Получаем день, месяц (в сокращённой форме) и год
  const day = date.toLocaleString('en-GB', { day: '2-digit' }); 
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.toLocaleString('en-GB', { year: 'numeric' });

  // Форматируем строку вручную
  const formattedDate = `${day} / ${month} / ${year}`;

  return {
    // Формат: 29.06.2017
    short: date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),

    shortMonStr: formattedDate,
  
    // Формат: June 29, 2017
    long: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),

    // Формат: 29.06.2017 12:09:33
    full: `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB')}`,
    // ISO формат для datetime-local input
    iso: date.toISOString().slice(0, 16)
  };
};

export const isDateExpired = (dateString: string) => {
  return new Date(dateString) < new Date();
};

export const getDaysBetween = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};