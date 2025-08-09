import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setCurrentTime } from '@/store/slices/appSlice';
import styles from './Layout.module.css';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentTime, activeSessions, isConnected } = useAppSelector((state) => state.app);

  // Обновляем время каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch(setCurrentTime(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch]);

  const formatDate = (date: Date) => {
    const weekly = date.toLocaleDateString('en-GB', {
      weekday: "long",
    });

    const today = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    const time = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return { today, time, weekly };
  };

  const { today, time, weekly} = formatDate(currentTime);

  return (
    <header className={`${styles.header} header`}>
      <div className={`${styles.headerLeft} header-left`}>
        <i className="fa-solid fa-shield fa-2xl me-2" style={{color:"#28a745"}}></i>
        <div className={`${styles.logo} logo`}>
          <span className="fw-bold">INVENTORY</span>
        </div>
      </div>

      <div className={`${styles.headerCenter} header-center`}>
        <div className={`${styles.searchBox} search-box`}>
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Поиск" 
            className="form-control"
          />
        </div>
      </div>

      <div className={`${styles.headerRight} header-right me-5`}>
        <div className={`${styles.sessionCounter} session-counter`}>
          <span className="badge bg-secondary me-2">
            <i className="fas fa-users me-1"></i>
            {isConnected ? activeSessions : 0}
          </span>
        </div>
        
        <div className={`${styles.dateTime} date-time`}>
          <div className={`${styles.dateLabel} date-label`}>{weekly}</div>
          <div className={`${styles.dateValue} date-value`}>
            {today}
            <i className="fas fa-clock ms-2 me-1" style={{color:" #34cb3e"}}></i>
            {time}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;