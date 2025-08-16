import { api } from "@/lib/api";

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
