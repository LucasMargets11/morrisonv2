import React, { useState, useMemo } from 'react';
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
  View,
  SlotInfo,
} from 'react-big-calendar';
import DatePicker from 'react-datepicker';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Property,
  PropertyPricing,
  Booking,
  MaintenanceEvent,
} from '../../types/admin';
import { adminApi } from '../../lib/admin';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import Button from '../UI/Button';
import { DollarSign } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import { formatCalendarEvents, getEventStyle } from '../../utils/CalendarEvents';
import { useCalendarData } from '../../hooks/useCalendarData';
import BlockForm from './BlockForm';
import MaintenanceForm from './MaintenanceForm';

// Helper for legend items (moved above usage)
const Legend: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <div className="flex items-center">
    <div className={`w-4 h-4 rounded bg-${color} mr-2`} />
    <span className="text-sm text-gray-600">{children}</span>
  </div>
);

// Configure locale for react-big-calendar
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface PropertyCalendarProps { property: Property; }
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'maintenance' | 'blocked';
  status: string;
  price?: number;
  allDay?: boolean;
}
interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<PropertyPricing>) => void;
  initialData?: Partial<PropertyPricing>;
}

// Modal for adding seasonal pricing
const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const [startDate, setStartDate] = useState<Date | null>(
    initialData.start_date ? new Date(initialData.start_date) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialData.end_date ? new Date(initialData.end_date) : null
  );
  const [price, setPrice] = useState(
    initialData.price?.toString() || ''
  );
  const [minNights, setMinNights] = useState(initialData.min_nights?.toString() || '1');
  const [maxNights, setMaxNights] = useState(initialData.max_nights?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      start_date: startDate?.toISOString().split('T')[0],
      end_date: endDate?.toISOString().split('T')[0],
      price: parseFloat(price),
      min_nights: parseInt(minNights, 10),
      max_nights: maxNights ? parseInt(maxNights, 10) : undefined,
      price_type: 'seasonal',
      currency: 'USD',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Set Seasonal Pricing</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Range Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex gap-4">
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                minDate={new Date()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholderText="Start date"
              />
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || new Date()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholderText="End date"
              />
            </div>
          </div>

          {/* Pricing Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per night ($)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum nights</label>
              <input
                type="number"
                value={minNights}
                onChange={e => setMinNights(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum nights</label>
              <input
                type="number"
                value={maxNights}
                onChange={e => setMaxNights(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min={parseInt(minNights, 10)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Save Pricing</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main calendar component
const PropertyCalendar: React.FC<PropertyCalendarProps> = ({ property }) => {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState<Date>(new Date());
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch data with types
  const calendarData = useCalendarData(Number(property.id));
  const bookings: Booking[] = Array.isArray(calendarData.bookings) ? calendarData.bookings : [];
  const maintenance: MaintenanceEvent[] = Array.isArray(calendarData.maintenance) ? calendarData.maintenance : [];
  const blocks: any[] = Array.isArray(calendarData.blocks) ? calendarData.blocks : [];
  const { data: pricing = [] } = useQuery<PropertyPricing[]>({
    queryKey: ['pricing', property],
    queryFn: () => adminApi.getPricing(Number(property)),
  });

  // Mutation: invalidate with object style
  const createPricingMutation = useMutation<PropertyPricing, Error, Partial<PropertyPricing>>({
    mutationFn: data => adminApi.createPricing({ ...data, property: property.id }), // <-- property, no property_id
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing', property.id] });
      setShowPricingModal(false);
    },
  });

  // Build events list
  const events = useMemo(() => formatCalendarEvents({
    bookings,
    maintenance,
    blocks,
    pricing,
    properties: [property],
  }), [bookings, maintenance, blocks, pricing, property]);

  const handleSelectSlot = (_slot: SlotInfo) => {};

  const handleAddPricing = (data: Partial<PropertyPricing>) => {
    createPricingMutation.mutate(data);
  };

  // Handlers para abrir modales
  const handleAddBlock = () => setShowBlockModal(true);
  const handleAddMaintenance = () => setShowMaintenanceModal(true);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Property Calendar</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAddMaintenance}>
            Mantenimiento
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddBlock}>
            Bloquear Fechas
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPricingModal(true)}>
            <DollarSign size={16} className="mr-1" /> Set Pricing
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="h-[600px]">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={(v: View) => setView(v)}
          date={date}
          onNavigate={(d: Date) => setDate(d)}
          selectable
          eventPropGetter={event => ({ style: getEventStyle(event) })}
          tooltipAccessor={(e: CalendarEvent) => e.title}
          popup
          className="rounded-lg"
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4">
        <Legend color="green-600">Confirmed Bookings</Legend>
        <Legend color="yellow-500">Pending Bookings</Legend>
        <Legend color="indigo-500">Maintenance</Legend>
        <Legend color="purple-600">Seasonal Pricing</Legend>
      </div>

      {/* Modals */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSubmit={handleAddPricing}
      />
      {showBlockModal && (
        <BlockForm
          property={property}
          onClose={() => setShowBlockModal(false)}
          onSuccess={() => {
            setShowBlockModal(false);
            queryClient.invalidateQueries(['blocks', property.id]);
          }}
        />
      )}
      {showMaintenanceModal && (
        <MaintenanceForm
          property={property}
          onClose={() => setShowMaintenanceModal(false)}
          onSuccess={() => {
            setShowMaintenanceModal(false);
            queryClient.invalidateQueries(['maintenance', property.id]);
          }}
        />
      )}
    </div>
  );
};

export default PropertyCalendar;