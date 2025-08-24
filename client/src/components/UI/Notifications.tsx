// client/src/components/UI/Notifications.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Notifications.module.css';

// Строгая типизация для уведомлений
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

// Типы для Custom Events
interface NotificationEventDetail {
  type: NotificationType;
  message: string;
  duration?: number;
}

// Расширяем глобальные типы для Custom Events
declare global {
  interface WindowEventMap {
    'showNotification': CustomEvent<NotificationEventDetail>;
  }
}

// Конфигурация иконок с типизацией
const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  success: 'fas fa-check-circle',
  error: 'fas fa-exclamation-circle',
  warning: 'fas fa-exclamation-triangle',
  info: 'fas fa-info-circle',
} as const;

// Конфигурация CSS классов с типизацией
const NOTIFICATION_STYLES: Record<NotificationType, string> = {
  success: styles.success,
  error: styles.error,
  warning: styles.warning,
  info: styles.info,
} as const;

// Константы
const DEFAULT_DURATION = 5000;
const HISTORY_CLEANUP_DELAY = 2000;

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messageHistory, setMessageHistory] = useState<Set<string>>(new Set());

  // Типизированные функции
  const createMessageKey = useCallback((type: NotificationType, message: string): string => {
    return `${type}-${message}`;
  }, []);

  const generateNotificationId = useCallback((): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const removeNotification = useCallback((id: string): void => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const cleanupMessageHistory = useCallback((messageKey: string): void => {
    setTimeout(() => {
      setMessageHistory(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageKey);
        return newSet;
      });
    }, HISTORY_CLEANUP_DELAY);
  }, []);

  const addNotification = useCallback((detail: NotificationEventDetail): void => {
    const { type, message, duration = DEFAULT_DURATION } = detail;
    const messageKey = createMessageKey(type, message);
    
    // Проверяем дубликаты
    if (messageHistory.has(messageKey)) {
      return;
    }
    
    const id = generateNotificationId();
    
    const notification: Notification = {
      id,
      type,
      message,
      duration
    };

    setNotifications(prev => [...prev, notification]);
    setMessageHistory(prev => new Set([...prev, messageKey]));

    // Автоудаление с очисткой истории
    setTimeout(() => {
      removeNotification(id);
      cleanupMessageHistory(messageKey);
    }, duration);
  }, [messageHistory, createMessageKey, generateNotificationId, removeNotification, cleanupMessageHistory]);

  // Типизированный обработчик событий
  useEffect(() => {
    const handleNotification = (event: WindowEventMap['showNotification']): void => {
      addNotification(event.detail);
    };

    window.addEventListener('showNotification', handleNotification);

    return () => {
      window.removeEventListener('showNotification', handleNotification);
    };
  }, [addNotification]);

  // Типизированные вспомогательные функции
  const getIcon = useCallback((type: NotificationType): string => {
    return NOTIFICATION_ICONS[type];
  }, []);

  const getColorClass = useCallback((type: NotificationType): string => {
    return NOTIFICATION_STYLES[type];
  }, []);

  const handleCloseNotification = useCallback((id: string): void => {
    removeNotification(id);
  }, [removeNotification]);

  // Early return если нет уведомлений
  if (notifications.length === 0) return null;

  return (
    <div className={`${styles.notificationsContainer} notifications-container`}>
      {notifications.map((notification: Notification) => (
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
            onClick={() => handleCloseNotification(notification.id)}
            aria-label="Закрыть уведомление"
            type="button"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;

// Экспорт типов для использования в других компонентах
export type { NotificationEventDetail };

// Утилитарная функция для показа уведомлений с типизацией
export const showNotification = (detail: NotificationEventDetail): void => {
  const event = new CustomEvent('showNotification', { detail });
  window.dispatchEvent(event);
};