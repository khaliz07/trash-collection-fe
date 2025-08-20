import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { 
  SupportRequest, 
  FAQ, 
  CreateSupportRequestPayload, 
  CreateSupportFeedbackPayload 
} from '@/types/support';

const API_BASE = '/support';

// Hooks cho user
export function useSupportRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ['supportRequests', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.status) searchParams.set('status', params.status);

      const response = await api.get(`${API_BASE}/requests?${searchParams}`);
      return response.data;
    },
  });
}

export function useCreateSupportRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSupportRequestPayload) => {
      const response = await api.post(`${API_BASE}/requests`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportRequests'] });
    },
  });
}

export function useCreateSupportFeedback(requestId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSupportFeedbackPayload) => {
      const response = await api.post(`${API_BASE}/requests/${requestId}/feedback`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportRequests'] });
    },
  });
}

export function useFAQs(params?: {
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['faqs', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);

      const response = await api.get(`${API_BASE}/faqs?${searchParams}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}

// Hooks cho admin
export function useAdminSupportRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  priority?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['adminSupportRequests', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.status) searchParams.set('status', params.status);
      if (params?.type) searchParams.set('type', params.type);
      if (params?.priority) searchParams.set('priority', params.priority);
      if (params?.search) searchParams.set('search', params.search);

      const response = await api.get(`/admin/support/requests?${searchParams}`);
      return response.data;
    },
  });
}

export function useUpdateSupportRequest(requestId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      status?: string;
      adminNotes?: string;
      priority?: string;
    }) => {
      const response = await api.put(`/admin/support/requests/${requestId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupportRequests'] });
    },
  });
}
