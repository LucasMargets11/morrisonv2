import React, { useState, useEffect } from 'react';
import { BedDouble, Bath, Ruler, Calendar as CalendarIcon, Home, Check, ChevronDown, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../lib/api';
import { Property } from '../types';
import { formatPrice, formatNumber } from '../utils/formatters';
import Button from './UI/Button';
import Badge from './UI/Badge';

interface PropertyDetailsProps {
  property: Property;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property }) => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  // Helper to set only the start date
  const setStartDate = (date: Date | null) => setDateRange([date, endDate]);
  const [seasonalPrice, setSeasonalPrice] = useState<number | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pricings, setPricings] = useState<any[]>([]);
  const [checkInSlot, setCheckInSlot] = useState<'00-12' | '12-24' | null>(null);
  const [checkOutSlot, setCheckOutSlot] = useState<'00-12' | '12-24' | null>(null);
  const navigate = useNavigate();
  const GENERIC_WHATSAPP_NUMBER = '5491130454989';

  // Obtener rol de usuario desde DRF
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{ role: string }>('/users/role/');
        setIsAdmin(data.role === 'admin');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setIsAdmin(false);
      }
    })();
  }, []);

  // Carga de tarifas estacionales
  useEffect(() => {
    if (property?.id) {
      api.get(`/properties/${property.id}/pricing/`).then(res => setPricings(res.data));
    }
  }, [property]);

  // Actualizar precio estacional según rango seleccionado
  useEffect(() => {
    if (startDate && endDate && pricings.length > 0) {
      const found = pricings.find(p =>
        new Date(p.start_date) <= startDate &&
        new Date(p.end_date) >= endDate
      );
      setSeasonalPrice(found ? Number(found.amount ?? found.price) : null);
    } else {
      setSeasonalPrice(null);
    }
  }, [startDate, endDate, pricings]);

  // Solicitar cita de visita a la API DRF
  const handleScheduleViewing = async () => {
    if (!startDate || !endDate) return;
    try {
      await api.post('/api/reservas/bloquear/', {
        propiedad: property.id,
        fecha_inicio: startDate.toISOString().split('T')[0],
        fecha_fin: endDate.toISOString().split('T')[0],
        horario_checkin: checkInSlot,
        horario_checkout: checkOutSlot,
      });
      navigate('/payment');
    } catch (error) {
      console.error('Error scheduling viewing:', error);
    }
  };

  // Cálculo del precio total de la estadía
  const getTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    let total = 0;
    let current = new Date(startDate);
    const end = new Date(endDate);
    const pricePerDay = seasonalPrice ?? property.price;

    while (current < end) {
      const special = pricings.find(p =>
        new Date(p.start_date) <= current &&
        new Date(p.end_date) >= current
      );
      total += special ? Number(special.amount ?? special.price) : Number(pricePerDay);
      current.setDate(current.getDate() + 1);
    }
    // Ajuste por media jornada
    if (checkInSlot === '12-24') total -= pricePerDay / 2;
    if (checkOutSlot === '00-12') total -= pricePerDay / 2;
    return total;
  };

  // Cálculo de rango de fechas (visualmente)
  const formatDateRange = () => {
    if (!startDate) return 'Select dates to schedule a viewing';
    if (!endDate)   return `From ${startDate.toLocaleDateString()}`;
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  // Manejar clic en WhatsApp
  const handleWhatsAppClick = () => {
    const phone = GENERIC_WHATSAPP_NUMBER;
    const horarioIn = checkInSlot === '00-12' ? '00:00 a 12:00' : checkInSlot === '12-24' ? '12:00 a 00:00' : '';
    const horarioOut = checkOutSlot === '00-12' ? '00:00 a 12:00' : checkOutSlot === '12-24' ? '12:00 a 00:00' : '';
    const message = encodeURIComponent(
      `Hola, estoy interesado en la propiedad "${property.title}" ubicada en ${property.address}. ` +
      `Fechas seleccionadas: ${formatDateRange()}. ` +
      `Check-in: ${horarioIn}. Check-out: ${horarioOut}. ¿Podría brindarme más información?`
    );
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    } else {
      alert('No hay número de WhatsApp disponible para esta propiedad.');
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
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
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
            <DatePicker
              selected={endDate}
              onChange={date => setDateRange([startDate, date])}
              minDate={startDate || new Date()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
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
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => setDateRange([null, null])}
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

      {/* Programar visita */}
      <div className="mb-8">
        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <CalendarIcon className="text-blue-600" size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Schedule a Viewing</h3>
              <p className="text-sm text-gray-600">{formatDateRange()}</p>
            </div>
          </div>
          <ChevronDown
            className={`text-blue-600 transition-transform duration-300 ${
              isCalendarOpen ? 'rotate-180' : ''
            }`}
            size={20}
          />
        </button>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isCalendarOpen ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white rounded-lg shadow-lg p-6">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                <span>Selected Dates</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                <span>Unavailable Dates</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!startDate || !endDate}
                onClick={handleScheduleViewing}
              >
                Schedule Viewing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Description</h2>
        <p className="text-gray-700 leading-relaxed">{property.description}</p>
      </div>

      {/* Características */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-2 gap-x-4">
          {property.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <Check size={18} className="text-green-600 mr-2" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones finales */}
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
