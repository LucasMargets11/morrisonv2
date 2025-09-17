import React from 'react';
import Button from './UI/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';
import { useNavigate } from 'react-router-dom';

const CTASection: React.FC = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
        <p className="max-w-2xl mx-auto mb-8 text-blue-100">{t('cta.subtitle')}</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            className="min-w-44"
            onClick={() => navigate('/properties')}
          >
            {t('cta.button.primary')}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="min-w-44 bg-transparent border-white text-white hover:bg-white/10"
            onClick={() => navigate('/contacto')}
          >
            {t('cta.button.secondary')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;