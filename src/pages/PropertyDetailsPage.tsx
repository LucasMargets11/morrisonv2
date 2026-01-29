// pages/PropertyDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Property } from '../types';
import PropertyGallery from '../components/PropertyGallery';
import PropertyDetails from '../components/PropertyDetails';
import Button from '../components/UI/Button';
import PropertyGrid from '../components/PropertyGrid';
import { useProperty } from '../hooks/useProperty';
import api from '../lib/api';

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const { data: property, isLoading, isError } = useProperty(id);

  // Removed in favor of internal handling inside PropertyDetails

  // Fetch property and similar
  useEffect(() => {
    const loadSimilar = async () => {
      try {
        const all = await api.get('properties/');
        const baseList = Array.isArray(all.data.results) ? all.data.results : all.data;
        const similar = property && baseList
          .filter((p: any) => p.id !== property.id && p.city === property.city && Math.abs(p.price - property.price) < property.price * 0.3)
          .slice(0, 3)
          .map((p: any) => ({
            ...p,
            squareFeet: p.square_feet ?? p.squareFeet,
            yearBuilt: p.year_built ?? p.yearBuilt,
            zipCode: p.zip_code ?? p.zipCode,
            features: Array.isArray(p.features) ? p.features.map((f: any) => (typeof f === 'string' ? f : f.name)) : [],
            images: Array.isArray(p.images) ? p.images.map((img: any) => (typeof img === 'string' ? img : (img.url || img.image))) : [],
          }));
        setSimilarProperties(similar || []);
        if (property) document.title = `${property.title} | Grupo Bairen`;
      } catch {
        navigate('/', { replace: true });
      }
    };
    if (id) loadSimilar();
  }, [id, navigate, property]);

  // Previous pricing/date logic now handled inside child component

  if (isLoading || !property) {
    return <div className="container mx-auto px-4 py-24">Cargando...</div>;
  }
  if (isError) {
    return <div className="container mx-auto px-4 py-24 text-red-600">Error al cargar la propiedad.</div>;
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
        Volver a la lista
      </Button>

      {/* Gallery + Sidebar (title/info/calendar/price/actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <PropertyGallery
            images={Array.isArray(property.images) ? (property.images as any[]) : []}
            title={property.title}
          />

          {/* Description & Features (moved below gallery) */}
          <section id="description" className="pt-4 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Descripción</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
          </section>

          {property.features && property.features.length > 0 && (
            <section id="features" className="pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Características</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-3 gap-x-6">
  {property.features.map((feature: any, idx: number) => (
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
            title="Propiedades Similares"
            subtitle="También podría interesarte estas propiedades"
          />
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;

// Removed unused helper
