"use client";

import { RouteCreator } from "@/components/admin/schedules/RouteCreator";
import { ScheduleDialog } from "@/components/admin/schedules/ScheduleDialog";
import { AssignmentDetailsDialog } from "@/components/admin/schedules/assignment-details-dialog";
import { AssignmentFilterBar } from "@/components/admin/schedules/assignment-filter-bar";
import { CreateAssignmentDialog } from "@/components/admin/schedules/create-assignment-dialog";
import type { Schedule } from "@/components/admin/schedules/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressService } from "@/lib/address-service";
import { RouteAssignment } from "@/types/route-assignment";
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
  const [routeDialogMode, setRouteDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [assignments, setAssignments] = useState<RouteAssignment[]>([]);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<RouteAssignment | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showAssignmentDetails, setShowAssignmentDetails] = useState(false);
  const [showAssignmentDetailsDialog, setShowAssignmentDetailsDialog] =
    useState(false);
  const [assignmentDialogMode, setAssignmentDialogMode] = useState<
    "create" | "edit"
  >("create");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("schedules");

  // Assignment filters state
  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const [assignmentFilters, setAssignmentFilters] = useState({
    date: getTodayDate(),
    route_id: "all",
    collector_id: "all",
  });

  // Fetch schedules from database
  useEffect(() => {
    fetchSchedules();
    fetchRoutes();
    fetchAssignments();
    fetchCollectors();
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

  const fetchAssignments = async (filters?: typeof assignmentFilters) => {
    try {
      const activeFilters = filters || assignmentFilters;
      const params = new URLSearchParams();

      if (activeFilters.date) {
        params.append("date", activeFilters.date);
      }
      if (activeFilters.route_id && activeFilters.route_id !== "all") {
        params.append("route_id", activeFilters.route_id);
      }
      if (activeFilters.collector_id && activeFilters.collector_id !== "all") {
        params.append("collector_id", activeFilters.collector_id);
      }

      const url = `/api/admin/assignments${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Không thể tải danh sách lịch trình");
    }
  };

  const fetchCollectors = async () => {
    try {
      const response = await fetch("/api/admin/collectors");
      if (response.ok) {
        const data = await response.json();
        setCollectors(data.collectors || []);
      }
    } catch (error) {
      console.error("Error fetching collectors:", error);
      toast.error("Không thể tải danh sách nhân viên thu gom");
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

  const handleRouteDeleted = async (routeId: string) => {
    try {
      // Route đã được xóa thành công từ RouteCreator
      // Refresh danh sách và đóng dialog
      await fetchRoutes();
      setShowRouteDialog(false);
      setSelectedRoute(null);
    } catch (error) {
      console.error("Error refreshing routes after delete:", error);
      toast.error("Không thể refresh danh sách tuyến đường");
    }
  };

  // Assignment handlers
  const handleAssignmentClick = (assignment: RouteAssignment) => {
    setSelectedAssignment(assignment);
    setShowAssignmentDetailsDialog(true);
  };

  const handleCreateAssignment = () => {
    setSelectedAssignment(null);
    setAssignmentDialogMode("create");
    setShowAssignmentDialog(true);
  };

  // Filter handlers
  const handleFiltersChange = (newFilters: typeof assignmentFilters) => {
    setAssignmentFilters(newFilters);
    // Auto-fetch assignments when filters change
    fetchAssignments(newFilters);
  };

  const handleAssignmentCreated = async (assignmentData: any) => {
    try {
      // Assignment đã được tạo thành công
      // Chỉ cần refresh danh sách và đóng dialog
      await fetchAssignments();
      setShowAssignmentDialog(false);
    } catch (error) {
      console.error("Error refreshing assignments:", error);
      toast.error("Không thể refresh danh sách lịch trình");
    }
  };

  const handleAssignmentDeleted = async (assignmentId: string) => {
    try {
      // Assignment đã được xóa thành công
      // Refresh danh sách và đóng dialog
      await fetchAssignments();
      setShowAssignmentDialog(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error("Error refreshing assignments after delete:", error);
      toast.error("Không thể refresh danh sách lịch trình");
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
                  <th className="text-left p-3 font-medium">Khu vực</th>
                  <th className="text-left p-3 font-medium">Trạng thái</th>
                  <th className="text-left p-3 font-medium">
                    Thời gian dự kiến (phút)
                  </th>
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
                      {route.address ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {
                              AddressService.formatShortAddress(
                                route.address.province,
                                route.address.district,
                                route.address.ward
                              ).main
                            }
                          </div>
                          <div className="text-gray-500">
                            {
                              AddressService.formatShortAddress(
                                route.address.province,
                                route.address.district,
                                route.address.ward
                              ).sub
                            }
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Chưa chọn</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          route.status === "ACTIVE"
                            ? "success"
                            : route.status === "DRAFT"
                            ? "warning"
                            : "error"
                        }
                      >
                        {route.status === "ACTIVE"
                          ? "Hoạt động"
                          : route.status === "DRAFT"
                          ? "Tạm khóa"
                          : route.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      {route.estimated_duration}
                    </td>
                  </tr>
                ))}
                {routes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
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

  // Component AssignmentTable
  const AssignmentTable = () => {
    const getProgressValue = (status: string) => {
      switch (status) {
        case "COMPLETED":
          return 100;
        case "IN_PROGRESS":
          return 45;
        case "PENDING":
          return 0;
        case "FAILED":
          return 0;
        default:
          return 0;
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case "PENDING":
          return "CHUẨN BỊ";
        case "IN_PROGRESS":
          return "ĐANG THỰC HIỆN";
        case "COMPLETED":
          return "HOÀN THÀNH";
        case "FAILED":
          return "KHÔNG HOÀN THÀNH";
        default:
          return status;
      }
    };

    const getStatusVariant = (status: string) => {
      switch (status) {
        case "COMPLETED":
          return "success";
        case "IN_PROGRESS":
          return "info";
        case "PENDING":
          return "warning";
        case "FAILED":
          return "error";
        default:
          return "default";
      }
    };

    return (
      <>
        <AssignmentFilterBar
          routes={routes}
          collectors={collectors}
          filters={assignmentFilters}
          onFiltersChange={handleFiltersChange}
        />
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Danh sách lịch trình</CardTitle>
              <CreateAssignmentDialog
                routes={routes}
                collectors={collectors}
                onAssignmentCreated={fetchAssignments}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Tuyến đường</th>
                    <th className="text-left p-3 font-medium">Nhân viên</th>
                    <th className="text-left p-3 font-medium">
                      Thời gian bắt đầu
                    </th>
                    <th className="text-left p-3 font-medium">Trạng thái</th>
                    <th className="text-left p-3 font-medium">Hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAssignmentClick(assignment)}
                    >
                      <td className="p-3">{assignment.route.name}</td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {assignment.collector.name}
                          </span>
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {assignment.collector.phone && (
                              <div>📞 {assignment.collector.phone}</div>
                            )}
                            {assignment.collector.licensePlate && (
                              <div>🚗 {assignment.collector.licensePlate}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {new Date(assignment.assigned_date).toLocaleDateString(
                          "vi-VN"
                        )}{" "}
                        {assignment.time_window_start}
                      </td>
                      <td className="p-3">
                        <Badge variant={getStatusVariant(assignment.status)}>
                          {getStatusText(assignment.status)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={getProgressValue(assignment.status)}
                            className="w-16 h-2"
                          />
                          <span className="text-sm text-gray-600 min-w-[35px]">
                            {getProgressValue(assignment.status)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        Chưa có lịch trình nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </>
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
          <AssignmentTable />
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
              {routeDialogMode === "create"
                ? "Tạo tuyến đường mới"
                : "Chỉnh sửa tuyến đường"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <RouteCreator
              mode={routeDialogMode}
              routeId={
                routeDialogMode === "edit" && selectedRoute
                  ? selectedRoute.id
                  : undefined
              }
              onRouteCreated={handleRouteCreated}
              onRouteDeleted={handleRouteDeleted}
              initialData={
                routeDialogMode === "edit" && selectedRoute
                  ? {
                      name: selectedRoute.name,
                      description: selectedRoute.description,
                      estimated_duration: selectedRoute.estimated_duration,
                      status: selectedRoute.status,
                      address: selectedRoute.address, // Include administrative address
                      pickup_points: selectedRoute.trackPoints.map((point) => ({
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

      {/* Assignment Details Dialog */}
      <AssignmentDetailsDialog
        assignment={selectedAssignment}
        open={showAssignmentDetailsDialog}
        onOpenChange={setShowAssignmentDetailsDialog}
        routes={routes}
        collectors={collectors}
        onAssignmentUpdated={fetchAssignments}
        onAssignmentDeleted={fetchAssignments}
      />
    </div>
  );
}
