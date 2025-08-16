'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store';
import { setLocale } from '@/store/slices/appSlice';
import FlagSVG from './FlagSVG';
import styles from './LanguageSwitcher.module.css';

interface Language {
  code: string;
  name: string;
  countryCode: string;
}

const languages: Language[] = [
  { code: 'uk', name: 'Українська', countryCode: 'UA' },
  { code: 'en', name: 'English', countryCode: 'US' },
  { code: 'ru', name: 'Русский', countryCode: 'RU' }
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (languageCode: string): Promise<void> => {
    try {
      await i18n.changeLanguage(languageCode);
      dispatch(setLocale(languageCode));
      setIsOpen(false);
      
      // Сохраняем выбор в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', languageCode);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Загружаем сохраненный язык при монтировании
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && savedLanguage !== i18n.language) {
        handleLanguageChange(savedLanguage);
      }
    }
  }, []);

  if (!isMounted) {
    return (
      <div className={`${styles.languageButton} language-button`}>
        <div style={{ width: '20px', height: '15px', backgroundColor: '#f0f0f0', borderRadius: '2px' }} />
        <span className={`${styles.languageCode} language-code`}>--</span>
      </div>
    );
  }

  return (
    <div className={`${styles.languageSwitcher} language-switcher`} ref={dropdownRef}>
      <button
        className={`${styles.languageButton} language-button`}
        onClick={() => setIsOpen(!isOpen)}
        title="Выбрать язык"
        type="button"
      >
        <FlagSVG
          countryCode={currentLanguage.countryCode}
          width={20}
          height={15}
        />
        <span className={`${styles.languageCode} language-code`}>
          {currentLanguage.code.toUpperCase()}
        </span>
        <i className={`fas fa-chevron-down ${styles.chevron} ${isOpen ? styles.open : ''}`}></i>
      </button>

      {isOpen && (
        <div className={`${styles.languageDropdown} language-dropdown animate__animated animate__fadeIn animate__faster`}>
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              className={`
                ${styles.languageOption} 
                language-option 
                ${language.code === currentLanguage.code ? styles.active : ''}
              `}
              onClick={() => handleLanguageChange(language.code)}
            >
              <FlagSVG
                countryCode={language.countryCode}
                width={24}
                height={18}
              />
              <span className={`${styles.optionName} option-name`}>
                {language.name}
              </span>
              <span className={`${styles.optionCode} option-code`}>
                {language.code.toUpperCase()}
              </span>
              {language.code === currentLanguage.code && (
                <i className="fas fa-check ms-auto text-success"></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;