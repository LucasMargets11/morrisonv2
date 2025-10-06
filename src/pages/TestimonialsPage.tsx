import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { testimonials as sharedTestimonials } from '../data/testimonials';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';
import { useSwipeable } from 'react-swipeable';

const TestimonialsPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language } = useLanguage();
  const t = useTranslation(language);

  const testimonials = sharedTestimonials;

  const next = useCallback(() => setCurrentIndex((i) => (i + 1) % testimonials.length), [testimonials.length]);
  const prev = useCallback(() => setCurrentIndex((i) => (i - 1 + testimonials.length) % testimonials.length), [testimonials.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  const handlers = useSwipeable({
    onSwipedLeft: () => next(),
    onSwipedRight: () => prev(),
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 35
  });

  const regionRef = useRef<HTMLDivElement | null>(null);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.testimonials.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('home.testimonials.subtitle')}</p>
        </div>

        <div 
          className="relative max-w-4xl mx-auto px-2 sm:px-4" 
          aria-roledescription="carousel"
          aria-label="Testimonials"
          ref={regionRef}
        >
          <div {...handlers} className="relative" role="group">
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((t, idx) => (
                  <div 
                    key={t.id} 
                    className="w-full flex-shrink-0 px-4"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Slide ${idx + 1} of ${testimonials.length}`}
                  >
                    <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-blue-500">
                        <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex mb-4" aria-label={`Rating: ${t.rating} out of 5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 italic mb-6">"{t.text}"</p>
                      <h4 className="text-lg font-bold text-gray-900">{t.name}</h4>
                      <p className="text-gray-600">{t.location}</p>
                      <div className="flex justify-between items-center w-full mt-6 text-sm">
                        <span className="text-blue-600 font-medium">{t.service}</span>
                        <span className="text-gray-500">{t.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={prev} 
              className="absolute left-2 top-1/2 -translate-y-1/2 z-50 h-12 w-12 hidden md:grid place-items-center rounded-full bg-white/90 backdrop-blur shadow-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Anterior"
            >
              <ChevronLeft size={28} className="text-gray-700" />
            </button>
            <button 
              onClick={next} 
              className="absolute right-2 top-1/2 -translate-y-1/2 z-50 h-12 w-12 hidden md:grid place-items-center rounded-full bg-white/90 backdrop-blur shadow-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Siguiente"
            >
              <ChevronRight size={28} className="text-gray-700" />
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 mx-1 rounded-full ${index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsPage;
