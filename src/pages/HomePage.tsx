import React from 'react';
import Hero from '../components/Hero';
import FeaturedSection from '../components/FeaturedSection';
import StatsSection from '../components/StatsSection';
import TestimonialsSection from '../components/TestimonialsSection';
// import AgentsSection from '../components/AgentsSection';
import CTASection from '../components/CTASection';
import { useQuery } from '@tanstack/react-query';
import { Property, PropertyListItem } from '../types/index';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';

const HomePage: React.FC = () => {
  const { data: properties = [], isLoading, isError } = useQuery<any[], Error>({
    queryKey: ['properties'],
    // dynamic import to avoid bundling adminApi in main chunk
    queryFn: async () => (await import('../lib/admin')).adminApi.getProperties(),
  });

  const { language } = useLanguage();
  const t = useTranslation(language);

  if (isLoading) {
    return <p className="text-center py-8">{t('home.loadingFeatured')}</p>;
  }

  if (isError) {
    return <p className="text-center py-8 text-red-600">{t('home.errorLoadingProperties')}</p>;
  }

  return (
    <div className="pt-0">
      <Hero />
      <div className="bg-white">
        <FeaturedSection properties={properties as (Property | PropertyListItem)[]} />
        <StatsSection />
  <TestimonialsSection />
  {/* <AgentsSection /> */} 
        <CTASection /> 
      </div>
    </div>
  );
};

export default HomePage;