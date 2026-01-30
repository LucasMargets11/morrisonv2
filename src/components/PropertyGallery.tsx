import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { resolvePropertyImageUrl } from '../utils/imageUrl';
import ResponsiveImage from './ResponsiveImage';

interface PropertyImageObj {
  url?: string | null;
  originalUrl?: string | null;
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

  const containerRef = useRef<HTMLDivElement>(null);

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do nothing if user is typing in a form
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowLeft') {
          prev();
      } else if (e.key === 'ArrowRight') {
          next();
      } else if (e.key === 'Escape' && isLightboxOpen) {
          closeLightbox();
      }
    };

    // Attach listener if lightbox is open OR if container is focused (managed via tabIndex logic typically, 
    // but for desktop convenience, checking if gallery "active" or global listener for detail page is common.
    // The requirement says "when viewport desktop AND carousel active (click/tap) OR lightbox".
    
    // For lightbox (global listener when open)
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {};
  }, [isLightboxOpen, currentIndex, total]); // dependencies for prev/next access

  const openLightbox = () => {
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = '';
  };

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => next(),
    onSwipedRight: () => prev(),
    preventScrollOnSwipe: false, // Allow vertical scroll
    trackMouse: true, 
    delta: 50, 
  });

  // Prepare Hero Image Props
  const currentImg = normalizedImages[currentIndex];
  const heroSrc = currentImg ? currentImg.original : '';
  
  const heroSources = useMemo(() => {
    if (!currentImg) return [];
    
    const webpSrcSet = [
      currentImg.derived480 ? `${currentImg.derived480} 480w` : null,
      currentImg.derived768 ? `${currentImg.derived768} 768w` : null
    ].filter(Boolean).join(', ');

    if (webpSrcSet) {
      return [{
        srcSet: webpSrcSet,
        type: 'image/webp',
        sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
      }];
    }
    return [];
  }, [currentImg]);

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
     if (window.matchMedia('(min-width: 768px)').matches) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prev();
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          next();
        }
     }
  };

  return (
  <div className="relative cv-auto gallery-sizer outline-none" 
       ref={containerRef}
       tabIndex={0} 
       onKeyDown={handleContainerKeyDown}
       onClick={() => containerRef.current?.focus()}
  >
      {/* Main Gallery */}
      <div className="relative h-[500px] touch-pan-y" {...swipeHandlers}>
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
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 w-10 h-10 items-center justify-center hover:bg-white transition-colors duration-200"
          aria-label="Previous image"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        )}
        
        {total > 1 && (
        <button
          onClick={next} 
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 w-10 h-10 items-center justify-center hover:bg-white transition-colors duration-200"
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
          <div className="relative w-full max-w-4xl p-4" onClick={(e) => e.stopPropagation()} {...swipeHandlers}>
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
              className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/40 transition-colors duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            )}

            {total > 1 && (
            <button
              onClick={next} 
              className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/40 transition-colors duration-200"
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