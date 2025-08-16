import { api } from "@/lib/api";

export interface CreateUrgentRequestData {
  requested_date: string;
  urgency_level: "MEDIUM" | "HIGH" | "CRITICAL";
  waste_description: string;
  pickup_address?: string;
  pickup_lat?: number;
  pickup_lng?: number;
}

export interface UpdateUrgentRequestData {
  requested_date?: string;
  urgency_level?: "MEDIUM" | "HIGH" | "CRITICAL";
  waste_description?: string;
  pickup_address?: string;
  pickup_lat?: number;
  pickup_lng?: number;
}

export interface UrgentRequestResponse {
  id: string;
  user_id: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  requested_date: string;
  urgency_level: "MEDIUM" | "HIGH" | "CRITICAL";
  waste_description: string;
  assigned_route_id?: string;
  assigned_collector_id?: string;
  assigned_at?: string;
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  completed_at?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  collector?: {
    id: string;
    name: string;
    phone?: string;
  };
  route?: {
    id: string;
    name: string;
  };
}

export interface UrgentRequestsListResponse {
  success: boolean;
  data: UrgentRequestResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUrgentRequestResponse {
  success: boolean;
  data: UrgentRequestResponse;
  message: string;
}

// Create new urgent request
export const createUrgentRequest = async (
  data: CreateUrgentRequestData
): Promise<CreateUrgentRequestResponse> => {
  const response = await api.post("/urgent-requests", data);
  return response.data;
};

// Get user's urgent requests
export const getUrgentRequests = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<UrgentRequestsListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append("status", params.status);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const response = await api.get(`/urgent-requests?${searchParams.toString()}`);
  return response.data;
};

// Get single urgent request by ID
export const getUrgentRequest = async (
  id: string
): Promise<UrgentRequestResponse> => {
  const response = await api.get(`/urgent-requests/${id}`);
  return response.data;
};

// Update urgent request
export const updateUrgentRequest = async (
  id: string,
  data: UpdateUrgentRequestData
): Promise<UrgentRequestResponse> => {
  const response = await api.patch(`/urgent-requests/${id}`, data);
  return response.data;
};

// Cancel urgent request (soft delete)
export const cancelUrgentRequest = async (
  id: string
): Promise<UrgentRequestResponse> => {
  const response = await api.delete(`/urgent-requests/${id}`);
  return response.data;
};
