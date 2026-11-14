import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { translations, type Language, type Translations } from '../lib/translations';

interface LanguageContextType {
  language: Language;
  isUrdu: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (keyPath: string, fallback?: string) => string;
  tx: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('buildwise_language');
      if (saved === 'ur' || saved === 'en') return saved;
      // Default to English, but check browser language
      if (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('ur')) {
        return 'ur';
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  const isUrdu = language === 'ur';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('buildwise_language', lang);
    } catch {
      // fallback
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.setAttribute('dir', isUrdu ? 'rtl' : 'ltr');
    if (isUrdu) {
      root.classList.add('urdu-font');
    } else {
      root.classList.remove('urdu-font');
    }
  }, [language, isUrdu]);

  const tx = translations[language] || translations.en;

  /**
   * Helper function to get nested keys like t('landing.heroTitle') or t('signIn')
   */
  const t = (keyPath: string, fallback?: string): string => {
    const keys = keyPath.split('.');
    let current: unknown = tx;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        // Fallback to English if missing in current language
        let enCurrent: unknown = translations.en;
        for (const enKey of keys) {
          if (enCurrent && typeof enCurrent === 'object' && enKey in enCurrent) {
            enCurrent = (enCurrent as Record<string, unknown>)[enKey];
          } else {
            return fallback || keyPath;
          }
        }
        return typeof enCurrent === 'string' ? enCurrent : (fallback || keyPath);
      }
    }
    return typeof current === 'string' ? current : (fallback || keyPath);
  };

  const value = useMemo(
    () => ({
      language,
      isUrdu,
      setLanguage,
      toggleLanguage,
      t,
      tx
    }),
    [language, isUrdu, tx]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
