import { api } from "@/lib/api";

// Auth API functions
export const authAPI = {
  login: async (data: { email: string; password: string }) => {
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
