import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminUrgentRequests,
  cancelUrgentRequestAdmin,
} from "@/apis/admin-urgent-requests.api";
import { useToast } from "@/hooks/use-toast";

// Query keys for admin urgent requests
export const adminUrgentRequestsKeys = {
  all: ["admin-urgent-requests"] as const,
  lists: () => [...adminUrgentRequestsKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...adminUrgentRequestsKeys.lists(), { filters }] as const,
};

// Hook to get all urgent requests for admin
export const useAdminUrgentRequests = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  urgency_level?: string;
}) => {
  return useQuery({
    queryKey: adminUrgentRequestsKeys.list(params || {}),
    queryFn: () => getAdminUrgentRequests(params),
    staleTime: 300000, // 5 minutes
  });
};

// Hook to cancel an urgent request (admin only)
export const useCancelUrgentRequestAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => cancelUrgentRequestAdmin(id),
    onSuccess: (response) => {
      // Invalidate urgent requests list to refresh the data
      queryClient.invalidateQueries({
        queryKey: adminUrgentRequestsKeys.lists(),
      });

      toast({
        title: "Đã hủy yêu cầu",
        description: "Yêu cầu thu gom đã được hủy thành công.",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || "Có lỗi xảy ra khi hủy yêu cầu";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};
