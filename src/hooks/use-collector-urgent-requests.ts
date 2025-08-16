import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCollectorUrgentRequests,
  getAvailableUrgentRequests,
  getAssignedUrgentRequests,
  assignUrgentRequestToCollector,
  acceptUrgentRequest,
  updateUrgentRequestStatus,
} from "@/apis/collector-urgent-requests.api";
import { useToast } from "@/hooks/use-toast";

// Query keys for collector urgent requests
export const collectorUrgentRequestsKeys = {
  all: ["collector-urgent-requests"] as const,
  available: () => [...collectorUrgentRequestsKeys.all, "available"] as const,
  availableList: (filters: Record<string, any>) =>
    [...collectorUrgentRequestsKeys.available(), { filters }] as const,
  assigned: () => [...collectorUrgentRequestsKeys.all, "assigned"] as const,
  assignedList: (filters: Record<string, any>) =>
    [...collectorUrgentRequestsKeys.assigned(), { filters }] as const,
  lists: () => [...collectorUrgentRequestsKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...collectorUrgentRequestsKeys.lists(), { filters }] as const,
};

// Hook to get available urgent requests (PENDING status)
export const useAvailableUrgentRequests = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: collectorUrgentRequestsKeys.availableList(params || {}),
    queryFn: () => getAvailableUrgentRequests(params),
    staleTime: 60000, // 1 minute - refresh more frequently for available requests
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
};

// Hook to get collector's assigned urgent requests
export const useAssignedUrgentRequests = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: collectorUrgentRequestsKeys.assignedList(params || {}),
    queryFn: () => getAssignedUrgentRequests(params),
    staleTime: 300000, // 5 minutes
  });
};

// Hook to get collector urgent requests (legacy)
export const useCollectorUrgentRequests = (params?: {
  status?: "PENDING" | "ASSIGNED";
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: collectorUrgentRequestsKeys.list(params || {}),
    queryFn: () => getCollectorUrgentRequests(params),
    staleTime: 300000, // 5 minutes
  });
};

// Hook to accept an urgent request
export const useAcceptUrgentRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => acceptUrgentRequest(id),
    onSuccess: (response) => {
      // Invalidate available requests list (will remove the accepted request)
      queryClient.invalidateQueries({
        queryKey: collectorUrgentRequestsKeys.available(),
      });

      // Invalidate assigned requests list (will add the newly accepted request)
      queryClient.invalidateQueries({
        queryKey: collectorUrgentRequestsKeys.assigned(),
      });

      // Invalidate legacy lists
      queryClient.invalidateQueries({
        queryKey: collectorUrgentRequestsKeys.lists(),
      });

      toast({
        title: "Đã nhận yêu cầu",
        description: "Bạn đã nhận yêu cầu thu gom thành công.",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || "Có lỗi xảy ra khi nhận yêu cầu";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Hook to assign urgent request (legacy)
export const useAssignUrgentRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => assignUrgentRequestToCollector(id),
    onSuccess: () => {
      // Invalidate all urgent requests lists
      queryClient.invalidateQueries({
        queryKey: collectorUrgentRequestsKeys.all,
      });

      toast({
        title: "Đã nhận yêu cầu",
        description: "Yêu cầu thu gom đã được nhận thành công.",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || "Có lỗi xảy ra khi nhận yêu cầu";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Hook to update urgent request status
export const useUpdateUrgentRequestStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
    }) => updateUrgentRequestStatus(id, status),
    onSuccess: (response, variables) => {
      // Invalidate and refetch lists
      queryClient.invalidateQueries({
        queryKey: collectorUrgentRequestsKeys.lists(),
      });

      let message = "Trạng thái đã được cập nhật";
      switch (variables.status) {
        case "IN_PROGRESS":
          message = "Đã bắt đầu thu gom";
          break;
        case "COMPLETED":
          message = "Đã hoàn thành thu gom";
          break;
      }

      toast({
        title: "Cập nhật thành công",
        description: message,
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || "Có lỗi xảy ra khi cập nhật trạng thái";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};
