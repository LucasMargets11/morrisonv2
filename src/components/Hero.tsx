import React, { useState } from 'react';
import { Search, Calendar as CalendarIcon, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';
import Calendar from './Calendar';
import dayjs from 'dayjs';

const Hero: React.FC = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null
  });

  const handleCalendarToggle = () => {
    setIsCalendarOpen(!isCalendarOpen);
    setIsGuestDropdownOpen(false);
  };

  const handleGuestDropdownToggle = () => {
    setIsGuestDropdownOpen(!isGuestDropdownOpen);
    setIsCalendarOpen(false);
  };

  const formatDateRange = () => {
    if (!selectedDates.startDate) return t('hero.search.selectDates');
    if (!selectedDates.endDate) {
      return dayjs(selectedDates.startDate).format('MMM D');
    }
    return `${dayjs(selectedDates.startDate).format('MMM D')} - ${dayjs(selectedDates.endDate).format('MMM D')}`;
  };

  const guestLabel = guestCount === 1
    ? (t('hero.search.guest') || t('hero.search.guests').replace(/s$/, ''))
    : t('hero.search.guests');

  return (
    <div className="relative h-screen -mt-[var(--header-height)]">
      
      {/* Fondo en VIDEO */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          src="/videos/fondo.mp4" // 👉 Ruta al video dentro de la carpeta public/videos
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/50"></div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-[var(--header-height)]">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          {t('hero.title')}
        </h1>
        <p className="text-xl text-white mb-8 max-w-2xl">
          {t('hero.subtitle')}
        </p>

        <div className="w-full max-w-4xl">
          <div className="flex items-stretch bg-white rounded-full shadow-lg overflow-hidden">
            
            <div className="flex-1 flex items-center pl-6">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder={t('hero.search.placeholder')}
                className="w-full px-4 py-4 focus:outline-none text-gray-700"
              />
            </div>

            <div className="flex items-center border-l border-gray-200">
              <button
                onClick={handleCalendarToggle}
                className="px-6 py-4 flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <CalendarIcon size={20} className="text-gray-400" />
                <span className="text-gray-700">{formatDateRange()}</span>
              </button>
            </div>

            <div className="flex items-center border-l border-gray-200 relative">
              <button
                onClick={handleGuestDropdownToggle}
                className="px-6 py-4 flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Users size={20} className="text-gray-400" />
                <span className="text-gray-700">
                  {guestCount} {guestLabel}
                </span>
              </button>

              {isGuestDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 min-w-[200px] z-[var(--z-dropdown)]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t('hero.search.guests')}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="text-gray-700 min-w-[20px] text-center">{guestCount}</span>
                      <button
                        onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 transition-colors">
              {t('hero.filters.search')}
            </button>
          </div>
        </div>
      </div>

      {isCalendarOpen && (
        <Calendar 
          monthsToShow={2} 
          onClose={() => setIsCalendarOpen(false)}
          onDateSelect={setSelectedDates}
        />
      )}
    </div>
  );
};

export default Hero;