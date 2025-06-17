import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('es')}
        className={`flex items-center ${language === 'es' ? 'opacity-100' : 'opacity-70 hover:opacity-100'} transition-opacity`}
      >
        <img
          src="https://flagcdn.com/w40/es.png"
          alt="Español"
          className="w-5 h-5 rounded-sm object-cover"
        />
      </button>
      
      <button
        onClick={() => setLanguage('en')}
        className={`flex items-center ${language === 'en' ? 'opacity-100' : 'opacity-70 hover:opacity-100'} transition-opacity`}
      >
        <img
          src="https://flagcdn.com/w40/gb.png"
          alt="English"
          className="w-5 h-5 rounded-sm object-cover"
        />
      </button>
      
      <button
        onClick={() => setLanguage('pt')}
        className={`flex items-center ${language === 'pt' ? 'opacity-100' : 'opacity-70 hover:opacity-100'} transition-opacity`}
      >
        <img
          src="https://flagcdn.com/w40/pt.png"
          alt="Português"
          className="w-5 h-5 rounded-sm object-cover"
        />
      </button>
    </div>
  );
};

export default LanguageSwitcher;