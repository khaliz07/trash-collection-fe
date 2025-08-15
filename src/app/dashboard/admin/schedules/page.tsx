"use client";

import { RouteCreator } from "@/components/admin/schedules/RouteCreator";
import { ScheduleDialog } from "@/components/admin/schedules/ScheduleDialog";
import ScheduleTable from "@/components/admin/schedules/ScheduleTable";
import type { Schedule } from "@/components/admin/schedules/types";
import { Button } from "@/components/ui/button";
import { RouteStatus, RouteWithUrgents } from "@/types/route";
import { Plus } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function AdminSchedulesPage() {
  const { t } = useTranslation("common");
  const [selected, setSelected] = React.useState<Schedule | null>(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [showRouteCreator, setShowRouteCreator] = useState(false);
  const [routes, setRoutes] = useState<RouteWithUrgents[]>([]);
  const [selectedRouteData, setSelectedRouteData] =
    useState<RouteWithUrgents | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch schedules from database
  useEffect(() => {
    fetchSchedules();
    fetchRoutes();
  }, []);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/schedules");
      const data = await response.json();

      if (response.ok) {
        setSchedules(data.schedules || []);
        console.log(
          "Loaded schedules from database:",
          data.schedules?.length || 0
        );
      } else {
        throw new Error(data.error || "Failed to fetch schedules");
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Không thể tải danh sách lịch trình từ database");

      // Fallback to mock data if API fails
      const { mockSchedules } = await import(
        "@/components/admin/schedules/mockData"
      );
      setSchedules(mockSchedules);
      toast.info("Đang sử dụng dữ liệu mẫu");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch("/api/admin/routes");
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes || []);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.error("Không thể tải danh sách tuyến đường");
    }
  };

  const handleRowClick = (schedule: Schedule) => {
    setSelected(schedule);

    // Convert schedule to RouteWithUrgents format
    const routeData: RouteWithUrgents = {
      route: {
        id: schedule.id,
        route_name: schedule.code,
        route_code: schedule.code,
        description: schedule.note || "",
        status: RouteStatus.DRAFT, // Convert to valid RouteStatus
        total_distance_km: 0,
        estimated_time_min: 60,
        created_at: new Date(schedule.startTime).toISOString(),
        updated_at: new Date(schedule.endTime).toISOString(),
        route_path: null,
        route_polyline: "",
        active_days: [],
        time_windows: [],
      },
      urgent_points: [], // Mock empty urgent points for now
    };

    setSelectedRouteData(routeData);
    setOpenDialog(true);
  };

  const handleRouteUpdate = async (routeId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/routes/${routeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchRoutes(); // Refresh routes list
        toast.success("Đã cập nhật tuyến đường");
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Error updating route:", error);
      toast.error("Không thể cập nhật tuyến đường");
    }
  };

  const handleUrgentRequestAssign = async (
    urgentId: string,
    routeId: string
  ) => {
    try {
      const response = await fetch(`/api/admin/routes/${routeId}/urgent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urgentId }),
      });

      if (response.ok) {
        await fetchRoutes(); // Refresh routes list
        toast.success("Đã gán yêu cầu khẩn cấp");
      } else {
        throw new Error("Assignment failed");
      }
    } catch (error) {
      console.error("Error assigning urgent request:", error);
      toast.error("Không thể gán yêu cầu khẩn cấp");
    }
  };

  const handleRouteCreated = async (routeData: any) => {
    try {
      const response = await fetch("/api/admin/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routeData),
      });

      if (response.ok) {
        await fetchRoutes(); // Refresh routes list
        setShowRouteCreator(false);
        toast.success("Đã tạo tuyến đường mới");
      } else {
        throw new Error("Creation failed");
      }
    } catch (error) {
      console.error("Error creating route:", error);
      toast.error("Không thể tạo tuyến đường");
    }
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {t("admin_schedules.title", "Lịch trình thu gom")}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {isLoading
              ? "Đang tải..."
              : `${schedules.length} lịch trình từ database`}
            {error && <span className="text-red-500 ml-2">({error})</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchSchedules}
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            🔄 Refresh
          </Button>
          <Button
            onClick={() => setShowRouteCreator(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tạo tuyến đường mới
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu từ database...</p>
          </div>
        </div>
      ) : (
        <ScheduleTable schedules={schedules} onRowClick={handleRowClick} />
      )}

      <ScheduleDialog
        schedule={selected}
        open={openDialog}
        onOpenChange={setOpenDialog}
      />

      {showRouteCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
              <h2 className="text-xl font-semibold">Tạo tuyến đường mới</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRouteCreator(false)}
              >
                ✕
              </Button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <RouteCreator onRouteCreated={handleRouteCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
