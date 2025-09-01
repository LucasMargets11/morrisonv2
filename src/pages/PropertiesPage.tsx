import React, { useMemo, useState, createContext, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/admin';
import PropertyCard from '../components/UI/PropertyCard';
import { Property } from '../types';
import { Home as HomeIcon, Users, X } from 'lucide-react';
import Button from '../components/UI/Button';
import PropertyMap from '../components/UI/PropertyMap';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAhKUEMZevObTmkKtml47NvHQFkDKyZt7o'; // pon tu key aquí

// Modal context para controlar visibilidad global
const ModalContext = createContext<{ modalOpen: boolean; setModalOpen: (open: boolean) => void }>({ modalOpen: false, setModalOpen: () => {} });

export function useModal() {
  return useContext(ModalContext);
}

const PropertiesPage: React.FC = () => {
  useLanguage(); // language context initialized (value not directly needed here)
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const navigate = useNavigate();

  // Removed unused selectedProperty state

  const search = params.get('search') || '';
  const start = params.get('start') || '';
  const end = params.get('end') || '';
  const adults = params.get('adults') || '';
  const children = params.get('children') || '';
  const babies = params.get('babies') || '';
  const zone = params.get('zone') || '';
  const priceRange = params.get('priceRange') || 'all';
  const initialPropertyType = params.get('propertyType') || 'all';
  const [propertyType, setPropertyTypeState] = useState<string>(initialPropertyType);
  const bedroomCount = params.get('bedroomCount') || 'all';

  // Fetch filtered properties from API
  const { data: properties = [], isLoading, isError } = useQuery({
    queryKey: ['properties', { search, start, end, adults, children, babies, zone, priceRange, propertyType, bedroomCount }],
    queryFn: () => adminApi.getProperties({ search, start, end, adults, children, babies, zone, priceRange, propertyType, bedroomCount }),
  });

  // Map API response to interface Property
  // Define a type for the API property if not already defined
  type ApiProperty = {
    id: string | number;
    title: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    price: string | number;
    bedrooms: string | number;
    bathrooms: string | number;
    square_feet: string | number;
    description: string;
    features: string[];
    images: (string | { image: string })[];
    is_featured: boolean;
    year_built: string | number;
    property_type: string;
    latitude?: number;
    longitude?: number;
  };

  const mappedProperties: Property[] = useMemo(() =>
    (properties as unknown as ApiProperty[]).map((p) => ({
      id: String(p.id),
      title: p.title,
      address: p.address,
      city: p.city,
      state: p.state,
      zipCode: p.zip_code,
      price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
      bedrooms: typeof p.bedrooms === 'string' ? parseInt(p.bedrooms) : p.bedrooms,
      bathrooms: typeof p.bathrooms === 'string' ? parseFloat(p.bathrooms) : p.bathrooms,
      squareFeet: typeof p.square_feet === 'string' ? parseInt(p.square_feet) : p.square_feet,
      description: p.description,
      features: Array.isArray(p.features) ? p.features : [],
      images: Array.isArray(p.images)
        ? p.images.map((img) => (typeof img === 'string' ? img : img.image))
        : [],
      isFeatured: !!p.is_featured,
      is_featured: !!p.is_featured,
      isForSale: true,
      isForRent: false,
      yearBuilt:
        typeof p.year_built === 'string' ? parseInt(p.year_built) : p.year_built,
      location: { lat: 0, lng: 0 },
      property_type: p.property_type,
      latitude: p.latitude,
      longitude: p.longitude,
    })),
  [properties]);

  // Ciudades y tipos únicos para los selects
  // Removed uniqueCities (not used in current UI)

  // Removed setZone & setPriceRange (replaced by rental type select)

  function setPropertyType(value: string): void {
    setPropertyTypeState(value);
    const newParams = new URLSearchParams(location.search);
    if (value && value !== 'all') newParams.set('propertyType', value); else newParams.delete('propertyType');
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  }

  // Removed setBedroomCount (not shown in condensed search bar)

  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPropertyListOpen, setIsPropertyListOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tempAdultsCount, setTempAdultsCount] = useState(parseInt(adults) || 1);
  const [tempChildrenCount, setTempChildrenCount] = useState(parseInt(children) || 0);
  const [tempBabiesCount, setTempBabiesCount] = useState(parseInt(babies) || 0);
  const [tempDates, setTempDates] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: start ? new Date(start) : null,
    endDate: end ? new Date(end) : null,
  });
  const [searchInput, setSearchInput] = useState(search);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load suggestions for search
  useEffect(() => {
    if (mappedProperties.length > 0) {
      const unique = Array.from(
        new Set(
          mappedProperties.flatMap((p) => [
            p.title,
            p.address,
            p.city,
            `${p.address}, ${p.city}`,
          ]).filter(Boolean)
        )
      );
      setSuggestions(unique);
    }
  }, [mappedProperties]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams(location.search);
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const filteredSuggestions = searchInput.length > 1 
    ? suggestions.filter(s => s.toLowerCase().includes(searchInput.toLowerCase())).slice(0, 5)
    : [];

  // Estado para huéspedes
  // Removed derived counts (unused duplicates of temp states)

  const openCalendar = () => {
    setIsCalendarOpen(true);
    setModalOpen(true);
  };
  // closeCalendar helper removed (inline handling)
  const openGuests = () => {
    setIsGuestModalOpen(true);
    setModalOpen(true);
  };
  const closeGuests = () => {
    setIsGuestModalOpen(false);
    setModalOpen(false);
  };
  const openPropertyList = () => {
    setIsPropertyListOpen(true);
    setModalOpen(true);
  };
  const closePropertyList = () => {
    setIsPropertyListOpen(false);
    setModalOpen(false);
  };
  const openTypeModal = () => {
    setIsTypeModalOpen(true);
    setModalOpen(true);
  };
  const closeTypeModal = () => {
    setIsTypeModalOpen(false);
    setModalOpen(false);
  };

  const totalGuests = tempAdultsCount + tempChildrenCount + tempBabiesCount;

  return (
    <ModalContext.Provider value={{ modalOpen, setModalOpen }}>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative min-h-[320px] md:min-h-[400px] bg-gradient-to-r from-blue-900 to-blue-700 flex flex-col justify-center items-center pt-24 md:pt-32">
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg"
              alt="Luxury home"
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="relative w-full max-w-4xl mx-auto px-4 h-full flex flex-col items-center justify-center text-white z-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-8 md:mb-4 text-center drop-shadow-lg">
              Encontrá tu alquiler soñado
            </h1>
            <p className="hidden md:block text-lg md:text-xl text-center mb-6 md:mb-8 max-w-3xl">
              Descubre propiedades excepcionales que se adaptan a tu estilo de vida y aspiraciones
            </p>

            {/* Modern Search Bar */}
            <div className="w-full bg-white/95 rounded-2xl shadow-2xl p-3 flex flex-col md:flex-row items-stretch gap-2 md:gap-0 mt-4 md:mt-8 mb-8 md:mb-0" style={{ filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.2))' }}>
              {/* Búsqueda - Reemplaza la zona select */}
              <div className="flex-1 flex items-center gap-2 px-2 py-2 relative border-r md:border-r border-gray-200 md:border-b-0 border-b">
                <span className="text-blue-700">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/></svg>
                </span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchKeyPress}
                  onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                  placeholder="Buscar por dirección, nombre o zona..."
                  className="w-full bg-transparent text-gray-900 border-none focus:ring-0 text-base placeholder-gray-500"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1">
                    {filteredSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchInput(suggestion);
                          setShowSuggestions(false);
                          const params = new URLSearchParams(location.search);
                          params.set('search', suggestion);
                          window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 text-gray-700 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Tipo de Alquiler (abre modal) */}
              <div className="flex-1 flex items-center gap-2 px-2 py-2 border-r md:border-r border-gray-200 md:border-b-0 border-b">
                <span className="text-blue-700">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
                </span>
                <button
                  type="button"
                  onClick={openTypeModal}
                  className="w-full text-left bg-transparent text-gray-900 border-none focus:ring-0 text-base px-0 py-0"
                >
                  {propertyType === 'all' ? 'Tipo de alquiler' :
                    propertyType === 'temporal' ? 'Alquiler temporal' :
                    propertyType === 'vacacional' ? 'Alquiler vacacional' :
                    propertyType === 'tradicional' ? 'Alquiler tradicional' : propertyType}
                </button>
              </div>
              {/* Fechas (modal trigger) */}
              <div className="flex-1 flex items-center gap-2 px-2 py-2 border-r md:border-r border-gray-200 md:border-b-0 border-b">
                <span className="text-blue-700">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v8m0 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>
                </span>
                <button
                  type="button"
                  onClick={openCalendar}
                  className="w-full text-left bg-transparent text-gray-900 border-none focus:ring-0 text-base px-0 py-0"
                >
                  {start && end
                    ? `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`
                    : 'Selecciona fechas'}
                </button>
              </div>
              {/* Huéspedes (modal trigger) */}
              <div className="flex-1 flex items-center gap-2 px-2 py-2 border-r md:border-r border-gray-200 md:border-b-0 border-b">
                <span className="text-blue-700">
                  <Users size={20} />
                </span>
                <button
                  type="button"
                  onClick={openGuests}
                  className="w-full text-left bg-transparent text-gray-900 border-none focus:ring-0 text-base px-0 py-0"
                >
                  {totalGuests === 1 ? '1 Huésped' : `${totalGuests} Huéspedes`}
                </button>
              </div>
              {/* Botón buscar */}
              <div className="flex items-center px-2 py-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow w-full md:w-auto"
                  onClick={() => {
                    handleSearchSubmit();
                    window.scrollTo({ top: 600, behavior: 'smooth' });
                  }}
                >
                  Buscar
                </Button>
              </div>
              {/* Botón listar propiedades en modal */}
              <div className="flex items-center px-2 py-2">
                <Button
                  variant="outline"
                  className="px-4 py-3 rounded-xl shadow w-full md:w-auto"
                  onClick={openPropertyList}
                >
                  Ver listado
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Filter Stats */}
          <div className="flex flex-wrap items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isLoading ? 'Cargando...' : `${mappedProperties.length} Propiedades disponibles`}
              </h2>
              <p className="text-gray-600 mt-1">
                {search ? `Mostrando resultados para "${search}"` : 'Mostrando resultados para tu búsqueda'}
              </p>
            </div>

            <div className="flex gap-4 mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchInput('');
                  window.history.replaceState({}, '', `${location.pathname}`);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Property Grid and Map */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Property Grid */}
            <div className="w-full lg:w-3/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading && (
                  <div className="col-span-2 py-12 text-center text-gray-500">Cargando propiedades...</div>
                )}
                {isError && (
                  <div className="col-span-2 py-12 text-center text-red-500">Error al cargar propiedades.</div>
                )}
                {!isLoading && !isError && mappedProperties.map((property) => (
                  <div
                    key={property.id}
                    className="cursor-pointer transform transition-transform hover:scale-[1.02]"
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
                {!isLoading && !isError && mappedProperties.length === 0 && (
                  <div className="col-span-2 py-12 text-center text-gray-500">
                    <HomeIcon size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-xl font-medium mb-2">Ninguna propiedad encontrada</p>
                    <p>Intenta ajustar tus criterios de búsqueda</p>
                  </div>
                )}
              </div>
            </div>

            {/* Map Section */}
            <div className="w-full lg:w-2/5 lg:sticky lg:top-24 h-[calc(100vh-6rem)]">
              <div className="bg-white rounded-lg shadow-md p-4 h-full">
                <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
                  <PropertyMap
                    apiKey={GOOGLE_MAPS_API_KEY}
                    locations={mappedProperties.map(p => ({
                      id: p.id,
                      address: `${p.address}, ${p.city}`,
                      price: p.price,
                      title: p.title,
                      imageUrl: p.images[0] || '',
                      zone: p.city,
                      propertyType: p.property_type,
                      latitude: p.latitude!,
                      longitude: p.longitude!,
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de huéspedes */}
        {isGuestModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
            <div className="relative w-full max-w-sm mx-auto bg-white rounded-xl shadow-2xl p-6 flex flex-col">
              <button
                onClick={closeGuests}
                className="absolute right-4 top-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Cerrar"
              >
                <X size={24} className="text-gray-500" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Huéspedes</h2>
              
              {/* Bebés */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-gray-900 font-medium">Bebés</span>
                  <p className="text-sm text-gray-500">Menores de 2 años</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTempBabiesCount(Math.max(0, tempBabiesCount - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="text-gray-700 min-w-[20px] text-center">{tempBabiesCount}</span>
                  <button
                    onClick={() => setTempBabiesCount(tempBabiesCount + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Niños */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-gray-900 font-medium">Niños</span>
                  <p className="text-sm text-gray-500">Edades 2-12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTempChildrenCount(Math.max(0, tempChildrenCount - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-gray-700 min-w-[20px] text-center">{tempChildrenCount}</span>
                  <button
                    onClick={() => setTempChildrenCount(tempChildrenCount + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Adultos */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-gray-900 font-medium">Adultos</span>
                  <p className="text-sm text-gray-500">Mayores de 13 años</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTempAdultsCount(Math.max(1, tempAdultsCount - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    disabled={tempAdultsCount <= 1}
                  >
                    -
                  </button>
                  <span className="text-gray-700 min-w-[20px] text-center">{tempAdultsCount}</span>
                  <button
                    onClick={() => setTempAdultsCount(tempAdultsCount + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  const params = new URLSearchParams(location.search);
                  params.set('adults', tempAdultsCount.toString());
                  params.set('children', tempChildrenCount.toString());
                  params.set('babies', tempBabiesCount.toString());
                  window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
                  setIsGuestModalOpen(false);
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

        {/* Modal de calendario */}
        {isCalendarOpen && (
          <Calendar
            monthsToShow={2}
            onClose={() => {
              setIsCalendarOpen(false);
              // Persist selected dates into URL params
              if (tempDates.startDate && tempDates.endDate) {
                const params = new URLSearchParams(location.search);
                params.set('start', tempDates.startDate.toISOString().split('T')[0]);
                params.set('end', tempDates.endDate.toISOString().split('T')[0]);
                window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
              }
            }}
            onDateSelect={setTempDates}
          />
        )}

        {/* Modal listado de propiedades */}
        {isPropertyListOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-5xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <h2 className="text-lg md:text-xl font-semibold">Propiedades ({mappedProperties.length})</h2>
                <button
                  onClick={closePropertyList}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {mappedProperties.map(property => (
                  <div key={property.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => { window.location.href = `/property/${property.id}`; }}>
                    <div className="h-40 w-full overflow-hidden rounded-t-xl bg-gray-100 relative">
                      {property.images[0] ? (
                        <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sin imagen</div>
                      )}
                      {Boolean(property.is_featured) && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">Destacada</span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-1">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{property.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{property.address}, {property.city}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-blue-600 font-bold text-sm">${property.price}</span>
                        <span className="text-[10px] uppercase tracking-wide text-gray-500">{property.property_type}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {mappedProperties.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-12">No hay propiedades.</div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
                <Button onClick={closePropertyList} className="bg-blue-600 hover:bg-blue-700 text-white">Cerrar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal tipo de alquiler */}
        {isTypeModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <h2 className="text-lg font-semibold">Tipo de alquiler</h2>
                <button onClick={closeTypeModal} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Cerrar">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 divide-y divide-gray-100">
                {[
                  { value: 'all', label: 'Todos los tipos' },
                  { value: 'temporal', label: 'Alquiler temporal' },
                  { value: 'vacacional', label: 'Alquiler vacacional' },
                  { value: 'tradicional', label: 'Alquiler tradicional' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setPropertyType(opt.value);
                      closeTypeModal();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                      propertyType === opt.value ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {propertyType === opt.value && (
                      <span className="text-blue-600 text-xs font-semibold">Seleccionado</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
                <Button onClick={closeTypeModal} variant="outline" className="mr-2">Cerrar</Button>
                <Button onClick={closeTypeModal} className="bg-blue-600 hover:bg-blue-700 text-white">Aplicar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalContext.Provider>
  );
};

export default PropertiesPage;

