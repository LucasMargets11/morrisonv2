import React from 'react';
import PropertyCard from './UI/PropertyCard';
import { Property, PropertyListItem } from '../types';

interface PropertyGridProps {
  properties: (Property | PropertyListItem)[];
  title?: string;
  subtitle?: string;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ 
  properties, 
  title, 
  subtitle 
}) => {
  return (
  <div className="mb-12 cv-auto section-sizer">
      {title && (
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property, index) => (
          <PropertyCard key={property.id} property={property} priority={index === 0} />
        ))}
      </div>
    </div>
  );
};

export default PropertyGrid;