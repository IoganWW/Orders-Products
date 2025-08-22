'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAppSelector } from '@/store';

interface SessionsChartProps {
  className?: string;
}

const SessionsChart: React.FC<SessionsChartProps> = ({ className }) => {
  const { activeSessions } = useAppSelector(state => state.app);
  const [sessionHistory, setSessionHistory] = useState<Array<{ time: string, sessions: number }>>([]);

  // Обновляем историю сразу при изменении activeSessions
  useEffect(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit'
    });

    setSessionHistory(prev => {
      const newHistory = [...prev, { time: timeString, sessions: activeSessions }];
      return newHistory.slice(-15);
    });
  }, [activeSessions]);

  // Периодическое обновление (каждые 30 секунд)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit'
      });

      setSessionHistory(prev => {
        const lastSessions = prev.length ? prev[prev.length - 1].sessions : activeSessions;
        const newHistory = [...prev, { time: timeString, sessions: lastSessions }];
        return newHistory.slice(-15);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [activeSessions]);

  return (
    <div className={`${className} card border-0`}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title mb-0">Активность пользователей</h6>
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle me-2" 
              style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#28a745'
              }}
            ></div>
            <span className="fw-bold small">{activeSessions}</span>
            <small className="text-muted ms-2">онлайн</small>
          </div>
        </div>

        {sessionHistory.length > 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sessionHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8f9fa" />
              <XAxis 
                dataKey="time" 
                stroke="#6c757d"
                fontSize={10}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#6c757d" 
                fontSize={11}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value}`, 'Активных сессий']}
                labelFormatter={(label: string) => `Время: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#6c757d"
                fill="rgba(108, 117, 125, 0.1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted py-4">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            <small>Сбор данных...</small>
          </div>
        )}

        <div className="text-end mt-2">
          <small className="text-muted">Обновляется каждые 30 сек</small>
        </div>
      </div>
    </div>
  );
};

export default SessionsChart;
