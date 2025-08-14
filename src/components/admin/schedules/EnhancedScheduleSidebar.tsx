import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, MapPin, User, Route, AlertTriangle } from "lucide-react";
import {
  RouteWithUrgents,
  ROUTE_STATUS_LABELS,
  URGENCY_LEVEL_LABELS,
} from "@/types/route";
import { EnhancedScheduleMapView } from "./ScheduleMapView";
import { toast } from "sonner";

export interface EnhancedScheduleSidebarProps {
  open: boolean;
  routeData: RouteWithUrgents | null;
  onClose: () => void;
  onRouteUpdate?: (routeId: string, updates: any) => void;
  onUrgentRequestAssign?: (urgentId: string, routeId: string) => void;
}

export function EnhancedScheduleSidebar({
  open,
  routeData,
  onClose,
  onRouteUpdate,
  onUrgentRequestAssign,
}: EnhancedScheduleSidebarProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!routeData) return null;

  const { route, urgent_points } = routeData;

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onRouteUpdate) return;

    setIsUpdating(true);
    try {
      await onRouteUpdate(route.id, { status: newStatus });
      toast.success("Đã cập nhật trạng thái");
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignUrgent = async (urgentId: string) => {
    if (!onUrgentRequestAssign) return;

    try {
      await onUrgentRequestAssign(urgentId, route.id);
      toast.success("Đã gán yêu cầu khẩn cấp");
    } catch (error) {
      toast.error("Không thể gán yêu cầu khẩn cấp");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "warning";
      case "ARCHIVED":
        return "error";
      default:
        return "default";
    }
  };

  const getUrgencyBadgeColor = (level: string) => {
    switch (level) {
      case "MEDIUM":
        return "info";
      case "HIGH":
        return "warning";
      case "CRITICAL":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-2xl bg-white shadow-lg flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ width: "40vw", minWidth: 400 }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Route className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold">{route.route_name}</h2>
              <p className="text-sm text-gray-600">{route.route_code}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="route">Lộ trình</TabsTrigger>
              <TabsTrigger value="urgent">Khẩn cấp</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Thông tin cơ bản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      <Badge variant={getStatusBadgeColor(route.status)}>
                        {ROUTE_STATUS_LABELS[route.status]}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Người thu gom</p>
                      <p className="font-medium">
                        {route.created_by || "Chưa phân công"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Thời gian bắt đầu</p>
                      <p className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {route.startTime
                          ? new Date(route.startTime).toLocaleString()
                          : "Chưa đặt lịch"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Thời gian dự kiến</p>
                      <p>{route.estimatedDuration || 0} phút</p>
                    </div>
                  </div>

                  {route.description && (
                    <div>
                      <p className="text-sm text-gray-600">Mô tả</p>
                      <p className="text-sm">{route.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Route Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê lộ trình</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {route.waypoints?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600">Điểm thu gom</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {urgent_points.length}
                      </p>
                      <p className="text-sm text-gray-600">Yêu cầu khẩn cấp</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {route.total_distance_km
                          ? `${route.total_distance_km.toFixed(1)}km`
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">Khoảng cách</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Hành động nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {route.status === "DRAFT" && (
                      <Button
                        onClick={() => handleStatusUpdate("ACTIVE")}
                        disabled={isUpdating}
                        size="sm"
                      >
                        Kích hoạt lộ trình
                      </Button>
                    )}
                    {route.status === "ACTIVE" && (
                      <Button
                        onClick={() => handleStatusUpdate("INACTIVE")}
                        disabled={isUpdating}
                        variant="outline"
                        size="sm"
                      >
                        Tạm dừng
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Sửa lộ trình
                    </Button>
                    <Button variant="outline" size="sm">
                      Sao chép
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Route Tab */}
            <TabsContent value="route" className="p-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Bản đồ lộ trình
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedScheduleMapView routeData={routeData} height={400} />
                </CardContent>
              </Card>

              {/* Pickup Points List */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Điểm thu gom ({route.waypoints?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {route.waypoints?.map((point: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <Badge
                        variant={
                          index === 0
                            ? "success"
                            : index === route.waypoints.length - 1
                            ? "error"
                            : "default"
                        }
                      >
                        {index === 0
                          ? "Bắt đầu"
                          : index === route.waypoints.length - 1
                          ? "Kết thúc"
                          : index + 1}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{point.address}</p>
                        <p className="text-xs text-gray-600">
                          {point.lat?.toFixed(6)}, {point.lng?.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">
                      Chưa có điểm thu gom
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Urgent Tab */}
            <TabsContent value="urgent" className="p-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Yêu cầu khẩn cấp ({urgent_points.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {urgent_points.length > 0 ? (
                    urgent_points.map((urgent) => (
                      <div
                        key={urgent.id}
                        className="border rounded p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={getUrgencyBadgeColor(
                                  urgent.urgency_level
                                )}
                              >
                                {URGENCY_LEVEL_LABELS[urgent.urgency_level]}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {new Date(urgent.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="font-medium">
                              {urgent.pickup_address}
                            </p>
                            {/* {urgent.description && (
                              <p className="text-sm text-gray-600 mt-1">{urgent.description}</p>
                            )} */}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssignUrgent(urgent.id)}
                            disabled={urgent.status === "COMPLETED"}
                          >
                            {urgent.status === "COMPLETED"
                              ? "Đã xử lý"
                              : "Gán vào lộ trình"}
                          </Button>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>
                            📍 {urgent.pickup_lat.toFixed(6)},{" "}
                            {urgent.pickup_lng.toFixed(6)}
                          </span>
                          {/* {urgent.urgency_reason && (
                            <span>📝 {urgent.urgency_reason}</span>
                          )} */}
                        </div>
                      </div>
                    ))
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Không có yêu cầu khẩn cấp nào cho lộ trình này.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {urgent_points.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bản đồ yêu cầu khẩn cấp</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EnhancedScheduleMapView
                      routeData={routeData}
                      height={300}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </aside>
    </>
  );
}

export default EnhancedScheduleSidebar;
