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
    <section className="relative py-20 text-gray-900 overflow-hidden bg-gradient-to-br from-[#F9E27A] via-[#E8C74E] to-[#D4AF37]">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 mix-blend-overlay opacity-30 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.55),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(115deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_40%)]" />
      </div>
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-gray-900/95 drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]">
          <span className="block leading-tight">
            {t('cta.title')}
          </span>
        </h2>
        <p className="max-w-2xl mx-auto mb-10 text-base md:text-lg text-gray-900/80 font-medium leading-relaxed [text-wrap:balance]">
          {t('cta.subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className="min-w-44 bg-white/90 hover:bg-white text-gray-900 border border-white/60 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.15)] backdrop-blur-sm transition-colors"
            onClick={() => navigate('/properties')}
          >
            {t('cta.button.primary')}
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            className="min-w-44 bg-gray-900/80 text-white hover:bg-gray-900 border border-gray-900/40 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-colors"
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