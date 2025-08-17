import { api } from "@/lib/api";
import { TrashWeightEntry } from "@/types/route-assignment";

// Collector API functions
export const collectorAPI = {
  getAssignments: async (filters?: { date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.date) {
      params.append("date", filters.date);
    }
    const url = `/collector/assignments${params.toString() ? "?" + params.toString() : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  updateAssignment: async (data: {
    assignmentId: string;
    status: string;
    notes?: string;
    actual_distance?: number;
    actual_duration?: number;
    trash_weight?: TrashWeightEntry[];
  }) => {
    const response = await api.patch("/collector/assignments", data);
    return response.data;
  },
};
