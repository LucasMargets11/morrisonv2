import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const next = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const openLightbox = () => {
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <div className="relative">
      {/* Main Gallery */}
      <div className="relative h-[500px]">
        <img 
          src={images[currentIndex]} 
          alt={`${title} - Image ${currentIndex + 1}`} 
          className="w-full h-full object-cover rounded-lg"
        />
        
        <button 
          onClick={openLightbox}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
          aria-label="View full size"
        >
          <Expand size={20} className="text-gray-700" />
        </button>
        
        <button 
          onClick={prev} 
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
          aria-label="Previous image"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        
        <button 
          onClick={next} 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
          aria-label="Next image"
        >
          <ChevronRight size={20} className="text-gray-700" />
        </button>
      </div>
      
      {/* Thumbnails */}
      <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden transition-all ${
              index === currentIndex ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <img 
              src={image} 
              alt={`${title} - Thumbnail ${index + 1}`}
              className="w-full h-full object-cover" 
            />
          </button>
        ))}
      </div>
      
      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center" onClick={closeLightbox}>
          <div className="relative w-full max-w-4xl p-4" onClick={(e) => e.stopPropagation()}>
            <img 
              src={images[currentIndex]} 
              alt={`${title} - Full size image ${currentIndex + 1}`}
              className="w-full max-h-[90vh] object-contain" 
            />
            
            <button 
              onClick={prev} 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/40 transition-colors duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            
            <button 
              onClick={next} 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/40 transition-colors duration-200"
              aria-label="Next image"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
            
            <button 
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/40 transition-colors duration-200"
              aria-label="Close lightbox"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyGallery;