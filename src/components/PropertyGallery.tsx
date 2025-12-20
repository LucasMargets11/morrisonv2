import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { resolvePropertyImageUrl } from '../utils/imageUrl';
import ResponsiveImage from './ResponsiveImage';

interface PropertyImageObj {
  url?: string | null;
  image?: string | null;
  s3_key?: string | null;
  derived480Url?: string;
  derived768Url?: string;
}

interface PropertyGalleryProps {
  // Accept plain URLs or objects with url/image/s3_key/derived...
  images: Array<string | PropertyImageObj>;
  title: string;
}

interface NormalizedImage {
  original: string;
  derived480?: string;
  derived768?: string;
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Normalize incoming images to object structure
  const normalizedImages: NormalizedImage[] = useMemo(() => {
    return (images || [])
      .map((img) => {
        if (typeof img === 'string') {
          return { original: img };
        }
        const original = resolvePropertyImageUrl(img, { preferSigned: true }) || '';
        if (!original) return null;
        
        return {
          original,
          derived480: img.derived480Url || undefined,
          derived768: img.derived768Url || undefined
        };
      })
      .filter((img): img is NormalizedImage => !!img);
  }, [images]);

  const total = normalizedImages.length;

  const handleNavigation = (newIndex: number) => {
    setCurrentIndex(newIndex);
    setHasNavigated(true);
  };

  const next = () => {
    if (!total) return;
    handleNavigation((currentIndex + 1) % total);
  };

  const prev = () => {
    if (!total) return;
    handleNavigation((currentIndex - 1 + total) % total);
  };

  const openLightbox = () => {
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = '';
  };

  // Prepare Hero Image Props
  const currentImg = normalizedImages[currentIndex];
  const heroSrc = currentImg ? (currentImg.derived768 || currentImg.derived480 || currentImg.original) : '';
  
  const heroSources = useMemo(() => {
    if (!currentImg) return [];
    const s = [];
    // Prefer 768w for larger screens
    if (currentImg.derived768) {
      s.push({ srcSet: currentImg.derived768, type: 'image/webp', media: '(min-width: 480px)' });
    }
    // Use 480w for smaller screens
    if (currentImg.derived480) {
      s.push({ srcSet: currentImg.derived480, type: 'image/webp', media: '(max-width: 479px)' });
    }
    return s;
  }, [currentImg]);

  return (
  <div className="relative cv-auto gallery-sizer">
      {/* Main Gallery */}
      <div className="relative h-[500px]">
        {total > 0 && currentImg ? (
          <ResponsiveImage
            src={heroSrc}
            sources={heroSources}
            alt={`${title} - Image ${currentIndex + 1}`}
            width={1600}
            height={1000}
            lazy={false} // Always eager for the hero
            priority={currentIndex === 0 && !hasNavigated} // High priority only for the first load
            sizes="(max-width: 768px) 100vw, 1600px"
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
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 w-10 h-10 flex items-center justify-center hover:bg-white transition-colors duration-200"
          aria-label="Previous image"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        )}
        
        {total > 1 && (
        <button
          onClick={next} 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 w-10 h-10 flex items-center justify-center hover:bg-white transition-colors duration-200"
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
            onClick={() => handleNavigation(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden transition-all ${
              index === currentIndex ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
            }`}
            aria-pressed={index === currentIndex}
            aria-label={`Ver imagen ${index + 1} de ${total}`}
          >
            <ResponsiveImage
              src={image.derived480 || image.original}
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
              src={normalizedImages[currentIndex]?.original || ''}
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