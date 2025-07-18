import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BedDouble, Bath, Ruler, HeartIcon } from 'lucide-react';
import { Property } from '../../types';
import { formatPrice } from '../../utils/formatters';
import Badge from './Badge';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [isFavorite, setIsFavorite] = React.useState(false);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group">
      <Link to={`/property/${property.id}`} className="block">
        <div className="relative overflow-hidden rounded-t-xl">
          <img 
            src={property.images[0] || '/placeholder.jpg'}
            alt={property.title} 
            className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-xl"
          />
          <button 
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200 z-10"
          >
            <HeartIcon 
              size={20} 
              className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </button>
          {(property.isFeatured || property.property_type === "temporal") && (
            <div className="absolute top-3 left-3 flex gap-2 z-10">
              {property.isFeatured && (
                <Badge variant="primary" className="shadow-sm">Featured</Badge>
              )}
              {property.property_type === "temporal" && (
                <Badge variant="success" className="shadow-sm">Temporal</Badge>
              )}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-none rounded-t-xl pointer-events-none transition-all duration-300 delay-100" />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <p className="text-white font-bold text-xl">{formatPrice(property.price)}</p>
            {property.isForRent && <p className="text-white text-sm">/month</p>}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800 mb-1">{property.address}</h3>
          <p className="text-gray-600 text-sm mb-4 flex items-center">
            <Home size={16} className="mr-1" />
            {property.city}, {property.state}
          </p>
          
          <div className="flex justify-between text-gray-700">
            <div className="flex items-center">
              <BedDouble size={18} className="mr-1" />
              <span className="text-sm">{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath size={18} className="mr-1" />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
            <div className="flex items-center">
              <Ruler size={18} className="mr-1" />
              <span className="text-sm">{property.squareFeet} sq ft</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;