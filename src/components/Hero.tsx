import React, { useState, useEffect, useRef } from 'react';
import LazyVideo from './LazyVideo';
import { Search, Users, X, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';
import { useNavigate } from 'react-router-dom';
import { RENTAL_TYPES_OPTIONS } from '../constants/property-types';

const RENTAL_TYPES = RENTAL_TYPES_OPTIONS;

const Hero: React.FC = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const navigate = useNavigate();

  // Guest counts
  const [babiesCount, setBabiesCount] = useState(0);
  const [childrenCount, setChildrenCount] = useState(0);
  const [adultsCount, setAdultsCount] = useState(1); // at least 1 adult

  // Search state
  const [rentalType, setRentalType] = useState<string>('');
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Lazy load suggestions (city/address/zone) once
  useEffect(() => {
    let cancelled = false;
    import('../lib/admin')
      .then(({ adminApi }) => adminApi.getProperties())
      .then((props) => {
        if (cancelled) return;
        const unique = Array.from(
          new Set(
            props
              .flatMap((p: any) => [p.city, p.address, p.zone])
              .filter(Boolean)
          )
        );
        setSuggestions(unique);
        setLoadingSuggestions(false);
      })
      .catch(() => setLoadingSuggestions(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.length > 1 && suggestions.length > 0) {
      setFilteredSuggestions(
        suggestions
          .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5)
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

  const toggleGuestModal = () => {
    setIsGuestModalOpen((open) => !open);
  };

  const clearGuests = () => {
    setBabiesCount(0);
    setChildrenCount(0);
    setAdultsCount(1);
  };

  const handleSearch = () => {
    // if (!rentalType) {
    //   // Optional: Show error or shake animation
    //   alert('Por favor selecciona un tipo de alquiler');
    //   return;
    // }

    const params = new URLSearchParams();
    if (rentalType) params.set('type', rentalType);
    if (searchValue.trim()) params.set('search', searchValue.trim());
    
    // Only add guest params if relevant (e.g. for vacacional)
    if (rentalType === 'vacacional') {
      if (adultsCount > 0) params.set('adults', adultsCount.toString());
      if (childrenCount > 0) params.set('children', childrenCount.toString());
      if (babiesCount > 0) params.set('babies', babiesCount.toString());
    }
    
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const totalGuests = babiesCount + childrenCount + adultsCount;

  return (
    // Se baja el contenido ~50px adicional respecto al header
    <section className="relative isolate hero-minh overflow-hidden pt-[calc(var(--nav-h)+50px)]">
      {/* Background video (cover, lazy mounted) */}
      <div className="absolute inset-0 z-0">
        <LazyVideo
          className="absolute inset-0 w-full h-full object-cover object-center md:object-[50%_40%]"
          objectFitCover
          /* Temporary poster fallback until optimized fpv1-poster.webp is added */
          poster={'/building.svg'}
          sources={[
            // Order efficient-first if available (optional: AV1/WEBM/MP4)
            { src: '/videos/fpv1.mp4', type: 'video/mp4' }
          ]}
          controls={false}
          muted
          loop
          autoPlay={true}
        />
        {/* Overlays para contraste */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Main content centered */}
      <div className="relative z-10 grid place-items-center px-6">
        <div className="w-full max-w-5xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-md text-white mb-2 max-w-[65ch] mx-auto">
            {t('hero.title')}
          </h1>
          <p className="text-white/90 mb-6 md:mb-6 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>

          {/* Desktop search bar */}
          <div className="hidden md:flex items-stretch bg-white rounded-full shadow-lg overflow-visible w-full max-w-4xl mx-auto relative z-20">
            {/* Rental Type Dropdown */}
            <div className="relative border-r border-gray-200 min-w-[240px]" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full h-full px-6 py-4 flex items-center justify-between bg-transparent focus:outline-none cursor-pointer group hover:bg-gray-50 rounded-l-full transition-colors"
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Tipo de Alquiler</span>
                  <span className={`text-sm font-medium truncate ${!rentalType ? 'text-gray-400' : 'text-gray-900'}`}>
                    {rentalType ? RENTAL_TYPES.find(t => t.value === rentalType)?.label : 'Seleccionar...'}
                  </span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} group-hover:text-blue-600`} 
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-[280px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                  {RENTAL_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setRentalType(type.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group ${
                        rentalType === type.value ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <span className={`text-sm ${rentalType === type.value ? 'text-blue-700 font-semibold' : 'text-gray-700 group-hover:text-gray-900'}`}>
                        {type.label}
                      </span>
                      {rentalType === type.value && <Check size={16} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
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

            {/* Guests trigger - Removed as per request */}
            {/* 
            <button
              onClick={toggleGuestModal}
              className={`px-6 py-4 flex items-center gap-2 border-l border-gray-200 hover:bg-gray-50 transition-colors ${rentalType !== 'vacacional' && rentalType !== '' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={rentalType !== 'vacacional' && rentalType !== ''}
              title={rentalType !== 'vacacional' && rentalType !== '' ? 'Solo para alquiler vacacional' : ''}
            >
              <Users size={20} className="text-gray-400" />
              <span className="text-gray-700">{totalGuests === 1 ? '1 Huésped' : `${totalGuests} Huéspedes`}</span>
            </button> 
            */}

            {/* Search button */}
            <div className="p-1.5">
              <button
                className={`h-full bg-blue-900 hover:bg-blue-800 text-white px-8 rounded-full transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium`}
                onClick={handleSearch}
              >
                <Search size={18} />
                {t('hero.filters.search')}
              </button>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden w-full max-w-sm mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden p-2">
               <div className="relative border-b border-gray-100 mb-2">
                  <select
                    value={rentalType}
                    onChange={(e) => setRentalType(e.target.value)}
                    className="w-full px-4 py-3 appearance-none bg-transparent focus:outline-none text-gray-700 font-medium"
                  >
                    <option value="" disabled>Tipo de Alquiler</option>
                    {RENTAL_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
               </div>

               {/* 
               <div className="flex gap-2 mb-2">
                  <button
                    onClick={toggleGuestModal}
                    className={`flex-1 bg-gray-50 rounded-lg px-3 py-3 flex items-center justify-center gap-2 ${rentalType !== 'vacacional' && rentalType !== '' ? 'opacity-50' : ''}`}
                    disabled={rentalType !== 'vacacional' && rentalType !== ''}
                  >
                    <Users size={18} className="text-gray-400" />
                    <span className="text-gray-700 text-sm">{totalGuests === 1 ? '1' : `${totalGuests}`}</span>
                  </button>
               </div> 
               */}

              <div className="flex flex-col relative">
                <div className="flex items-center px-2 py-2 border rounded-lg border-gray-200 mb-2">
                  <Search size={20} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    list="search-options-mobile"
                    value={searchValue}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
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
                <button
                  className={`bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors font-medium`}
                  onClick={handleSearch}
                >
                  {t('hero.filters.search')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guests Modal */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
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
            <div className="flex justify-between mt-6 space-x-2">
              <button
                onClick={clearGuests}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Limpiar
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
    </section>
  );
};

export default Hero;
