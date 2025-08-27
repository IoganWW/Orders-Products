import React, { useEffect, useMemo, memo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setCurrentTime } from '@/store/slices/appSlice';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
import { formatHeaderDate } from '@/utils/dateUtils';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import styles from './Layout.module.css';
import Link from 'next/link';

const Header: React.FC = memo(() => {
  const { t } = useTypedTranslation('common');
  const dispatch = useAppDispatch();
  const { currentTime, activeSessions, isConnected } = useAppSelector((state) => state.app);

  // Обновляем время каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch(setCurrentTime(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch]);

  // Мемоизируем форматированную дату для оптимизации
  const formattedDate = useMemo(() => {
    return formatHeaderDate(currentTime);
  }, [currentTime]);

  const { today, time, weekly } = formattedDate;

  // Мемоизируем счетчик сессий
  const sessionsDisplay = useMemo(() => {
    return isConnected ? activeSessions : 0;
  }, [isConnected, activeSessions]);

  return (
    <header className={`${styles.header}`}>
      <div className={`${styles.headerLeft}`}>
        <Link href="/">
          <i className="fa-solid fa-shield fa-2xl me-2" style={{ color: "#28a745" }}></i>
        </Link>
        <div className={`${styles.logo}`}>
          <span className="fw-bold">INVENTORY</span>
        </div>
      </div>

      <div className={`${styles.headerCenter}`}>
        <div className={`${styles.searchBox}`}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder={t('search')}
            className="form-control"
          />
        </div>
      </div>

      <div className={`${styles.headerRight} me-0 me-lg-5`}>
        <div className={`${styles.sessionCounter}`}>
          <span className="badge bg-secondary me-2">
            <i className="fas fa-users me-1"></i>
            {sessionsDisplay}
          </span>
        </div>

        <LanguageSwitcher />

        <div className={`${styles.dateTime}`}>
          <div className={`${styles.dateLabel}`}>{weekly}</div>
          <div className={`${styles.dateValue}`}>
            {today}
            <i className="fas fa-clock ms-2 me-1" style={{ color: " #34cb3e" }}></i>
            {time}
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;