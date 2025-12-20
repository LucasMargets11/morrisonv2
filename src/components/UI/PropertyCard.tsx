import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, BedDouble, Bath, Ruler } from 'lucide-react';
import { Property, PropertyListItem } from '../../types';
import { formatPrice } from '../../utils/formatters';
import Badge from './Badge';
import { resolvePropertyImageUrl } from '../../utils/imageUrl';
import ResponsiveImage from '../ResponsiveImage';
import { buildSrcSet } from '../../utils/images.ts'; // helper for generating srcset (bundler resolution)
import { useQueryClient } from '@tanstack/react-query';
import { prefetchProperty } from '../../hooks/useProperty';

interface PropertyCardProps {
  property: Property | PropertyListItem;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const queryClient = useQueryClient();
  const ref = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);
  const id = property.id;

  const onPrefetch = () => {
    // Warm data and route chunk during idle or asap
    (window as any).requestIdleCallback?.(() => {
      prefetchProperty(queryClient, id);
      import('../../pages/PropertyDetailsPage');
    }) || (prefetchProperty(queryClient, id), import('../../pages/PropertyDetailsPage'));
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onPrefetch();
        io.disconnect();
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Helper to check if it's the optimized list item
  const isListItem = (p: any): p is PropertyListItem => 'cover' in p || 'square_feet' in p;

  // Normalize fields
  const squareFeet = isListItem(property) ? property.square_feet : (property as Property).squareFeet;
  const isFeatured = isListItem(property) ? property.is_featured : (property as Property).isFeatured;
  
  // Cover logic
  let coverUrl: string | null = null;
  let srcSet: string | undefined = undefined;
  
  if (isListItem(property) && property.cover) {
      coverUrl = property.cover.url;
      if (property.cover.w480 && property.cover.w768 && !imgError) {
          if (property.cover.w480 !== property.cover.url) {
             srcSet = `${property.cover.w480} 480w, ${property.cover.w768} 768w`;
          }
      }
  } else if (!isListItem(property)) {
      const p = property as Property;
      const coverObj: any | null = Array.isArray(p.images) && p.images.length
        ? (p.images as any[]).find((i: any) => i && (i as any).is_primary) ?? (p.images as any[])[0]
        : null;
      coverUrl = typeof coverObj === 'string'
        ? coverObj
        : resolvePropertyImageUrl(coverObj, { preferSigned: true }) || (coverObj?.image || null);
  }

  const fallback = '/building.svg';
  const widths = [480, 800, 1200, 1600];
  const useStaticVariants = typeof coverUrl === 'string' && coverUrl.startsWith('/props/');
  if (useStaticVariants && property?.id && !srcSet) {
      srcSet = buildSrcSet(`/props/${property.id}/hero`, widths);
  }

  return (
    <div ref={ref} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group"
      onMouseEnter={onPrefetch} onFocus={onPrefetch}
    >
      <Link to={`/property/${property.id}`} className="block">
        <div className="relative overflow-hidden rounded-t-xl">
          <ResponsiveImage
            src={coverUrl || fallback}
            alt={property.title}
            width={1200}
            height={800}
            lazy={true}
            decoding="async"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            srcSet={srcSet}
            onError={() => setImgError(true)}
            className="h-64 w-full transition-transform duration-300 group-hover:scale-105 rounded-t-xl object-cover"
            placeholderSrc={undefined}
          />
          {/* Heart button removed */}
          {(isFeatured || ['temporal','vacacional','tradicional'].includes(property.property_type)) && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10 max-w-[70%]">
              {isFeatured && (
                <Badge variant="primary" className="shadow-sm">Featured</Badge>
              )}
              {property.property_type === 'temporal' && (
                <Badge variant="success" className="shadow-sm">Temporal</Badge>
              )}
              {property.property_type === 'vacacional' && (
                <Badge variant="info" className="shadow-sm">Vacacional</Badge>
              )}
              {property.property_type === 'tradicional' && (
                <Badge variant="secondary" className="shadow-sm">Tradicional</Badge>
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
              <span className="text-sm">{squareFeet} sq ft</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;