import React from 'react';
import PropertyCarousel from './UI/PropertyCarousel';
import { Property } from '../types';
import Button from './UI/Button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';

interface FeaturedSectionProps {
  properties: Property[];
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ properties }) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const navigate = useNavigate();
  const featuredProperties = properties.filter(p => {
  return Boolean(p.isFeatured) || Boolean(p.is_featured);
  });
  


  return (
    <section className="py-16 container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.featured.title')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('home.featured.subtitle')}</p>
      </div>

      <PropertyCarousel properties={featuredProperties} />
      
      <div className="text-center mt-12">
        <Button 
          variant="outline"
          onClick={() => navigate('/properties')}
        >
          {t('properties.title')}
        </Button>
      </div>
    </section>
  );
};

export default FeaturedSection;