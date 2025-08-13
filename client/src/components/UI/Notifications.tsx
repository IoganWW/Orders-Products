// client/src/components/UI/Notifications.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styles from './Notifications.module.css';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messageHistory, setMessageHistory] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const { type, message, duration = 5000 } = event.detail;
      
      // Проверяем, не показывали ли мы это сообщение недавно
      const messageKey = `${type}-${message}`;
      if (messageHistory.has(messageKey)) {
        return; // Пропускаем дублирующиеся сообщения
      }
      
      const id = Date.now().toString();
      
      const notification: Notification = {
        id,
        type,
        message,
        duration
      };

      setNotifications(prev => [...prev, notification]);
      
      // Добавляем сообщение в историю
      setMessageHistory(prev => new Set([...prev, messageKey]));

      // Auto remove after duration
      setTimeout(() => {
        removeNotification(id);
        // Убираем из истории через некоторое время
        setTimeout(() => {
          setMessageHistory(prev => {
            const newSet = new Set(prev);
            newSet.delete(messageKey);
            return newSet;
          });
        }, 2000); // Удаляем из истории через 2 секунды после удаления уведомления
      }, duration);
    };

    window.addEventListener('showNotification', handleNotification as EventListener);

    return () => {
      window.removeEventListener('showNotification', handleNotification as EventListener);
    };
  }, [messageHistory]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-bell';
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'success': return styles.success;
      case 'error': return styles.error;
      case 'warning': return styles.warning;
      case 'info': return styles.info;
      default: return styles.info;
    }
  };

  return (
    <div className={`${styles.notificationsContainer} notifications-container`}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`${styles.notification} ${getColorClass(notification.type)} notification animate__animated animate__slideInRight`}
        >
          <div className={`${styles.notificationIcon} notification-icon`}>
            <i className={getIcon(notification.type)}></i>
          </div>
          
          <div className={`${styles.notificationContent} notification-content`}>
            <p className={`${styles.notificationMessage} notification-message`}>
              {notification.message}
            </p>
          </div>
          
          <button
            className={`${styles.notificationClose} notification-close`}
            onClick={() => removeNotification(notification.id)}
            aria-label="Закрыть уведомление"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;