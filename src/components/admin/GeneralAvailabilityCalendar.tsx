import React, { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/admin';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus } from 'lucide-react';
import { formatCalendarEvents, getEventStyle } from '../../utils/CalendarEvents';
import { useCalendarData } from '../../hooks/useCalendarData';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'maintenance' | 'blocked';
  status: string;
  propertyName: string;
  allDay?: boolean;
}

const GeneralAvailabilityCalendar: React.FC = () => {
  // Trae todas las propiedades
  // Define the Property type or import it if already defined elsewhere
  interface Property {
    id: string;
    title: string;
    // add other fields as needed
  }

  const { data: properties = [], refetch } = useQuery<Property[]>({
    queryKey: ['admin', 'properties'],
    queryFn: adminApi.getProperties,
  });

  // Trae los bloques globales
  const { data: blocks = [] } = useQuery({
    queryKey: ['admin', 'blocks'],
    queryFn: adminApi.getBlocks,
  });
  const bookings: CalendarEvent[] = [] as CalendarEvent[];
  const maintenance: CalendarEvent[] = [] as CalendarEvent[];

  // Genera los eventos para el calendario
  const events = useMemo(() => formatCalendarEvents({
    bookings,
    maintenance,
    blocks,
    properties,
  }), [bookings, maintenance, blocks, properties]);

  // Filtro por propiedad
  const [filter, setFilter] = useState<string>('all');
  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.propertyName === filter);

  // Modal para ocupar fechas
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md p-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Calendario General de Disponibilidad</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Ocupar fechas
        </button>
      </div>
      <div className="mb-4">
        <label className="mr-2 font-medium">Filtrar por propiedad:</label>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">Todas</option>
          {properties.map((p: any) => (
            <option key={p.id} value={p.title}>{p.title}</option>
          ))}
        </select>
      </div>
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        style={{ height: 600 }}
        popup
        eventPropGetter={event => ({ style: getEventStyle(event) })}
        tooltipAccessor={event => event.title}
      />
      <div className="mt-4 flex gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-green-600 mr-2"></div>
          <span className="text-sm text-gray-600">Reserva confirmada</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-yellow-500 mr-2"></div>
          <span className="text-sm text-gray-600">Reserva pendiente</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-indigo-500 mr-2"></div>
          <span className="text-sm text-gray-600">Mantenimiento</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-purple-600 mr-2 border-2 border-purple-800"></div>
          <span className="text-sm text-gray-800 font-bold">🛑 Bloqueado</span>
        </div>
      </div>
      <OccupyDatesModal
        open={showModal}
        onClose={() => setShowModal(false)}
        properties={properties}
        onSuccess={() => {
          setShowModal(false);
          refetch(); // Refresca el calendario tras crear el bloqueo
        }}
      />
    </div>
  );
};

// Modal para ocupar fechas
interface OccupyDatesModalProps {
  open: boolean;
  onClose: () => void;
  properties: any[];
  onSuccess: () => void;
}

const OccupyDatesModal: React.FC<OccupyDatesModalProps> = ({ open, onClose, properties, onSuccess }) => {
  const [propertyId, setPropertyId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !start || !end) return;
    try {
      await adminApi.createBlock({
        property: propertyId,
        check_in_date: start,
        check_out_date: end,
        guest_count: 0,
        total_amount: 0,
        reason,
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Error al bloquear fechas');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Ocupar fechas</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Departamento</label>
            <select
              value={propertyId}
              onChange={e => setPropertyId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Selecciona un departamento</option>
              {properties.map((p: any) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Desde</label>
            <input
              type="date"
              value={start}
              onChange={e => setStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hasta</label>
            <input
              type="date"
              value={end}
              onChange={e => setEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Ocupar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneralAvailabilityCalendar;