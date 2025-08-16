import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectorsAPI } from "@/apis/collectors.api";
import { toast } from "sonner";

// Get collectors query
export const useCollectors = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["collectors", params],
    queryFn: () => collectorsAPI.getAll(params),
    placeholderData: (previousData) => previousData, // Replaces keepPreviousData
  });
};

// Get collector by ID
export const useCollector = (id: string) => {
  return useQuery({
    queryKey: ["collectors", id],
    queryFn: () => collectorsAPI.getById(id),
    enabled: !!id,
  });
};

// Create collector mutation
export const useCreateCollector = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: collectorsAPI.create,
    onSuccess: (response) => {
      console.log("Create success:", response); // Debug log
      queryClient.invalidateQueries({ queryKey: ["collectors"] });
      toast.success("Thêm nhân viên thu gom thành công!");
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Create error:", error); // Debug log
      const message =
        error.response?.data?.message || "Thêm nhân viên thất bại";
      toast.error(message);
    },
  });
};

// Update collector mutation
export const useUpdateCollector = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      collectorsAPI.update(id, data),
    onSuccess: (response, { id }) => {
      console.log("Update success:", response); // Debug log
      queryClient.invalidateQueries({ queryKey: ["collectors"] });
      queryClient.invalidateQueries({ queryKey: ["collectors", id] });
      toast.success("Cập nhật nhân viên thành công!");
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Update error:", error); // Debug log
      const message =
        error.response?.data?.message || "Cập nhật nhân viên thất bại";
      toast.error(message);
    },
  });
};

// Delete collector mutation
export const useDeleteCollector = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: collectorsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectors"] });
      toast.success("Xóa nhân viên thành công!");
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Xóa nhân viên thất bại";
      toast.error(message);
    },
  });
};
