import { api } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  joinDate: string;
  lastLoginAt: string;
  plan: string;
  planType: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface GetUsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserStatusParams {
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  action?: "suspend" | "activate" | "deactivate";
}

export const usersApi = {
  // Get all users with filters and pagination
  getUsers: async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.status) searchParams.append("status", params.status);

    const queryString = searchParams.toString();
    const url = `/admin/users${queryString ? `?${queryString}` : ""}`;

    const response = await api.get(url);
    return response.data;
  },

  // Update user status
  updateUserStatus: async (
    userId: string,
    data: UpdateUserStatusParams
  ): Promise<{ message: string; user: User }> => {
    const response = await api.patch(`/admin/users/${userId}`, data);
    return response.data;
  },

  // Suspend user account
  suspendUser: async (
    userId: string
  ): Promise<{ message: string; user: User }> => {
    const response = await api.patch(`/admin/users/${userId}`, {
      action: "suspend",
    });
    return response.data;
  },

  // Activate user account
  activateUser: async (
    userId: string
  ): Promise<{ message: string; user: User }> => {
    const response = await api.patch(`/admin/users/${userId}`, {
      action: "activate",
    });
    return response.data;
  },

  // Deactivate user account
  deactivateUser: async (
    userId: string
  ): Promise<{ message: string; user: User }> => {
    const response = await api.patch(`/admin/users/${userId}`, {
      action: "deactivate",
    });
    return response.data;
  },
};
