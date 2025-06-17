// src/utils/calendarEvents.ts

// Define EventInput type based on the returned object structure
export interface EventInput {
  id: string
  title: string
  start?: Date
  end?: Date
  type: string
  status: string
  propertyName: string
  allDay: boolean
}

interface RawEvent {
  id: string | number
  property: string | number
  check_in_date?: string
  check_out_date?: string
  status?: string
  [key: string]: any
}

interface FormatParams {
  bookings: RawEvent[]
  blocks:   RawEvent[]
  properties: { id: string|number, title: string }[]
}

export function formatCalendarEvents({
  bookings = [],
  blocks   = [],
  properties = [],
}: FormatParams): EventInput[] {
  // Unificamos bookings y blocks
  const rawItems = [
    ...bookings.map(b => ({ ...b, __type: 'booking' })),
    ...blocks.map(b   => ({ ...b, __type: 'blocked'  })),
  ]

  return rawItems.map(item => {
    const property = properties.find(p => `${p.id}` === `${item.property}`)
    const isBlocked = item.__type === 'blocked' || item.status === 'blocked'
    const type      = isBlocked ? 'blocked' : 'booking'

    return {
      id:           `${type}-${item.id}`,
      title:        isBlocked
                     ? `🛑 BLOQUEADO: ${property?.title ?? 'Propiedad #' + item.property}`
                     : `Reserva: ${property?.title ?? 'Desconocido'}`,
      start:        item.check_in_date  ? new Date(item.check_in_date)  : undefined,
      end:          item.check_out_date ? new Date(item.check_out_date) : undefined,
      type,
      status:       item.status ?? '',
      propertyName: property?.title ?? 'Desconocido',
      allDay:       true,
    }
  })
}

export function getEventStyle() {
  // Aquí podrías construir la clave para buscar color si lo necesitas en el futuro


  return {
    color:       'white',
    borderRadius: '4px',
    fontWeight:  700,
  }
}
