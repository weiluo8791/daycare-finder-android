import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { SearchParams, SearchResponse, Daycare, DaycareNearby } from '../types/entities';

export function useSearchDaycares(params: SearchParams) {
  return useQuery({
    queryKey: ['daycares', 'search', params],
    queryFn: async () => {
      const response = await api.get<SearchResponse>('/api/search', { params });
      return response.data;
    },
    enabled: !!(params.lat && params.lng) || !!params.name,
  });
}

export function useDaycare(id: string) {
  return useQuery({
    queryKey: ['daycare', id],
    queryFn: async () => {
      const response = await api.get<Daycare>(`/api/daycare/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get<Daycare[]>('/api/favorites');
      return response.data;
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ daycareId, isSaved }: { daycareId: string; isSaved: boolean }) => {
      if (isSaved) {
        await api.delete('/api/favorites', { data: { daycareId } });
      } else {
        await api.post('/api/favorites', { daycareId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useNearbyDaycares(lat: number, lng: number, radius = 10000) {
  return useQuery({
    queryKey: ['daycares', 'nearby', lat, lng, radius],
    queryFn: async () => {
      const response = await api.get<SearchResponse>('/api/search', {
        params: { lat, lng, radius },
      });
      return response.data;
    },
    enabled: !!lat && !!lng,
  });
}
