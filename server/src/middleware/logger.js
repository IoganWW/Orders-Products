const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Логируем запрос
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  
  // Перехватываем ответ для логирования
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`📤 ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    
    // Вызываем оригинальный метод
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = loggerMiddleware;