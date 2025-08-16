import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUrgentRequest,
  getUrgentRequests,
  getUrgentRequest,
  CreateUrgentRequestData,
} from "@/apis/urgent-requests.api";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUserLocation } from "@/hooks/use-auth-mutations";

// Query key factory
export const urgentRequestsKeys = {
  all: ["urgent-requests"] as const,
  lists: () => [...urgentRequestsKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...urgentRequestsKeys.lists(), { filters }] as const,
  details: () => [...urgentRequestsKeys.all, "detail"] as const,
  detail: (id: string) => [...urgentRequestsKeys.details(), id] as const,
};

// Hook to get user's urgent requests
export const useUrgentRequests = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: urgentRequestsKeys.list(params || {}),
    queryFn: () => getUrgentRequests(params),
    staleTime: 300000, // 5 minutes
  });
};

// Hook to get single urgent request
export const useUrgentRequest = (id: string) => {
  return useQuery({
    queryKey: urgentRequestsKeys.detail(id),
    queryFn: () => getUrgentRequest(id),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
};

// Hook to create urgent request
export const useCreateUrgentRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateLocationMutation = useUpdateUserLocation();

  return useMutation({
    mutationFn: (data: CreateUrgentRequestData) => createUrgentRequest(data),
    onSuccess: (response, variables) => {
      // Invalidate and refetch urgent requests list
      queryClient.invalidateQueries({ queryKey: urgentRequestsKeys.lists() });

      // Auto-update user location if provided and different from current
      if (
        variables.pickup_address &&
        variables.pickup_lat &&
        variables.pickup_lng
      ) {
        updateLocationMutation.mutate({
          address: variables.pickup_address,
          latitude: variables.pickup_lat,
          longitude: variables.pickup_lng,
        });
      }

      toast({
        title: "Yêu cầu đã được tạo",
        description: "Yêu cầu thu gom khẩn cấp của bạn đã được gửi thành công.",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || "Có lỗi xảy ra khi tạo yêu cầu";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};
