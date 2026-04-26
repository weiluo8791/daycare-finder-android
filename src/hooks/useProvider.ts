import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Daycare, ClaimRequest, DaycareProvider } from '../types/entities';

export function useProviderDashboard() {
  return useQuery({
    queryKey: ['provider', 'dashboard'],
    queryFn: async () => {
      const response = await api.get('/api/provider/dashboard');
      return response.data;
    },
  });
}

export function useClaimedDaycares() {
  return useQuery({
    queryKey: ['provider', 'claimed'],
    queryFn: async () => {
      const response = await api.get<Daycare[]>('/api/provider/daycare');
      return response.data;
    },
  });
}

export function useSearchEEC(query: string) {
  return useQuery({
    queryKey: ['eec', 'search', query],
    queryFn: async () => {
      const response = await api.get('/api/provider/search', { params: { q: query } });
      return response.data;
    },
    enabled: query.length >= 2,
  });
}

export function useClaimDaycare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (daycareId: string) => {
      const response = await api.post('/api/provider/claim', { daycareId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider'] });
    },
  });
}

export function useUnclaimDaycare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (daycareId: string) => {
      await api.delete('/api/provider/claim', { data: { daycareId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider'] });
    },
  });
}

export function useUpdateDaycare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Daycare> }) => {
      const response = await api.patch(`/api/provider/daycare`, { id, ...data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      queryClient.invalidateQueries({ queryKey: ['daycare'] });
    },
  });
}

export function useRegisterProvider() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      const response = await api.post('/api/provider/register', data);
      return response.data;
    },
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ daycareId, uri }: { daycareId: string; uri: string }) => {
      const formData = new FormData();
      formData.append('daycareId', daycareId);
      formData.append('photo', {
        uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await api.post('/api/provider/daycare/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      queryClient.invalidateQueries({ queryKey: ['daycare'] });
    },
  });
}
