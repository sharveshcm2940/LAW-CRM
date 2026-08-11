import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await axios.get('/clients');
      return response.data;
    },
  });
}

export function useConflictSearch(query) {
  return useQuery({
    queryKey: ['conflict-search', query],
    queryFn: async () => {
      if (!query || query.trim().length < 2) return { matches: [], conflictFound: false };
      const response = await axios.get('/clients/conflict/search', { params: { query } });
      return response.data;
    },
    enabled: Boolean(query && query.trim().length >= 2),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientData) => {
      const response = await axios.post('/clients', clientData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
