import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Card {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface CardCarouselProps {
  cards: Card[];
  onSelect?: (card: Card) => void;
}

const CardCarousel: React.FC<CardCarouselProps> = ({ cards, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const getVisibleIndexes = () => {
    const indexes = [];
    for (let i = -1; i <= 1; i++) {
      indexes.push((currentIndex + i + cards.length) % cards.length);
    }
    return indexes;
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const deltaX = touchStartX.current - touchCurrentX;
    const deltaY = touchStartY.current - touchCurrentY;

    // Prevent vertical scrolling when swiping horizontally
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX.current - touchEndX;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) handleNext();
      else handlePrev();
    }

    isDragging.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    touchStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = touchStartX.current - e.clientX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) handleNext();
      else handlePrev();
    }

    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const getCardStyle = (index: number) => {
    const visibleIndexes = getVisibleIndexes();
    const position = visibleIndexes.indexOf(index);

    if (position === -1) return { display: 'none' };

    const isCenter = position === 1;
    const translateX = (position - 1) * 100;
    const scale = isCenter ? 1 : 0.8;
    const opacity = isCenter ? 1 : 0.6;
    const zIndex = isCenter ? 2 : 1;

    return {
      transform: `translateX(${translateX}%) scale(${scale})`,
      opacity,
      zIndex,
    };
  };

  return (
    <div 
      className="relative h-[500px] overflow-hidden"
      role="region"
      aria-label="Card carousel"
    >
      <div
        ref={carouselRef}
        className="absolute inset-0 flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="absolute w-full max-w-md transition-all duration-500 ease-in-out transform-gpu"
            style={getCardStyle(index)}
            role="group"
            aria-label={`Slide ${index + 1} of ${cards.length}`}
            aria-hidden={index !== currentIndex}
          >
            <div 
              className="bg-white rounded-xl shadow-xl overflow-hidden cursor-pointer"
              onClick={() => {
                if (index === currentIndex && onSelect) {
                  onSelect(card);
                }
              }}
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 line-clamp-2">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-blue-600 w-6'
                : 'bg-gray-300 hover:bg-blue-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  );
};

export default CardCarousel;