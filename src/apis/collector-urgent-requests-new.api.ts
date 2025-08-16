import { api } from "@/lib/api";
import { UrgentRequestResponse } from "./urgent-requests.api";

export interface CollectorUrgentRequestsListResponse {
  success: boolean;
  data: UrgentRequestResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Get available urgent requests for collectors (status = PENDING)
export const getAvailableUrgentRequests = async (params?: {
  page?: number;
  limit?: number;
}): Promise<CollectorUrgentRequestsListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const response = await api.get(
    `/collector/urgent-requests/available?${searchParams.toString()}`
  );
  return response.data;
};

// Get assigned urgent requests for collector
export const getAssignedUrgentRequests = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<CollectorUrgentRequestsListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.status) searchParams.append("status", params.status);

  const response = await api.get(
    `/collector/urgent-requests/assigned?${searchParams.toString()}`
  );
  return response.data;
};

// Get urgent requests for collector (both pending and assigned) - legacy
export const getCollectorUrgentRequests = async (params?: {
  status?: "PENDING" | "ASSIGNED";
  page?: number;
  limit?: number;
}): Promise<CollectorUrgentRequestsListResponse> => {
  // Route to appropriate endpoint based on status
  if (params?.status === "PENDING") {
    return getAvailableUrgentRequests(params);
  } else {
    return getAssignedUrgentRequests(params);
  }
};

// Accept an urgent request
export const acceptUrgentRequest = async (
  id: string
): Promise<UrgentRequestResponse> => {
  const response = await api.post(`/collector/urgent-requests/${id}/accept`);
  return response.data.data;
};

// Assign urgent request to current collector (legacy)
export const assignUrgentRequestToCollector = async (
  id: string
): Promise<UrgentRequestResponse> => {
  return acceptUrgentRequest(id);
};

// Update urgent request status
export const updateUrgentRequestStatus = async (
  id: string,
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED"
): Promise<UrgentRequestResponse> => {
  const response = await api.patch(`/collector/urgent-requests/${id}/status`, {
    status,
  });
  return response.data.data;
};
