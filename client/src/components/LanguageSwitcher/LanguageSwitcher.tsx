'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
import type { Language } from '@/locales';
import FlagSVG from './FlagSVG';
import styles from './LanguageSwitcher.module.css';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string; // Название на родном языке
  countryCode: string;
  direction: 'ltr' | 'rtl'; // Направление текста
}

const languages: LanguageOption[] = [
  { 
    code: 'uk', 
    name: 'Ukrainian',
    nativeName: 'Українська', 
    countryCode: 'UA',
    direction: 'ltr'
  },
  { 
    code: 'en', 
    name: 'English',
    nativeName: 'English', 
    countryCode: 'US',
    direction: 'ltr'
  },
  { 
    code: 'ru', 
    name: 'Russian',
    nativeName: 'Русский', 
    countryCode: 'RU',
    direction: 'ltr'
  },
];

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'compact';
  showNames?: boolean;
  showFlags?: boolean;
  position?: 'left' | 'right' | 'center';
  onLanguageChange?: (language: Language) => void;
  disabled?: boolean;
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  showNames = true,
  showFlags = true,
  position = 'left',
  onLanguageChange,
  disabled = false,
  className = ''
}) => {
  const { language, changeLanguage, ready } = useTypedTranslation();
  const { t } = useTypedTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  // Мемоизируем обработчик изменения языка
  const handleLanguageChange = useCallback(async (languageCode: Language) => {
    if (isChanging || disabled) return;
    
    setIsChanging(true);
    
    try {
      await changeLanguage(languageCode);
      setIsOpen(false);
      
      // Вызываем callback если передан
      onLanguageChange?.(languageCode);
      
      // Дополнительная логика
      if (typeof window !== 'undefined') {
        // Сохраняем предпочтения пользователя
        localStorage.setItem('language', languageCode);
        
        // Обновляем мета-теги для SEO
        const htmlElement = document.documentElement;
        htmlElement.lang = languageCode;
        
        // Опционально обновляем мета-тег для Open Graph
        const ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale) {
          const localeMap = {
            'en': 'en_US',
            'uk': 'uk_UA',
            'ru': 'ru_RU'
          };
          ogLocale.setAttribute('content', localeMap[languageCode] || 'en_US');
        }
      }
      
    } catch (error) {
      console.error('Error changing language:', error);
      // Показываем пользователю ошибку
    } finally {
      setIsChanging(false);
    }
  }, [changeLanguage, onLanguageChange, isChanging, disabled]);

  // Обработка клика вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Добавляем поддержку ESC
      const handleEscPress = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };
      document.addEventListener('keydown', handleEscPress);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscPress);
      };
    }
  }, [isOpen]);

  // Инициализация на клиенте
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Loading состояние
  if (!isMounted || !ready) {
    return (
      <div className={`${styles.languageButton} ${className}`}>
        <div
          style={{
            width: '20px',
            height: '15px',
            backgroundColor: '#f0f0f0',
            borderRadius: '2px'
          }}
        />
        <span className={styles.languageCode}>--</span>
      </div>
    );
  }

  // Inline вариант
  if (variant === 'inline') {
    return (
      <div className={`${styles.inlineContainer} ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`${styles.inlineButton} ${lang.code === currentLanguage.code ? styles.active : ''}`}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={disabled || isChanging}
            title={lang.nativeName}
          >
            {showFlags && (
              <FlagSVG
                countryCode={lang.countryCode}
                width={16}
                height={12}
              />
            )}
            {showNames && (
              <span className={styles.inlineName}>
                {lang.code.toUpperCase()}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Compact вариант
  if (variant === 'compact') {
    return (
      <button
        className={`${styles.compactButton} ${className}`}
        onClick={() => {
          const currentIndex = languages.findIndex(l => l.code === currentLanguage.code);
          const nextIndex = (currentIndex + 1) % languages.length;
          handleLanguageChange(languages[nextIndex].code);
        }}
        disabled={disabled || isChanging}
        title={t('switchLanguage')}
        type="button"
      >
        {showFlags && (
          <FlagSVG
            countryCode={currentLanguage.countryCode}
            width={20}
            height={15}
          />
        )}
        <span className={styles.compactCode}>
          {currentLanguage.code.toUpperCase()}
        </span>
        {isChanging && (
          <div className={styles.spinner} />
        )}
      </button>
    );
  }

  // Dropdown вариант (по умолчанию)
  return (
    <div 
      className={`${styles.languageSwitcher} ${styles[position]} ${className}`} 
      ref={dropdownRef}
    >
      <button
        className={`${styles.languageButton} ${disabled ? styles.disabled : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        title={t('selectLanguage')}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('selectLanguage')}
        disabled={disabled}
      >
        {showFlags && (
          <FlagSVG
            countryCode={currentLanguage.countryCode}
            width={20}
            height={15}
          />
        )}
        {showNames && (
          <span className={styles.languageCode}>
            {currentLanguage.code.toUpperCase()}
          </span>
        )}
        <i
          className={`fas fa-chevron-down ${styles.chevron} ${
            isOpen ? styles.open : ''
          }`}
        />
        {isChanging && (
          <div className={styles.spinner} />
        )}
      </button>

      {isOpen && (
        <div
          className={`${styles.languageDropdown} animate__animated animate__fadeIn animate__faster`}
          role="listbox"
          aria-label={t('languageOptions')}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={lang.code === currentLanguage.code}
              className={`${styles.languageOption} ${lang.code === currentLanguage.code ? styles.active : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isChanging}
            >
              {showFlags && (
                <FlagSVG
                  countryCode={lang.countryCode}
                  width={24}
                  height={18}
                />
              )}
              <div className={styles.optionName}>
                <span className="me-1">
                  {lang.nativeName}
                </span>
                <span className="ms-1">
                  {lang.code.toUpperCase()}
                </span>
              </div>
              {lang.code === currentLanguage.code && (
                <i className="fas fa-check ms-auto text-success" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;