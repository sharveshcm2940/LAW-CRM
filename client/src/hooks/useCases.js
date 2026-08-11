import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';

export function useCases(filters = {}) {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: async () => {
      const response = await axios.get('/cases', { params: filters });
      return response.data;
    },
  });
}

export function useCaseDetails(id) {
  return useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      const response = await axios.get(`/cases/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCaseData) => {
      const response = await axios.post('/cases', newCaseData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}
