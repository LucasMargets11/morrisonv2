import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Property, Booking, MaintenanceEvent } from '../../types/admin';
import { adminApi } from '../../lib/admin';
import { useQuery } from '@tanstack/react-query';
import Button from '../UI/Button';
import { Plus } from 'lucide-react';
import BookingForm from './BookingForm';
import MaintenanceForm from './MaintenanceForm';
import BlockForm from './BlockForm';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface AvailabilityCalendarProps {
  property: Property;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'maintenance';
  status: string;
  allDay?: boolean;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ property }) => {
  const [view, setView] = React.useState<import('react-big-calendar').View>(Views.MONTH);
  const [date, setDate] = React.useState(new Date());
  const [showBookingForm, setShowBookingForm] = React.useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = React.useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockRange, setBlockRange] = useState<{ start: Date; end: Date } | null>(null);

  const { data: bookings, refetch: refetchBookings } = useQuery({
    queryKey: ['bookings', property.id],
    queryFn: () => adminApi.getBookings(Number(property.id)),
  });

  const events: CalendarEvent[] = React.useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];

    // Add bookings to calendar
    bookings?.forEach((booking: Booking) => {
      calendarEvents.push({
        id: booking.id,
        title: `Booking: ${booking.guest_count} guests`,
        start: new Date(booking.check_in_date),
        end: new Date(booking.check_out_date),
        type: 'booking',
        status: booking.status,
        allDay: true,
      });
    });

    // Add maintenance events to calendar
    property.maintenance_events?.forEach((event: MaintenanceEvent) => {
      calendarEvents.push({
        id: event.id,
        title: `Maintenance: ${event.title}`,
        start: new Date(event.start_date),
        end: new Date(event.end_date),
        type: 'maintenance',
        status: event.status,
      });
    });

    return calendarEvents;
  }, [bookings, property.maintenance_events]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3B82F6'; // Default blue

    if (event.type === 'booking') {
      switch (event.status) {
        case 'confirmed':
          backgroundColor = '#059669'; // Green
          break;
        case 'pending':
          backgroundColor = '#F59E0B'; // Yellow
          break;
        case 'cancelled':
          backgroundColor = '#DC2626'; // Red
          break;
      }
    } else if (event.type === 'maintenance') {
      backgroundColor = '#6366F1'; // Indigo
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
      },
    };
  };

  const handleBookingSuccess = () => {
    refetchBookings();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Availability Calendar</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowBookingForm(true)}
          >
            <Plus size={16} className="mr-1" />
            Add Booking
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowMaintenanceForm(true)}
          >
            <Plus size={16} className="mr-1" />
            Schedule Maintenance
          </Button>
        </div>
      </div>

      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          tooltipAccessor={(event: CalendarEvent) => event.title}
          popup
          selectable
          onSelectSlot={slotInfo => {
            setBlockRange({ start: slotInfo.start, end: slotInfo.end });
            setShowBlockForm(true);
          }}
          className="rounded-lg"
        />
      </div>

      <div className="mt-4 flex gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-green-600 mr-2"></div>
          <span className="text-sm text-gray-600">Confirmed Bookings</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-yellow-500 mr-2"></div>
          <span className="text-sm text-gray-600">Pending Bookings</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-indigo-500 mr-2"></div>
          <span className="text-sm text-gray-600">Maintenance</span>
        </div>
      </div>

      {showBookingForm && (
        <BookingForm
          property={property}
          onClose={() => setShowBookingForm(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {showMaintenanceForm && (
        <MaintenanceForm
          property={property}
          onClose={() => setShowMaintenanceForm(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {showBlockForm && (
        <BlockForm
          property={property}
          range={blockRange}
          onClose={() => setShowBlockForm(false)}
          onSuccess={() => {
            setShowBlockForm(false);
            // Aquí puedes refrescar los bookings/eventos si es necesario
          }}
        />
      )}
    </div>
  );
};

export default AvailabilityCalendar;