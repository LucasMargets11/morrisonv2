import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, Users, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';
import Calendar from './Calendar';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const navigate = useNavigate();
  const videoUrl = `${import.meta.env.BASE_URL}videos/fondo.mp4`;

  // Date selection state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });

  // Guest selection state
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [babiesCount, setBabiesCount] = useState(0);
  const [childrenCount, setChildrenCount] = useState(0);
  const [adultsCount, setAdultsCount] = useState(1);

  const totalGuests = babiesCount + childrenCount + adultsCount;

  // Sugerencias
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    // Cargar sugerencias únicas de city, address y zone al montar el componente
    import('../lib/admin').then(({ adminApi }) => adminApi.getProperties()).then((props) => {
      const unique = Array.from(
        new Set(
          props.flatMap((p: any) => [
            p.city,
            p.address,
            p.zone,
          ]).filter(Boolean)
        )
      );
      setSuggestions(unique);
      setLoadingSuggestions(false);
    });
  }, []);

  const [searchValue, setSearchValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.length > 1 && suggestions.length > 0) {
      setFilteredSuggestions(
        suggestions.filter(s =>
          s.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5)
      );
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (s: string) => {
    setSearchValue(s);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };

  // Toggle handlers
  const toggleCalendar = () => {
    setIsCalendarOpen(open => !open);
    setIsGuestModalOpen(false);
  };
  const toggleGuestModal = () => {
    setIsGuestModalOpen(open => !open);
    setIsCalendarOpen(false);
  };

  // Format date range
  const formatDateRange = () => {
    if (!selectedDates.startDate) return t('hero.search.selectDates');
    if (!selectedDates.endDate) return dayjs(selectedDates.startDate).format('MMM D');
    return `${dayjs(selectedDates.startDate).format('MMM D')} - ${dayjs(
      selectedDates.endDate
    ).format('MMM D')}`;
  };

  // Clear selected dates
  const clearSelectedDates = () => {
    setSelectedDates({ startDate: null, endDate: null });
  };

  // Nueva función para limpiar invitados y fechas
  const clearGuestsAndDates = () => {
    setBabiesCount(0);
    setChildrenCount(0);
    setAdultsCount(1);
    setSelectedDates({ startDate: null, endDate: null });
  };

  // Botón de búsqueda: redirige a /properties con filtros en query params
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    }
    if (selectedDates.startDate) {
      params.set('start', dayjs(selectedDates.startDate).format('YYYY-MM-DD'));
    }
    if (selectedDates.endDate) {
      params.set('end', dayjs(selectedDates.endDate).format('YYYY-MM-DD'));
    }
    if (adultsCount > 0) {
      params.set('adults', adultsCount.toString());
    }
    if (childrenCount > 0) {
      params.set('children', childrenCount.toString());
    }
    if (babiesCount > 0) {
      params.set('babies', babiesCount.toString());
    }
    
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="relative h-screen -mt-[var(--header-height)]">
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/50" />
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-[var(--header-height)]">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          {t('hero.title')}
        </h1>
        <p className="text-xl text-white mb-8 max-w-2xl">
          {t('hero.subtitle')}
        </p>

        {/* Desktop layout */}
        <div className="hidden md:flex items-stretch bg-white rounded-full shadow-lg overflow-hidden w-full max-w-4xl">
          {/* Search input */}
          <div className="flex-1 flex flex-col relative pl-6">
            <div className="flex items-center">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                list="search-options"
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                placeholder={t('hero.search.placeholder')}
                className="w-full px-4 py-4 focus:outline-none text-gray-700"
                autoComplete="off"
                disabled={loadingSuggestions}
              />
              <datalist id="search-options">
                {suggestions.map((s, idx) => (
                  <option key={idx} value={s} />
                ))}
              </datalist>
            </div>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow z-20">
                {filteredSuggestions.map((s, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                    onMouseDown={() => handleSuggestionClick(s)}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
            {loadingSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow z-20 px-4 py-2 text-gray-500">
                Cargando sugerencias...
              </div>
            )}
          </div>

          {/* Date picker trigger */}
          <button
            onClick={toggleCalendar}
            className="px-6 py-4 flex items-center gap-2 border-l border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <CalendarIcon size={20} className="text-gray-400" />
            <span className="text-gray-700">{formatDateRange()}</span>
          </button>

          {/* Guests trigger */}
          <button
            onClick={toggleGuestModal}
            className="px-6 py-4 flex items-center gap-2 border-l border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Users size={20} className="text-gray-400" />
            <span className="text-gray-700">{totalGuests === 1 ? '1 Huésped' : `${totalGuests} Huéspedes`}</span>
          </button>

          {/* Search button */}
          <button className="bg-blue-900 hover:bg-blue-700 text-white px-8 py-4 transition-colors" onClick={handleSearch}>
            {t('hero.filters.search')}
          </button>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden w-full max-w-sm mx-auto space-y-4">
          {/* Top row: Calendar and Guests buttons */}
          <div className="flex gap-3">
            {/* Date picker trigger */}
            <button
              onClick={toggleCalendar}
              className="flex-1 bg-white rounded-xl shadow-lg px-4 py-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <CalendarIcon size={20} className="text-gray-400" />
              <span className="text-gray-700 text-sm font-medium">{formatDateRange()}</span>
            </button>

            {/* Guests trigger */}
            <button
              onClick={toggleGuestModal}
              className="flex-1 bg-white rounded-xl shadow-lg px-4 py-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Users size={20} className="text-gray-400" />
              <span className="text-gray-700 text-sm font-medium">{totalGuests === 1 ? '1 Huésped' : `${totalGuests} Huéspedes`}</span>
            </button>
          </div>

          {/* Bottom row: Search input and button */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex flex-col relative">
              <div className="flex items-center px-4 py-4">
                <Search size={20} className="text-gray-400 mr-3" />
                <input
                  type="text"
                  list="search-options-mobile"
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                  placeholder={t('hero.search.placeholder')}
                  className="flex-1 focus:outline-none text-gray-700"
                  autoComplete="off"
                  disabled={loadingSuggestions}
                />
                <datalist id="search-options-mobile">
                  {suggestions.map((s, idx) => (
                    <option key={idx} value={s} />
                  ))}
                </datalist>
              </div>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
                  {filteredSuggestions.map((s, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-700 border-b border-gray-100 last:border-b-0"
                      onMouseDown={() => handleSuggestionClick(s)}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              {loadingSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20 px-4 py-3 text-gray-500">
                  Cargando sugerencias...
                </div>
              )}
              
              {/* Search button */}
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white py-4 transition-colors font-medium" 
                onClick={handleSearch}
              >
                {t('hero.filters.search')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guests Modal */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleGuestModal}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto p-6">
            <button
              onClick={toggleGuestModal}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close guests"
            >
              <X size={24} className="text-gray-500" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invitados</h2>
            <div className="space-y-6">
              {/* Bebés */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-900 font-medium">Bebés</span>
                  <p className="text-sm text-gray-500">Menores de 2 años</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBabiesCount(Math.max(0, babiesCount - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-gray-700 min-w-[20px] text-center">{babiesCount}</span>
                  <button
                    onClick={() => setBabiesCount(babiesCount + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Niños */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-900 font-medium">Niños</span>
                  <p className="text-sm text-gray-500">Edades 2-12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-gray-700 min-w-[20px] text-center">{childrenCount}</span>
                  <button
                    onClick={() => setChildrenCount(childrenCount + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Adultos */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-900 font-medium">Adultos</span>
                  <p className="text-sm text-gray-500">Mayores de 13 años</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    disabled={adultsCount <= 1}
                  >
                    -
                  </button>
                  <span className="text-gray-700 min-w-[20px] text-center">{adultsCount}</span>
                  <button
                    onClick={() => setAdultsCount(adultsCount + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            {/* Action buttons row */}
            <div className="flex justify-between mt-6 space-x-2">
              <button
                onClick={clearGuestsAndDates}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Limpiar fechas
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={toggleGuestModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={toggleGuestModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <Calendar
          monthsToShow={window.innerWidth < 640 ? 1 : 2}
          onClose={toggleCalendar}
          onDateSelect={setSelectedDates}
        />
      )}
    </div>
  );
};

export default Hero;
