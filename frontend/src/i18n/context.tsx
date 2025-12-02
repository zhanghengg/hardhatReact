'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { zh, type Locale } from './locales/zh';
import { en } from './locales/en';

type Language = 'zh' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Locale;
}

const I18nContext = createContext<I18nContextType | null>(null);

const locales: Record<Language, Locale> = { zh, en };

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved && (saved === 'zh' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: locales[language] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
