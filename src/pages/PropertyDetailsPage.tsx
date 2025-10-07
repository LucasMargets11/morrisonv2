// pages/PropertyDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { Property } from '../types';
import PropertyGallery from '../components/PropertyGallery';
import PropertyDetails from '../components/PropertyDetails';
import Button from '../components/UI/Button';
import PropertyGrid from '../components/PropertyGrid';

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Removed in favor of internal handling inside PropertyDetails

  // Fetch property and similar
  useEffect(() => {
    const fetchProperty = async () => {
      try {
  const { data } = await api.get(`properties/${id}/`);
        // Normalizar campos snake_case -> camelCase usados en componentes
        const normalized = {
          ...data,
          squareFeet: data.square_feet ?? data.squareFeet,
          yearBuilt: data.year_built ?? data.yearBuilt,
          zipCode: data.zip_code ?? data.zipCode,
          features: Array.isArray(data.features)
            ? data.features.map((f: any) => (typeof f === 'string' ? f : f.name))
            : [],
          images: Array.isArray(data.images)
            ? data.images.map((img: any) => (typeof img === 'string' ? img : (img.url || img.image)))
            : [],
        } as any;
        setProperty(normalized);
  const all = await api.get('properties/');
        const baseList = Array.isArray(all.data.results) ? all.data.results : all.data;
        const similar = baseList
          .filter((p: any) => p.id !== data.id && p.city === data.city && Math.abs(p.price - data.price) < data.price * 0.3)
          .slice(0, 3)
          .map((p: any) => ({
            ...p,
            squareFeet: p.square_feet ?? p.squareFeet,
            yearBuilt: p.year_built ?? p.yearBuilt,
            zipCode: p.zip_code ?? p.zipCode,
            features: Array.isArray(p.features) ? p.features.map((f: any) => (typeof f === 'string' ? f : f.name)) : [],
            images: Array.isArray(p.images) ? p.images.map((img: any) => (typeof img === 'string' ? img : (img.url || img.image))) : [],
          }));
        setSimilarProperties(similar);
        document.title = `${data.title} | Grupo Bairen`;
      } catch {
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id, navigate]);

  // Previous pricing/date logic now handled inside child component

  if (loading || !property) {
    return <div className="container mx-auto px-4 py-24">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-24">
      {/* Back Button */}
      <Button
        variant="text"
        className="mb-6 hover:translate-x-[-4px] transition-transform"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} className="mr-1" />
        Back to listings
      </Button>

      {/* Gallery + Sidebar (title/info/calendar/price/actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <PropertyGallery
            images={Array.isArray(property.images)
              ? property.images.map((img: any) => (typeof img === 'string' ? img : (img.url || img.image)))
              : []}
            title={property.title}
          />

          {/* Description & Features (moved below gallery) */}
          <section id="description" className="pt-4 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
          </section>

          {property.features && property.features.length > 0 && (
            <section id="features" className="pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-3 gap-x-6">
        {property.features.map((feature: any, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-2 w-2 bg-blue-600 rounded-full"></span>
          <span>{typeof feature === 'string' ? feature : feature.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="lg:sticky top-24 space-y-6">
            <PropertyDetails property={property} />
          </div>
        </div>
      </div>

      {/* Integrated Date + Half-day + Price */}
      

      

      {similarProperties.length > 0 && (
        <div className="mt-16">
          <PropertyGrid
            properties={similarProperties}
            title="Similar Properties"
            subtitle="You might also be interested in these properties"
          />
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;

// Removed unused helper
