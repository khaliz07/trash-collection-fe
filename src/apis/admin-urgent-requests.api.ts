import { api } from "@/lib/api";
import { UrgentRequestResponse } from "./urgent-requests.api";

export interface AdminUrgentRequestsResponse {
  success: boolean;
  data: UrgentRequestResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CancelUrgentRequestResponse {
  success: boolean;
  data: UrgentRequestResponse;
  message: string;
}

// Get all urgent requests for admin (all statuses)
export const getAdminUrgentRequests = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  urgency_level?: string;
}): Promise<AdminUrgentRequestsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.status) searchParams.append("status", params.status);
  if (params?.urgency_level)
    searchParams.append("urgency_level", params.urgency_level);

  const response = await api.get(
    `/admin/urgent-requests?${searchParams.toString()}`
  );
  return response.data;
};

// Cancel an urgent request (admin only)
export const cancelUrgentRequestAdmin = async (
  id: string
): Promise<CancelUrgentRequestResponse> => {
  const response = await api.patch(`/admin/urgent-requests/${id}/cancel`);
  return response.data;
};
