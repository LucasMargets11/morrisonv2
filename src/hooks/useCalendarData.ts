// src/hooks/useCalendarData.ts
import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { formatCalendarEvents } from '../utils/CalendarEvents'

export function useCalendarData(propertyId?: number) {
  // Disparamos las tres queries en paralelo
  const [bookingsQuery, blocksQuery, propertiesQuery] = useQueries({
    queries: [
      {
        queryKey: ['bookings', propertyId],
        queryFn: async () => (await import('../lib/admin')).adminApi.getBookings(propertyId as number),
      },
      {
        queryKey: ['blocks', propertyId],
        queryFn: async () => (await import('../lib/admin')).adminApi.getBlocks(propertyId as number),
      },
      {
        queryKey: ['properties'],
        queryFn: async () => (await import('../lib/admin')).adminApi.getProperties(),
      },
    ],
  })

  const bookings   = bookingsQuery.data   ?? []
  const blocks     = blocksQuery.data     ?? []
  const properties = propertiesQuery.data ?? []

  const isLoading = bookingsQuery.isLoading
                  || blocksQuery.isLoading
                  || propertiesQuery.isLoading

  const isError   = bookingsQuery.isError
                  || blocksQuery.isError
                  || propertiesQuery.isError

  const error     = bookingsQuery.error
                  || blocksQuery.error
                  || propertiesQuery.error

  // Memoizamos el formateo de eventos para no recrear fechas en cada render
  const events = useMemo(
    () => formatCalendarEvents({ bookings, blocks, properties }),
    [bookings, blocks, properties]
  )

  return {
    bookings,
    blocks,
    properties,
    events,
    isLoading,
    isError,
    error,
  }
}
