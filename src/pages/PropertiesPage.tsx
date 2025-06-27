import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/admin';
import PropertyCard from '../components/UI/PropertyCard';
import { Property } from '../types';
import { MapPin, Search, Home as HomeIcon } from 'lucide-react';
import Button from '../components/UI/Button';
import PropertyMap from '../components/UI/PropertyMap';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../translations';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAhKUEMZevObTmkKtml47NvHQFkDKyZt7o'; // pon tu key aquí

const PropertiesPage: React.FC = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [bedroomCount, setBedroomCount] = useState<string>('all');

  // Fetch real properties from API
  const { data: properties = [], isLoading, isError } = useQuery({
    queryKey: ['properties'],
    queryFn: () => adminApi.getProperties(),
  });

  // Map API response to interface Property
  const mappedProperties: Property[] = useMemo(() =>
    properties.map((p: any) => ({
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
        ? p.images.map((img: any) => (typeof img === 'string' ? img : img.image))
        : [],
      isFeatured: !!p.is_featured,
      is_featured: !!p.is_featured,
      isForSale: true,
      isForRent: false,
      yearBuilt:
        typeof p.year_built === 'string' ? parseInt(p.year_built) : p.year_built,
      location: { lat: 0, lng: 0 },
      property_type: p.property_type,
    })),
  [properties]);

  // Filter logic
  const filteredProperties = useMemo(() => {
    return mappedProperties.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriceRange =
        priceRange === 'all' || (() => {
          const price = property.price || 0;
          switch (priceRange) {
            case 'under-500k': return price < 500000;
            case '500k-1m':    return price >= 500000 && price < 1000000;
            case '1m-2m':      return price >= 1000000 && price < 2000000;
            case 'over-2m':    return price >= 2000000;
            default:           return true;
          }
        })();

      const matchesType =
        propertyType === 'all' || property.property_type === propertyType;
      const matchesBedrooms =
        bedroomCount === 'all' || (property.bedrooms || 0) >= parseInt(bedroomCount);

      return (
        matchesSearch && matchesPriceRange && matchesType && matchesBedrooms
      );
    });
  }, [mappedProperties, searchTerm, priceRange, propertyType, bedroomCount]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg"
            alt="Luxury home"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Find Your Dream Home
          </h1>
          <p className="text-xl text-center mb-8 max-w-2xl">
            Discover exceptional properties that match your lifestyle and aspirations
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('hero.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('hero.filters.anyPrice')}</option>
                  <option value="under-500k">Under $500k</option>
                  <option value="500k-1m">$500k - $1M</option>
                  <option value="1m-2m">$1M - $2M</option>
                  <option value="over-2m">Over $2M</option>
                </select>
              </div>
              <div>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('hero.filters.anyType')}</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="duplex">Duplex</option>
                  <option value="land">Land</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {t('hero.filters.search')}
              </button>
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
              {isLoading ? 'Loading...' : `${filteredProperties.length} Available Properties`}
            </h2>
            <p className="text-gray-600 mt-1">Showing results for your search</p>
          </div>

          <div className="flex gap-4 mt-4 md:mt-0">
            <select
              value={bedroomCount}
              onChange={(e) => setBedroomCount(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Any Bedrooms</option>
              <option value="1">1+ Bed</option>
              <option value="2">2+ Beds</option>
              <option value="3">3+ Beds</option>
              <option value="4">4+ Beds</option>
              <option value="5">5+ Beds</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setPriceRange('all');
                setPropertyType('all');
                setBedroomCount('all');
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
                <div className="col-span-2 py-12 text-center text-gray-500">Loading properties...</div>
              )}
              {isError && (
                <div className="col-span-2 py-12 text-center text-red-500">Error loading properties.</div>
              )}
              {!isLoading && !isError && filteredProperties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => setSelectedProperty(property)}
                  className="cursor-pointer transform transition-transform hover:scale-[1.02]"
                >
                  <PropertyCard property={property} />
                </div>
              ))}
              {!isLoading && !isError && filteredProperties.length === 0 && (
                <div className="col-span-2 py-12 text-center text-gray-500">
                  <HomeIcon size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-xl font-medium mb-2">No properties found</p>
                  <p>Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </div>

          {/* Map Section */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-24 h-[calc(100vh-6rem)]">
            <div className="bg-white rounded-lg shadow-md p-4 h-full">
              <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
                {selectedProperty ? (
                  <PropertyMap property={selectedProperty} apiKey={GOOGLE_MAPS_API_KEY} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                    <div className="text-center">
                      <MapPin size={32} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Select a property to view its location</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;

