import React from 'react';
import PropertyCarousel from './UI/PropertyCarousel';
import { Property } from '../types';
import Button from './UI/Button';
import { useNavigate } from 'react-router-dom';

interface FeaturedSectionProps {
  properties: Property[];
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ properties }) => {
  const navigate = useNavigate();
  const featuredProperties = properties.filter(p => {
  return Boolean(p.isFeatured) || Boolean(p.is_featured);
  });
  


  return (
    <section className="py-16 container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Propiedades Destacadas</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Descubre nuestra selección exclusiva de propiedades premium que representan lo mejor en lujo y ubicación
        </p>
      </div>

      <PropertyCarousel properties={featuredProperties} />
      
      <div className="text-center mt-12">
        <Button 
          variant="outline"
          onClick={() => navigate('/properties')}
        >
          Ver Todas las Propiedades
        </Button>
      </div>
    </section>
  );
};

export default FeaturedSection;