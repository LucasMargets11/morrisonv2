import React, { useState, useRef, useEffect } from 'react';
import { Language, useLanguage } from '../contexts/LanguageContext';

const flags: { [key: string]: string } = {
  es: 'https://flagcdn.com/w40/es.png',
  en: 'https://flagcdn.com/w40/gb.png',
  pt: 'https://flagcdn.com/w40/pt.png',
};

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: string) => {
    setLanguage(lang as Language);
    setOpen(false);
  };

  const availableLanguages = Object.entries(flags).filter(([key]) => key !== language);

  return (
    <div className="relative flex items-center" ref={wrapperRef}>
      {/* Bandera actual */}
      <button
        onClick={() => setOpen(!open)}
        className="w-6 h-6 flex items-center justify-center"
      >
        <img
          src={flags[language]}
          alt={language}
          className="w-full h-full object-cover rounded-sm filter brightness-90 contrast-90 saturate-75"
        />
      </button>

      {/* Menú con animación horizontal y filtros */}
      <div
        className={`ml-2 flex gap-2 items-center transition-all duration-200 ease-out ${
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {availableLanguages.map(([lang, url], index) => (
          <button
            key={lang}
            onClick={() => handleSelect(lang)}
            style={{
              transitionDelay: open ? `${index * 100}ms` : '0ms',
            }}
            className="w-6 h-6 transform transition duration-300 ease-out hover:scale-105"
          >
            <img
              src={url}
              alt={lang}
              className="w-full h-full object-cover rounded-sm filter brightness-90 contrast-90 saturate-75 hover:filter-none"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
