'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
import type { Language } from '@/locales';
import FlagSVG from './FlagSVG';
import styles from './LanguageSwitcher.module.css';

interface LanguageOption {
  code: Language;
  name: string;
  countryCode: string;
}

const languages: LanguageOption[] = [
  { code: 'uk', name: 'Українська', countryCode: 'UA' },
  { code: 'en', name: 'English', countryCode: 'US' },
  { code: 'ru', name: 'Русский', countryCode: 'RU' },
];

const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage } = useTypedTranslation();
  const { t } = useTypedTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (languageCode: Language) => {
    try {
      await changeLanguage(languageCode);
      setIsOpen(false);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', languageCode);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  if (!isMounted) {
    return (
      <div className={styles.languageButton}>
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

  return (
    <div className={styles.languageSwitcher} ref={dropdownRef}>
      <button
        className={styles.languageButton}
        onClick={() => setIsOpen(!isOpen)}
        title={t('selectLanguage')}
        type="button"
      >
        <FlagSVG
          countryCode={currentLanguage.countryCode}
          width={20}
          height={15}
        />
        <span className={styles.languageCode}>
          {currentLanguage.code.toUpperCase()}
        </span>
        <i
          className={`fas fa-chevron-down ${styles.chevron} ${
            isOpen ? styles.open : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`${styles.languageDropdown} animate__animated animate__fadeIn animate__faster`}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`${styles.languageOption} ${lang.code === currentLanguage.code ? styles.active : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <FlagSVG
                countryCode={lang.countryCode}
                width={24}
                height={18}
              />
              <span className={`${styles.optionName}`}>
                {lang.name}
              </span>
              <span className={`${styles.optionCode}`}>
                {lang.code.toUpperCase()}
              </span>
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