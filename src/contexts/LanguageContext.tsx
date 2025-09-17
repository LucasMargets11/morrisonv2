import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'es' | 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage if available; default to Spanish ('es')
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
      if (stored === 'es' || stored === 'en' || stored === 'pt') return stored;
    } catch {}
    return 'es';
  });

  // Persist language changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', language);
      }
    } catch {}
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Utilities for non-React modules (e.g., formatters) to get locale
export const getCurrentLanguage = (): Language => {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
    if (stored === 'es' || stored === 'en' || stored === 'pt') return stored;
  } catch {}
  return 'es';
};

export const mapLanguageToLocale = (language: Language): string => {
  switch (language) {
    case 'es':
      return 'es-AR';
    case 'pt':
      return 'pt-BR';
    case 'en':
    default:
      return 'en-US';
  }
};