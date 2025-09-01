import React, { useState, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Property, Booking, PropertyPricing } from '../../types/admin';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import Button from '../UI/Button';
// import { DollarSign } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import { formatCalendarEvents, getEventStyle, EventInput } from '../../utils/CalendarEvents';
import { useCalendarData } from '../../hooks/useCalendarData';
import BlockForm from './BlockForm';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
type CalendarEvent = EventInput;
// Pricing removed for now (simplified calendar focused on bookings + blocks)

// Main calendar component
const PropertyCalendar: React.FC<PropertyCalendarProps> = ({ property }) => {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState<Date>(new Date());
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<null | { id: string; start: Date; end: Date; reason?: string }>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch data with types
  const calendarData = useCalendarData(Number(property.id));
  const bookings: Booking[] = Array.isArray(calendarData.bookings) ? calendarData.bookings : [];
  const blocks: any[] = Array.isArray(calendarData.blocks) ? calendarData.blocks : [];
  const { data: pricing = [] } = useQuery<PropertyPricing[]>({
    queryKey: ['pricing', property.id],
    queryFn: () => import('../../lib/admin').then(m => m.adminApi.getPricing(Number(property.id)))
  });
  const createPricingMutation = useMutation({
    mutationFn: (data: { start_date: string; end_date: string; price: number; min_nights?: number; max_nights?: number }) =>
      import('../../lib/admin').then(m => m.adminApi.createPricing({
        property: Number(property.id),
        start_date: data.start_date,
        end_date: data.end_date,
        price: data.price,
        min_nights: data.min_nights || 1,
        max_nights: data.max_nights || 0,
        price_type: 'seasonal',
        currency: 'USD'
      })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing', property.id] });
      setShowPricingModal(false);
    }
  });

  // Build events list
  const events: CalendarEvent[] = useMemo(() => {
    const base = formatCalendarEvents({
      bookings,
      blocks,
      pricing,
      properties: [property],
    });
    // Añadir precio base como eventos diarios (solo para vista mes) evitando solapar pricing/bloqueos
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const hasOverride = (d: Date) => base.some(e => (e.type === 'pricing' || e.type === 'blocked') && d >= e.start && d < e.end);
    const dayEvents: CalendarEvent[] = [];
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      if (hasOverride(day)) continue;
      dayEvents.push({
        id: `base-${day.toISOString().slice(0,10)}`,
        title: `$${property.price}`,
        start: day,
        end: day,
        type: 'basePrice',
        status: '',
        propertyName: property.title,
        allDay: true,
      });
    }
    return [...base, ...dayEvents];
  }, [bookings, blocks, pricing, property, date]);

  // slot selection handler not used currently

  const handleAddBlock = () => setShowBlockModal(true);
  const handleAddPricing = () => setShowPricingModal(true);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Property Calendar</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAddBlock}>
            Bloquear Fechas
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddPricing}>Tarifa x Día</Button>
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
          onSelectEvent={(event: any) => {
            if (event.type === 'blocked') {
              // id format blocked-<id>
              const rawId = String(event.id).replace('blocked-', '');
              setEditingBlock({ id: rawId, start: event.start, end: event.end });
              setShowEditModal(true);
            }
          }}
          eventPropGetter={(event) => ({ style: getEventStyle(event as CalendarEvent) })}
          tooltipAccessor={(e: any) => e.title}
          popup
          className="rounded-lg"
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4">
  <Legend color="green-600">Reservas Confirmadas</Legend>
  <Legend color="yellow-500">Reservas Pendientes</Legend>
  <Legend color="red-600">Bloqueado</Legend>
  <Legend color="purple-600">Tarifa</Legend>
  <Legend color="slate-500">Precio Base</Legend>
      </div>

      {/* Modals */}
      {showBlockModal && (
        <BlockForm
          property={property}
          onClose={() => setShowBlockModal(false)}
          onSuccess={() => {
            setShowBlockModal(false);
            queryClient.invalidateQueries({ queryKey: ['blocks', property.id] });
          }}
        />
      )}
      {showEditModal && editingBlock && (
        <EditBlockModal
          block={editingBlock}
          onClose={() => { setShowEditModal(false); setEditingBlock(null); }}
          onSaved={() => {
            setShowEditModal(false);
            setEditingBlock(null);
            queryClient.invalidateQueries({ queryKey: ['blocks', property.id] });
          }}
        />
      )}
      {showPricingModal && (
        <PricingModal
          onClose={() => setShowPricingModal(false)}
          onSubmit={(data) => createPricingMutation.mutate(data)}
        />
      )}
    </div>
  );
};

