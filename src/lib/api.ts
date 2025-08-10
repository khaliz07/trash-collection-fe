import axios from "axios";
import { useAuthStore } from "@/hooks/use-auth";

// Create axios instance
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (data: { email: string; password: string; role: string }) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  register: async (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
  }) => {
    // Use name directly for backend
    const registerData = {
      ...data,
      name: data.name,
    };

    const response = await api.post("/auth/register", registerData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Collectors API functions
export const collectorsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);

    const response = await api.get(
      `/admin/collectors?${searchParams.toString()}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/admin/collectors/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    licensePlate?: string;
    cccd?: string;
    startDate?: string;
    password: string;
  }) => {
    const response = await api.post("/admin/collectors", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      address: string;
      licensePlate: string;
      cccd: string;
      startDate: string;
      status: string;
    }>
  ) => {
    const response = await api.put("/admin/collectors", { id, ...data });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete("/admin/collectors", {
      data: { id },
    });
    return response.data;
  },
};

export default api;
