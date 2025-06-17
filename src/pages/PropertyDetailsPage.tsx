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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [halfIn, setHalfIn] = useState<'am' | 'pm'>('am');
  const [halfOut, setHalfOut] = useState<'am' | 'pm'>('am');

  const [seasonalPrice, setSeasonalPrice] = useState<number | null>(null);
  const [pricings, setPricings] = useState<any[]>([]);

  // Fetch property and similar
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await api.get(`/properties/${id}/`);
        setProperty(data);
        const all = await api.get('/properties/');
        const similar = all.data.results.filter((p: Property) =>
          p.id !== id && p.city === data.city && Math.abs(p.price - data.price) < data.price * 0.3
        ).slice(0, 3);
        setSimilarProperties(similar);
        document.title = `${data.title} | Premier Estates`;
      } catch {
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id, navigate]);

  // Load seasonal pricings
  useEffect(() => {
    if (property?.id) {
      api.get(`/properties/${property.id}/pricing/`).then(res => setPricings(res.data));
    }
  }, [property]);

  // Update seasonal price when dates change
  useEffect(() => {
    if (checkIn && checkOut && pricings.length) {
      const found = pricings.find(p =>
        new Date(p.start_date) <= checkIn && new Date(p.end_date) >= checkOut
      );
      setSeasonalPrice(found ? found.price : null);
    } else {
      setSeasonalPrice(null);
    }
  }, [checkIn, checkOut, pricings]);

  // Calculate nights between dates
  const getNights = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  // Total with half-day adjustments
  const getTotalPrice = () => {
    if (!checkIn || !checkOut || !property) return 0;
    const nights = getNights(checkIn, checkOut);
    const pricePerDay = seasonalPrice ?? property.price;
    let total = nights * pricePerDay;
    if (halfIn === 'pm') total -= pricePerDay / 2;
    if (halfOut === 'am') total -= pricePerDay / 2;
    return total;
  };

  // Delete property
  const deleteProperty = async (propertyId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) return;
    await api.delete(`/properties/${propertyId}/`);
    navigate('/', { replace: true });
  };

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

      {/* Gallery & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PropertyGallery
            images={Array.isArray(property.images)
              ? property.images.map((img: any) => (typeof img === 'string' ? img : img.image))
              : []}
            title={property.title}
          />
        </div>
        <div>
          <PropertyDetails property={property} />
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

function formatDateRange(): string {
  // placeholder: reused from component
  return '';
}
