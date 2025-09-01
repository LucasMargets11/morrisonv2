import React, { useEffect, useState } from 'react';
import Calendar from './Calendar';
import { BedDouble, Bath, Ruler, Calendar as CalendarIcon, Home, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { adminApi } from '../lib/admin';
import { Property } from '../types';
import { formatPrice, formatNumber } from '../utils/formatters';
import Button from './UI/Button';
import Badge from './UI/Badge';

interface PropertyDetailsProps {
  property: Property;
}

type Slot = '00-12' | '12-24' | null;

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property }) => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  const [seasonalPrice, setSeasonalPrice] = useState<number | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pricings, setPricings] = useState<any[]>([]);
  const [checkInSlot, setCheckInSlot] = useState<Slot>(null);
  const [checkOutSlot, setCheckOutSlot] = useState<Slot>(null);
  const [blockedRanges, setBlockedRanges] = useState<{ start: string; end: string }[]>([]);
  const navigate = useNavigate();
  const GENERIC_WHATSAPP_NUMBER = '5491130454989';

  // Rol de usuario
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{ role: string }>('/users/role/');
        setIsAdmin(data.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    })();
  }, []);

  // Tarifas estacionales
  useEffect(() => {
    if (property?.id) {
      api.get(`/properties/${property.id}/pricing/`).then(res => setPricings(res.data));
    }
  }, [property]);

  // Bloqueos (status=blocked bookings)
  useEffect(() => {
    (async () => {
      if (!property?.id) return;
      try {
        const blocks = await adminApi.getBlocks(Number(property.id));
        const mapped = blocks.map((b: any) => ({ start: b.check_in_date, end: b.check_out_date }));
        setBlockedRanges(mapped);
      } catch (e) {
        // ignore
      }
    })();
  }, [property]);

  // Precio estacional (si todo el rango cae en una tarifa)
  useEffect(() => {
    if (startDate && endDate && pricings.length > 0) {
      const found = pricings.find((p: any) =>
        new Date(p.start_date) <= startDate && new Date(p.end_date) >= endDate
      );
      setSeasonalPrice(found ? Number(found.amount ?? found.price) : null);
    } else {
      setSeasonalPrice(null);
    }
  }, [startDate, endDate, pricings]);

  const getTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    const base = Number(seasonalPrice ?? property.price);
    const msPerDay = 1000 * 60 * 60 * 24;
    const nightsRaw = Math.round((endDate.getTime() - startDate.getTime()) / msPerDay);
    const nights = Math.max(nightsRaw, 1); // mínimo 1 noche

    let total = 0;
    for (let i = 0; i < nights; i++) {
      const day = new Date(startDate.getTime());
      day.setDate(startDate.getDate() + i);
      const special = pricings.find(
        (p: any) => new Date(p.start_date) <= day && new Date(p.end_date) >= day
      );
      total += special ? Number(special.amount ?? special.price) : base;
    }
    // Sin descuentos por media jornada: siempre se cobra la noche completa
    return Math.max(Math.round(total), base);
  };

  const formatDateRange = () => {
    if (!startDate) return 'Seleccioná fechas';
    if (!endDate) return `Desde ${startDate.toLocaleDateString()}`;
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  const handleWhatsAppClick = () => {
    const phone = GENERIC_WHATSAPP_NUMBER;
    const horarioIn = checkInSlot === '00-12' ? '00:00 a 12:00' : checkInSlot === '12-24' ? '12:00 a 00:00' : '';
    const horarioOut = checkOutSlot === '00-12' ? '00:00 a 12:00' : checkOutSlot === '12-24' ? '12:00 a 00:00' : '';
    const message = encodeURIComponent(
      `Hola, estoy interesado en la propiedad "${property.title}" ubicada en ${property.address}. ` +
      `Fechas seleccionadas: ${formatDateRange()}. ` +
      `Check-in: ${horarioIn}. Check-out: ${horarioOut}. ¿Podría brindarme más información?`
    );
    if (phone) window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    else alert('No hay número de WhatsApp disponible para esta propiedad.');
  };

  // Abrir calendario desde cualquiera de los dos botones
  const openCalendar = () => setIsCalendarOpen(true);

  // Recibir selección en tiempo real del Calendar (primer y último click)
  const handleCalendarSelect = ({ startDate: s, endDate: e }: { startDate: Date | null; endDate: Date | null }) => {
    if (s && e && sameDay(s, e)) {
      // mismo día: tratamos como 1 noche (end = start + 1 día)
      const nextDay = addDays(s, 1);
      setDateRange([s, nextDay]);
    } else {
      setDateRange([s ?? null, e ?? null]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {property.isForSale   && <Badge variant="primary">En venta</Badge>}
            {property.isForRent   && <Badge variant="info">En alquiler</Badge>}
            {property.isFeatured  && <Badge variant="success">Destacado</Badge>}
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{property.title}</h1>
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/properties/${property.id}/edit`)}
                className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 border-blue-200"
              >
                <Edit size={16} />
                <span className="text-sm font-medium">Editar</span>
              </Button>
            )}
          </div>
          <p className="text-gray-600 mt-1 flex items-center">
            <Home size={16} className="mr-1" />
            <span>
              <strong>Dirección:</strong> {property.address}, <strong>Ciudad:</strong> {property.city}, <strong>Provincia:</strong> {property.state} <strong>Código Postal:</strong> {property.zipCode}
            </span>
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <p className="text-3xl font-bold text-blue-900">{formatPrice(property.price)}</p>
          {property.isForRent && <p className="text-gray-600 text-sm">por mes</p>}
        </div>
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 border-y border-gray-200 py-6">
        <div className="flex flex-col items-center p-3 text-center">
          <BedDouble size={24} className="text-blue-900 mb-2" />
          <p className="text-xl font-semibold">{property.bedrooms}</p>
          <p className="text-gray-600 text-sm">Dormitorios</p>
        </div>
        <div className="flex flex-col items-center p-3 text-center">
          <Bath size={24} className="text-blue-900 mb-2" />
          <p className="text-xl font-semibold">{property.bathrooms}</p>
          <p className="text-gray-600 text-sm">Baños</p>
        </div>
        <div className="flex flex-col items-center p-3 text-center">
          <Ruler size={24} className="text-blue-900 mb-2" />
          <p className="text-xl font-semibold">{formatNumber(property.squareFeet)}</p>
          <p className="text-gray-600 text-sm">Metros cuadrados</p>
        </div>
        <div className="flex flex-col items-center p-3 text-center">
          <CalendarIcon size={24} className="text-blue-900 mb-2" />
          <p className="text-xl font-semibold">{property.yearBuilt}</p>
          <p className="text-gray-600 text-sm">Año de construcción</p>
        </div>
      </div>

      {/* Selección de fechas y precio */}
      <div className="mb-8">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Check-in */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
            <button
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-white"
              onClick={openCalendar}
              type="button"
            >
              {startDate ? startDate.toLocaleDateString() : 'Selecciona fecha de Check-in'}
            </button>
            <div className="mt-2 flex space-x-2">
              <button
                className={`px-3 py-1 rounded ${checkInSlot === '00-12' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setCheckInSlot('00-12')}
                type="button"
              >
                Mañana
              </button>
              <button
                className={`px-3 py-1 rounded ${checkInSlot === '12-24' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setCheckInSlot('12-24')}
                type="button"
              >
                Tarde
              </button>
            </div>
          </div>

          {/* Check-out */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
            <button
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-white"
              onClick={openCalendar}
              type="button"
            >
              {endDate ? endDate.toLocaleDateString() : 'Selecciona fecha de Check-out'}
            </button>
            <div className="mt-2 flex space-x-2">
              <button
                className={`px-3 py-1 rounded ${checkOutSlot === '00-12' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setCheckOutSlot('00-12')}
                type="button"
              >
                Mañana
              </button>
              <button
                className={`px-3 py-1 rounded ${checkOutSlot === '12-24' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setCheckOutSlot('12-24')}
                type="button"
              >
                Tarde
              </button>
            </div>
          </div>
        </div>

        {/* Modal calendario único (misma UI que el resto) */}
    {isCalendarOpen && (
          <Calendar
            monthsToShow={2}
            initialStartDate={startDate ?? undefined}
            initialEndDate={endDate ?? undefined}
            onDateSelect={handleCalendarSelect}
      blockedRanges={blockedRanges}
      basePrice={Number(property.price)}
      pricingRanges={pricings.map(p => ({ start_date: p.start_date, end_date: p.end_date, price: Number(p.price ?? p.amount) }))}
            onClose={() => setIsCalendarOpen(false)}
          />
        )}

        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => {
              setDateRange([null, null]);
              setCheckInSlot(null);
              setCheckOutSlot(null);
            }}
            className="mb-2 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Resetear fechas
          </button>
        )}

        <div className="mt-2">
          <span className="text-lg font-bold">
            Precio: ${seasonalPrice !== null ? seasonalPrice : property.price}/noche
          </span>
        </div>
        {startDate && endDate && (
          <div className="mt-2 text-blue-700 font-semibold">
            Total estadía: ${getTotalPrice()}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleWhatsAppClick}
          className="bg-green-500 hover:bg-green-600 flex items-center justify-center gap-2"
        >
          <img
            src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/message-circle.svg"
            alt="WhatsApp"
            className="w-5 h-5 invert"
          />
          Contact via WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default PropertyDetails;
