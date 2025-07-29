import React from 'react';
import Hero from '../components/Hero';
import FeaturedSection from '../components/FeaturedSection';
import StatsSection from '../components/StatsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import AgentsSection from '../components/AgentsSection';
import CTASection from '../components/CTASection';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/admin';
import { Property } from '../types/index';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';

const HomePage: React.FC = () => {
  const { data: properties = [], isLoading, isError } = useQuery<Property[], Error>({
    queryKey: ['properties'],
    queryFn: adminApi.getProperties,
  });

  const { language } = useLanguage();
  const t = useTranslation(language);

  if (isLoading) {
    return <p className="text-center py-8">Cargando propiedades destacadas...</p>;
  }

  if (isError) {
    return <p className="text-center py-8 text-red-600">Error al cargar propiedades.</p>;
  }

  return (
    <div className="pt-0">
      <Hero />
      <div className="bg-white">
        <FeaturedSection properties={properties as Property[]} />
        <StatsSection />
        <TestimonialsSection />
        <AgentsSection /> 
        <CTASection /> 
      </div>
    </div>
  );
};

export default HomePage;