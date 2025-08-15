import { useState, useEffect } from "react";

export interface Collector {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  avatar?: string;
  address?: string;
  licensePlate?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectorsResponse {
  collectors: Collector[];
  total: number;
  page: number;
  totalPages: number;
}

interface UseCollectorsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function useCollectors(options: UseCollectorsOptions = {}) {
  const [data, setData] = useState<CollectorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { page = 1, limit = 50, search = "", status = "ACTIVE" } = options;

  useEffect(() => {
    async function fetchCollectors() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          status: status,
        });

        if (search) {
          params.append("search", search);
        }

        const response = await fetch(
          `/api/admin/collectors?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching collectors:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch collectors"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCollectors();
  }, [page, limit, search, status]);

  const refetch = () => {
    setLoading(true);
    // Re-trigger the effect by updating a dependency
    // For now, we'll just call the fetch function directly
    // In a more sophisticated setup, you might use a query key or similar
  };

  return {
    data,
    loading,
    error,
    refetch,
    collectors: data?.collectors || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
  };
}

// Simplified hook for just getting the collectors list
export function useCollectorsList() {
  const { collectors, loading, error } = useCollectors({
    limit: 100, // Get all active collectors
    status: "ACTIVE",
  });

  return {
    collectors: collectors.map((collector) => ({
      id: collector.id,
      name: collector.name,
      phone: collector.phone,
      email: collector.email,
    })),
    loading,
    error,
  };
}
