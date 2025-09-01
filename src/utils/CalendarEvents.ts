// src/utils/calendarEvents.ts

// Define EventInput type based on the returned object structure
export interface EventInput {
  id: string;
  title: string;
  start: Date; // always present for react-big-calendar typings
  end: Date;   // always present
  type: string; // booking | blocked | maintenance (future)
  status: string;
  propertyName: string;
  allDay: boolean;
}

interface RawEvent {
  id: string | number;
  property?: string | number;      // blocks may use property, bookings may use property_id
  property_id?: string | number;   // bookings use property_id
  check_in_date?: string;
  check_out_date?: string;
  status?: string;
  reason?: string;
  [key: string]: any;
}

interface FormatParams {
  bookings: RawEvent[];
  blocks: RawEvent[];
  pricing?: { id: string | number; start_date: string; end_date: string; price: number; property: number | string }[];
  properties: { id: string | number; title: string }[];
}

export function formatCalendarEvents({ bookings = [], blocks = [], pricing = [], properties = [] }: FormatParams): EventInput[] {
  const rawItems: any[] = [
    ...bookings.map(b => ({ ...b, __type: 'booking' })),
    ...blocks.map(b => ({ ...b, __type: 'blocked' })),
    ...pricing.map(p => ({
      id: p.id,
      property: p.property,
      check_in_date: p.start_date,
      check_out_date: p.end_date,
      price: p.price,
      status: 'pricing',
      __type: 'pricing'
    }))
  ];

  return rawItems.map(item => {
    const propertyId = item.property ?? item.property_id;
    const property = properties.find(p => `${p.id}` === `${propertyId}`);
    const isBlocked = item.__type === 'blocked' || item.status === 'blocked';
    const isPricing = item.__type === 'pricing';
    const type = isPricing ? 'pricing' : (isBlocked ? 'blocked' : 'booking');
    const startDate = item.check_in_date ? new Date(item.check_in_date) : (item.check_out_date ? new Date(item.check_out_date) : new Date());
    // ensure end >= start
    const endDate = item.check_out_date ? new Date(item.check_out_date) : startDate;
    return {
      id: `${type}-${item.id}`,
      title: isBlocked
        ? `Bloqueado: ${property?.title ?? 'Propiedad #' + propertyId}`
        : isPricing
          ? `Tarifa $${item.price}`
          : `Reserva: ${property?.title ?? 'Desconocido'}`,
      start: startDate,
      end: endDate,
      type,
      status: item.status ?? '',
      propertyName: property?.title ?? 'Desconocido',
      allDay: true,
    };
  });
}

export function getEventStyle(event: EventInput) {
  const base: React.CSSProperties = {
  color: 'white',
  borderRadius: 3,
  fontWeight: 500,
  fontSize: '10px',
  lineHeight: 1.1,
  padding: '1px 2px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '14px',
  minHeight: '14px',
  maxHeight: '14px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  };
  if (event.type === 'blocked') return { ...base, backgroundColor: '#dc2626' }; // rojo bloqueado
  if (event.type === 'pricing') return { ...base, backgroundColor: '#9333ea' }; // morado pricing
  if (event.type === 'basePrice') return { ...base, backgroundColor: '#64748b' }; // slate para precio base
  return { ...base, backgroundColor: event.status === 'pending' ? '#eab308' : '#16a34a' }; // pendiente vs confirmada
}
