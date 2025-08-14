import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  MapPin,
  Truck,
  User,
  Phone,
  Calendar,
  Route,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ScheduleMapView, EnhancedScheduleMapView } from "./ScheduleMapView";
import OptimizedRouteCreator from "./OptimizedRouteCreator";
import { toast } from "sonner";

interface ScheduleDialogProps {
  schedule: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleDialog({
  schedule,
  open,
  onOpenChange,
}: ScheduleDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!schedule) return null;

  const handleEdit = () => {
    setIsEditing(true);
    toast.info("Chức năng chỉnh sửa đang được phát triển");
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch trình này?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/schedules/${schedule.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Đã xóa lịch trình thành công");
        onOpenChange(false);
        // Refresh the page or call a callback to update the list
        window.location.reload();
      } else {
        throw new Error("Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Không thể xóa lịch trình");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Chờ thực hiện";
      case "in_progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status || "Không xác định";
    }
  };

  const schedulePoints = schedule.pickup_points || [];
  const urgentPoints = schedule.urgent_collections || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Chi tiết lịch trình thu gom
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về lịch trình #{schedule.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="info" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="route">Lộ trình</TabsTrigger>
              <TabsTrigger value="create-route">Tạo lộ trình</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="info" className="space-y-6 mt-0">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Thông tin cơ bản
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Trạng thái
                        </label>
                        <div className="mt-1">
                          <Badge className={getStatusColor(schedule.status)}>
                            {getStatusText(schedule.status)}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Thời gian dự kiến
                        </label>
                        <div className="mt-1 text-sm">
                          {schedule.scheduled_time
                            ? format(
                                new Date(schedule.scheduled_time),
                                "PPP p",
                                { locale: vi }
                              )
                            : "Chưa xác định"}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Khu vực
                        </label>
                        <div className="mt-1 text-sm">
                          {schedule.area || "Chưa xác định"}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Loại thu gom
                        </label>
                        <div className="mt-1 text-sm">
                          {schedule.collection_type || "Thường"}
                        </div>
                      </div>
                    </div>

                    {schedule.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Ghi chú
                        </label>
                        <div className="mt-1 text-sm text-gray-700">
                          {schedule.notes}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Collector Info */}
                {schedule.collector && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Người thu gom
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {schedule.collector.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {schedule.collector.phone ||
                              "Chưa có số điện thoại"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pickup Points */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Điểm thu gom ({schedulePoints.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {schedulePoints.length > 0 ? (
                      <div className="space-y-3">
                        {schedulePoints.map((point: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-shrink-0 h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {point.address}
                              </div>
                              {point.user && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Khách hàng:{" "}
                                  {point.user.name || "Không xác định"}
                                </div>
                              )}
                              <div className="text-xs text-gray-400 mt-1">
                                {point.lat?.toFixed(6)}, {point.lng?.toFixed(6)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Chưa có điểm thu gom nào
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Urgent Collections */}
                {urgentPoints.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Yêu cầu khẩn cấp ({urgentPoints.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {urgentPoints.map((point: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                          >
                            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {point.address}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {point.reason}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Tạo lúc:{" "}
                                {format(new Date(point.created_at), "PPp", {
                                  locale: vi,
                                })}
                              </div>
                            </div>
                            <Badge variant="error" className="text-xs">
                              Khẩn cấp
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="route" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-4 w-4" />
                      Bản đồ lộ trình
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {schedulePoints.length > 0 ? (
                      <div className="h-[500px]">
                        <EnhancedScheduleMapView
                          routeData={{
                            ...schedule,
                            pickup_points: schedulePoints,
                            urgent_points: urgentPoints,
                          }}
                          height={500}
                        />
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                        Không có dữ liệu để hiển thị bản đồ
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Route Stats */}
                {schedule.total_distance_km && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Thống kê lộ trình</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {schedule.total_distance_km?.toFixed(1)} km
                          </div>
                          <div className="text-sm text-gray-600">
                            Tổng quãng đường
                          </div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {schedule.estimated_duration || 0} phút
                          </div>
                          <div className="text-sm text-gray-600">
                            Thời gian dự kiến
                          </div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {schedulePoints.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Điểm thu gom
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Create Route Tab */}
              <TabsContent value="create-route" className="p-0">
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Tạo lộ trình mới</h3>
                    <p className="text-sm text-gray-600">
                      Tạo lộ trình thu gom bằng cách click trên bản đồ
                    </p>
                  </div>
                  <OptimizedRouteCreator
                    onRouteCreated={(route) => {
                      toast.success("Đã tạo lộ trình thành công");
                      onOpenChange(false);
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch sử hoạt động</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          ✓
                        </div>
                        <div>
                          <div className="font-medium">Lịch trình được tạo</div>
                          <div className="text-sm text-gray-600">
                            {schedule.created_at
                              ? format(new Date(schedule.created_at), "PPP p", {
                                  locale: vi,
                                })
                              : "Không xác định"}
                          </div>
                        </div>
                      </div>

                      {schedule.updated_at &&
                        schedule.updated_at !== schedule.created_at && (
                          <div className="flex items-start gap-3 p-3 border-l-4 border-yellow-500 bg-yellow-50">
                            <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">
                              ✎
                            </div>
                            <div>
                              <div className="font-medium">
                                Lịch trình được cập nhật
                              </div>
                              <div className="text-sm text-gray-600">
                                {format(
                                  new Date(schedule.updated_at),
                                  "PPP p",
                                  { locale: vi }
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {schedule.status === "completed" && (
                        <div className="flex items-start gap-3 p-3 border-l-4 border-green-500 bg-green-50">
                          <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                          <div>
                            <div className="font-medium">
                              Thu gom hoàn thành
                            </div>
                            <div className="text-sm text-gray-600">
                              {schedule.completed_at
                                ? format(
                                    new Date(schedule.completed_at),
                                    "PPP p",
                                    { locale: vi }
                                  )
                                : "Thời gian không xác định"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <Separator />
        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit} disabled={isEditing}>
              {isEditing ? "Đang chỉnh sửa..." : "Chỉnh sửa"}
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