interface PricingModalProps {
  onClose: () => void;
  onSubmit: (data: { start_date: string; end_date: string; price: number; min_nights?: number; max_nights?: number }) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ onClose, onSubmit }) => {
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [price, setPrice] = useState('');
  const [minN, setMinN] = useState('1');
  const [maxN, setMaxN] = useState('');

  const save = () => {
    if (!start || !end || !price) return;
    onSubmit({
      start_date: start.toISOString().slice(0,10),
      end_date: end.toISOString().slice(0,10),
      price: parseFloat(price),
      min_nights: parseInt(minN,10) || 1,
      max_nights: maxN ? parseInt(maxN,10) : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Definir Tarifa</h2>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Desde</p>
              <DatePicker
                selected={start}
                onChange={d => setStart(d)}
                selectsStart
                startDate={start}
                endDate={end}
                className="w-full px-3 py-2 border rounded"
                placeholderText="Inicio"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Hasta</p>
              <DatePicker
                selected={end}
                onChange={d => setEnd(d)}
                selectsEnd
                startDate={start}
                endDate={end}
                minDate={start || undefined}
                className="w-full px-3 py-2 border rounded"
                placeholderText="Fin"
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Precio por día ($)</p>
            <input value={price} onChange={e=>setPrice(e.target.value)} type="number" min="0" className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Min noches</p>
              <input value={minN} onChange={e=>setMinN(e.target.value)} type="number" min="1" className="w-full px-3 py-2 border rounded" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Max noches</p>
              <input value={maxN} onChange={e=>setMaxN(e.target.value)} type="number" min="1" className="w-full px-3 py-2 border rounded" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-2 text-sm bg-gray-200 rounded">Cancelar</button>
          <button onClick={save} className="px-3 py-2 text-sm bg-blue-600 text-white rounded">Guardar</button>
        </div>
      </div>
    </div>
  );
};

interface EditBlockModalProps {
  block: { id: string; start: Date; end: Date; reason?: string };
  onClose: () => void;
  onSaved: () => void;
}

const EditBlockModal: React.FC<EditBlockModalProps> = ({ block, onClose, onSaved }) => {
  const [start, setStart] = useState(block.start.toISOString().slice(0,10));
  const [end, setEnd] = useState(block.end.toISOString().slice(0,10));
  const [reason, setReason] = useState(block.reason || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      await (await import('../../lib/admin')).adminApi.updateBlock(block.id, {
        check_in_date: start,
        check_out_date: end,
        reason: reason || undefined,
      });
      onSaved();
    } catch (e:any) {
      setError('Error al guardar');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('¿Desbloquear estas fechas?')) return;
    setSaving(true); setError(null);
    try {
      await (await import('../../lib/admin')).adminApi.deleteBlock(block.id);
      onSaved();
    } catch (e:any) {
      setError('Error al eliminar');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Editar Bloqueo</h2>
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">Desde
            <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
          </label>
          <label className="text-sm font-medium text-gray-700">Hasta
            <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
          </label>
          <label className="text-sm font-medium text-gray-700">Motivo
            <input type="text" value={reason} onChange={e=>setReason(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-between pt-2">
          <button onClick={handleDelete} disabled={saving} className="px-3 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50">Desbloquear</button>
          <div className="flex gap-2">
            <button onClick={onClose} disabled={saving} className="px-3 py-2 rounded bg-gray-200 text-sm">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCalendar;