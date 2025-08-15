"use client";

import { RouteCreator } from "@/components/admin/schedules/RouteCreator";
import { ScheduleDialog } from "@/components/admin/schedules/ScheduleDialog";
import ScheduleTable from "@/components/admin/schedules/ScheduleTable";
import type { Schedule } from "@/components/admin/schedules/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleRoute } from "@/types/simple-route";
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
  const [routes, setRoutes] = useState<SimpleRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<SimpleRoute | null>(null);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [routeDialogMode, setRouteDialogMode] = useState<"create" | "edit">("create");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("schedules");

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
    setOpenDialog(true);
  };

  const handleRouteClick = (route: SimpleRoute) => {
    setSelectedRoute(route);
    setRouteDialogMode("edit");
    setShowRouteDialog(true);
  };

  const handleCreateRoute = () => {
    setSelectedRoute(null);
    setRouteDialogMode("create");
    setShowRouteDialog(true);
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
      // Route đã được tạo thành công từ RouteCreator
      // Chỉ cần refresh danh sách và đóng dialog
      await fetchRoutes();
      setShowRouteDialog(false);
    } catch (error) {
      console.error("Error refreshing routes:", error);
      toast.error("Không thể refresh danh sách tuyến đường");
    }
  };

  // Component RouteTable
  const RouteTable = () => {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách tuyến đường</CardTitle>
            <Button onClick={handleCreateRoute}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo tuyến đường mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Tên tuyến đường</th>
                  <th className="text-left p-3 font-medium">Mô tả</th>
                  <th className="text-left p-3 font-medium">Trạng thái</th>
                  <th className="text-left p-3 font-medium">Người thu gom</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr
                    key={route.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRouteClick(route)}
                  >
                    <td className="p-3">{route.name}</td>
                    <td className="p-3">{route.description || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          route.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : route.status === "DRAFT"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {route.status}
                      </span>
                    </td>
                    <td className="p-3">{route.collector?.name || "Chưa gán"}</td>
                  </tr>
                ))}
                {routes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Chưa có tuyến đường nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Quản lý lịch trình và tuyến đường
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Quản lý lịch trình thu gom và các tuyến đường
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedules">Lịch trình</TabsTrigger>
          <TabsTrigger value="routes">Tuyến đường</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách lịch trình</CardTitle>
                <Button onClick={() => setShowRouteCreator(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo lịch trình mới
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Lỗi: {error}
                </div>
              ) : (
                <ScheduleTable
                  schedules={schedules}
                  onRowClick={handleRowClick}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <RouteTable />
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <ScheduleDialog
        schedule={selected}
        open={openDialog}
        onOpenChange={setOpenDialog}
      />

      {/* Route Dialog */}
      <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {routeDialogMode === "create" ? "Tạo tuyến đường mới" : "Chỉnh sửa tuyến đường"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <RouteCreator
              onRouteCreated={handleRouteCreated}
              initialData={
                routeDialogMode === "edit" && selectedRoute
                  ? {
                      name: selectedRoute.name,
                      description: selectedRoute.description,
                      assigned_collector_id: selectedRoute.assigned_collector_id || "",
                      estimated_duration: selectedRoute.estimated_duration,
                      status: selectedRoute.status,
                      pickup_points: selectedRoute.trackPoints.map(point => ({
                        address: point.address || "",
                        lat: point.lat,
                        lng: point.lng,
                      })),
                    }
                  : undefined
              }
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Legacy Route Creator Modal (for schedules) */}
      {showRouteCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
              <h2 className="text-xl font-semibold">Tạo lịch trình mới</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRouteCreator(false)}
              >
                ✕
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <RouteCreator onRouteCreated={handleRouteCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
