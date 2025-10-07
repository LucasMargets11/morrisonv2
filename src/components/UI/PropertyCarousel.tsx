import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BedDouble, Bath, MapPin } from 'lucide-react';
import { Property } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface PropertyCarouselProps {
  properties: Property[];
}

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({ properties }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoplayTimerRef = useRef<number>();
  const navigate = useNavigate();

  const normalizedProperties = properties.map(p => ({
    ...p,
    isFeatured: p.is_featured ?? p.isFeatured ?? false,
  }));
  const featuredPropertiesFeatured = normalizedProperties.filter(p => p.isFeatured);

  const getVisibleIndexes = () => {
    const indexes = [];
    const totalSlides = featuredPropertiesFeatured.length;
    
    for (let i = -1; i <= 1; i++) {
      indexes.push((currentIndex + i + totalSlides) % totalSlides);
    }
    return indexes;
  };

  const getSlideStyle = (index: number) => {
    const visibleIndexes = getVisibleIndexes();
    const position = visibleIndexes.indexOf(index);
    
    if (position === -1) return { display: 'none' };

    const isCenter = position === 1;
    const translateX = (position - 1) * 100;
    const scale = isCenter ? 1.2 : 0.8;
    const opacity = isCenter ? 1 : 0.6;
    const zIndex = isCenter ? 2 : 1;
    
    let adjustedTranslateX = translateX;
    if (isDragging) {
      adjustedTranslateX += dragX / (carouselRef.current?.offsetWidth || 1) * 100;
    }

    return {
      transform: `translate3d(${adjustedTranslateX}%, 0, 0) scale(${scale})`,
      opacity,
      zIndex,
      transition: isAnimating ? 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    };
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % featuredPropertiesFeatured.length);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + featuredPropertiesFeatured.length) % featuredPropertiesFeatured.length);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handlePropertyClick = (propertyId: string, index: number) => {
    if (!isDragging && index === currentIndex) {
      navigate(`/property/${propertyId}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setDragX(0);
    setIsAnimating(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const walk = e.pageX - startX;
    setDragX(walk);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const threshold = 50;
    if (Math.abs(dragX) > threshold) {
      if (dragX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    
    setIsDragging(false);
    setDragX(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setDragX(0);
    setIsAnimating(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const walk = e.touches[0].pageX - startX;
    setDragX(walk);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!hasFocus) {
      autoplayTimerRef.current = window.setInterval(handleNext, 5000);
    }
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [hasFocus]);
  
  return (
    <div 
      className="relative group h-[400px] overflow-hidden perspective-1000"
      role="region"
      aria-label="Property carousel"
      onMouseEnter={() => setHasFocus(true)}
      onMouseLeave={() => setHasFocus(false)}
    >
      <div
        ref={carouselRef}
        className="absolute inset-0 flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {featuredPropertiesFeatured.slice(0, 3).map((property, index) => (
          <div
            key={property.id}
            ref={el => slideRefs.current[index] = el}
            className="absolute w-full max-w-sm px-4 cursor-pointer transform-gpu"
            style={getSlideStyle(index)}
            onClick={() => handlePropertyClick(property.id, index)}
            role="group"
            aria-label={`Slide ${index + 1} of ${featuredPropertiesFeatured.length}`}
            aria-hidden={index !== currentIndex}
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-xl">
              <div className="relative aspect-[16/9]">
                {(() => {
                  const src = (Array.isArray(property.images) && property.images.length > 0
                    ? (typeof property.images[0] === 'string'
                        ? (property.images[0] as string)
                        : (((property.images[0] as any)?.url) || ((property.images[0] as any)?.image)))
                    : undefined) as string | undefined;
                  return src ? (
                    <img src={src} alt={property.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Image unavailable</span>
                    </div>
                  );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-bold text-xl mb-1">
                    {formatPrice(property.price)}
                  </p>
                  <h3 className="text-white font-medium text-lg line-clamp-1">
                    {property.title}
                  </h3>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin size={16} className="mr-2" />
                  <p>{property.city}, {property.state}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-gray-600">
                  <div className="flex items-center justify-center p-1.5 bg-gray-50 rounded-lg">
                    <BedDouble size={16} className="mr-1" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center justify-center p-1.5 bg-gray-50 rounded-lg">
                    <Bath size={16} className="mr-1" />
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center justify-center p-1.5 bg-gray-50 rounded-lg text-sm">
                    <span>{property.squareFeet} ft²</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Previous property"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Next property"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default PropertyCarousel;