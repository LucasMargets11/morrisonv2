import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { resolvePropertyImageUrl } from '../utils/imageUrl';
import ResponsiveImage from './ResponsiveImage';
// import { buildSrcSet } from '../utils/images'; // reserved for future srcset variants

interface PropertyGalleryProps {
  // Accept plain URLs or objects with url/image/s3_key
  images: Array<string | { url?: string | null; image?: string | null; s3_key?: string | null }>;
  title: string;
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Normalize incoming images to simple URL strings
  const normalizedImages = useMemo(() => {
    return (images || [])
      .map((img) =>
        typeof img === 'string' ? img : (resolvePropertyImageUrl(img, { preferSigned: true }) || '')
      )
      .filter(Boolean);
  }, [images]);

  const total = normalizedImages.length;
  // const fallbackSrc = '/building.svg'; // served from public/

  const next = () => {
    if (!total) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % total);
  };

  const prev = () => {
    if (!total) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + total) % total);
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
  <div className="relative cv-auto">
      {/* Main Gallery */}
      <div className="relative h-[500px]">
        {total > 0 ? (
          <ResponsiveImage
            src={normalizedImages[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            width={1600}
            height={1000}
            lazy={true}
            sizes="(max-width: 768px) 100vw, 1600px"
            srcSet={undefined}
            className="w-full h-full rounded-lg"
            placeholderSrc={undefined}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg text-gray-400">
            Sin imágenes
          </div>
        )}
        
        {total > 0 && (
        <button
          onClick={openLightbox}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
          aria-label="View full size"
        >
          <Expand size={20} className="text-gray-700" />
        </button>
        )}
        
        {total > 1 && (
        <button
          onClick={prev} 
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
          aria-label="Previous image"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        )}
        
        {total > 1 && (
        <button
          onClick={next} 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
          aria-label="Next image"
        >
          <ChevronRight size={20} className="text-gray-700" />
        </button>
        )}
      </div>
      
      {/* Thumbnails */}
      <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
        {normalizedImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden transition-all ${
              index === currentIndex ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <ResponsiveImage
              src={image}
              alt={`${title} - Thumbnail ${index + 1}`}
              width={160}
              height={160}
              lazy={true}
              className="w-full h-full"
              placeholderSrc={undefined}
            />
          </button>
        ))}
      </div>
      
      {/* Lightbox (portal to ensure highest stacking, z > header) */}
      {isLightboxOpen && createPortal((
        <div className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center backdrop-blur-sm" onClick={closeLightbox}>
          <div className="relative w-full max-w-4xl p-4" onClick={(e) => e.stopPropagation()}>
            <ResponsiveImage
              src={normalizedImages[currentIndex]}
              alt={`${title} - Full size image ${currentIndex + 1}`}
              width={1600}
              height={1000}
              lazy={false}
              className="w-full max-h-[90vh] object-contain"
              placeholderSrc={undefined}
            />
            
            {total > 1 && (
            <button
              onClick={prev} 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/40 transition-colors duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            )}

            {total > 1 && (
            <button
              onClick={next} 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/40 transition-colors duration-200"
              aria-label="Next image"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
            )}
            
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
      ), document.body)}
    </div>
  );
};

export default PropertyGallery;