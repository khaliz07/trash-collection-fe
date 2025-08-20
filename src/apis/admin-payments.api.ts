import { api } from "@/lib/api";

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CANCELLED";
  paymentMethod:
    | "CASH"
    | "CARD"
    | "BANK_TRANSFER"
    | "E_WALLET"
    | "VNPAY"
    | "STRIPE";
  transactionId?: string;
  externalId?: string;
  receiptUrl?: string;
  paidAt: string;
  failureReason?: string;
  coveredMonths: string[];
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  package: {
    id: string;
    name: string;
    type: string;
    price: number;
  };
  subscription?: {
    id: string;
    status: string;
  } | null;
}

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentMethod?: string;
  packageId?: string;
  startDate?: string;
  endDate?: string;
  province?: string;
  district?: string;
  ward?: string;
}

export interface GetPaymentsResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Province {
  province_id: string;
  province_name: string;
  province_type: string;
}

export interface District {
  district_id: string;
  district_name: string;
  district_type: string;
  province_id: string;
}

export interface Ward {
  ward_id: string;
  ward_name: string;
  ward_type: string;
  district_id: string;
}

export const paymentsApi = {
  // Get all payments with filters and pagination
  getPayments: async (
    params: GetPaymentsParams = {}
  ): Promise<GetPaymentsResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.status) searchParams.append("status", params.status);
    if (params.paymentMethod)
      searchParams.append("paymentMethod", params.paymentMethod);
    if (params.packageId) searchParams.append("packageId", params.packageId);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.province) searchParams.append("province", params.province);
    if (params.district) searchParams.append("district", params.district);
    if (params.ward) searchParams.append("ward", params.ward);

    const queryString = searchParams.toString();
    const url = `/admin/payments${queryString ? `?${queryString}` : ""}`;

    const response = await api.get(url);
    return response.data;
  },

  // Get provinces for address filter
  getProvinces: async (): Promise<Province[]> => {
    const response = await api.get("/address/provinces");
    return response.data;
  },

  // Get districts by province
  getDistricts: async (provinceId: string): Promise<District[]> => {
    const response = await api.get(`/address/districts?province=${provinceId}`);
    return response.data;
  },

  // Get wards by district
  getWards: async (districtId: string): Promise<Ward[]> => {
    const response = await api.get(`/address/wards?district=${districtId}`);
    return response.data;
  },

  // Get packages for filter
  getPackages: async (): Promise<
    { id: string; name: string; type: string }[]
  > => {
    const response = await api.get("/admin/packages");
    return response.data.packages || [];
  },
};
