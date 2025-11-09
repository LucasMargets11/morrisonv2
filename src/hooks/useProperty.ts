import { useQuery, QueryClient } from '@tanstack/react-query';
import { fetchPropertyById } from '../lib/properties';

// Shared QueryClient (fallback if not provided higher by App)
export const sharedQueryClient = new QueryClient();

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchPropertyById(id!),
    enabled: !!id,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000, // cacheTime renamed gcTime in TanStack Query v5
  });
}

export function prefetchProperty(queryClient: QueryClient, id: string | number) {
  return queryClient.prefetchQuery({
    queryKey: ['property', String(id)],
    queryFn: () => fetchPropertyById(id),
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });
}