"use client";

import { useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RouteAssignment, AssignmentStatus } from "@/types/route-assignment";
import { Progress } from "@/components/ui/progress";
import { collectorAPI } from "@/apis/collector.api";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamic import to prevent SSR issues
const SimpleLeafletMap = dynamic(
  () => import("@/components/ui/simple-leaflet-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  }
);

interface CollectorAssignmentDetailDialogProps {
  assignment: RouteAssignment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (assignment: RouteAssignment) => void;
}

export function CollectorAssignmentDetailDialog({
  assignment,
  isOpen,
  onClose,
  onUpdate,
}: CollectorAssignmentDetailDialogProps) {
  const [status, setStatus] = useState<AssignmentStatus>(
    AssignmentStatus.PENDING
  );
  const [notes, setNotes] = useState("");

  // Mutation for updating assignment with React Query
  const updateAssignmentMutation = useMutation({
    mutationFn: collectorAPI.updateAssignment,
    onSuccess: (data) => {
      toast.success("Cập nhật trạng thái thành công");
      if (onUpdate) {
        onUpdate(data.assignment);
      }
      onClose();
    },
    onError: (error) => {
      console.error("Error updating assignment:", error);
      toast.error("Không thể cập nhật trạng thái");
    },
  });

  useEffect(() => {
    if (assignment) {
      setNotes(assignment.notes || "");
      setStatus(assignment.status);
    }
  }, [assignment]);

  // Prepare map data
  const mapData = useMemo(() => {
    if (!assignment?.route?.trackPoints) return null;

    try {
      const trackPoints =
        typeof assignment.route.trackPoints === "string"
          ? JSON.parse(assignment.route.trackPoints)
          : assignment.route.trackPoints;
      const points = trackPoints.map((point: any, index: number) => ({
        id: `point-${index}`,
        lat: point.lat,
        lng: point.lng,
        address: point.address || `Điểm ${index + 1}`,
        type:
          index === 0
            ? "start"
            : index === trackPoints.length - 1
            ? "end"
            : ("pickup" as const),
      }));

      // Get center point
      const center =
        points.length > 0
          ? {
              lat: points[0].lat,
              lng: points[0].lng,
            }
          : { lat: 10.8231, lng: 106.6297 }; // Default to Ho Chi Minh City

      return { points, center };
    } catch (error) {
      console.error("Error parsing track points:", error);
      return null;
    }
  }, [assignment?.route?.trackPoints]);

  const getStatusText = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.PENDING:
        return "Chờ bắt đầu";
      case AssignmentStatus.IN_PROGRESS:
        return "Đang thực hiện";
      case AssignmentStatus.COMPLETED:
        return "Hoàn thành";
      case AssignmentStatus.CANCELLED:
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.PENDING:
        return "warning" as const;
      case AssignmentStatus.IN_PROGRESS:
        return "info" as const;
      case AssignmentStatus.COMPLETED:
        return "success" as const;
      case AssignmentStatus.CANCELLED:
        return "error" as const;
      default:
        return "default" as const;
    }
  };

  const getProgressValue = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.PENDING:
        return 0;
      case AssignmentStatus.IN_PROGRESS:
        return 50;
      case AssignmentStatus.COMPLETED:
        return 100;
      case AssignmentStatus.CANCELLED:
        return 0;
      default:
        return 0;
    }
  };

  const handleUpdateStatus = async () => {
    if (!assignment) return;

    updateAssignmentMutation.mutate({
      assignmentId: assignment.id,
      status,
      notes,
    });
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết lịch trình</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Tuyến đường
              </Label>
              <p className="mt-1 text-sm">{assignment.route.name}</p>
              {assignment.route.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {assignment.route.description}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Ngày thực hiện
              </Label>
              <p className="mt-1 text-sm">
                {new Date(assignment.assigned_date).toLocaleDateString("vi-VN")}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Khung thời gian
              </Label>
              <p className="mt-1 text-sm">
                {assignment.time_window_start}
                {assignment.time_window_end &&
                  ` - ${assignment.time_window_end}`}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Khoảng cách dự kiến
              </Label>
              <p className="mt-1 text-sm">
                {assignment.route.total_distance_km} km (~
                {assignment.route.estimated_duration} phút)
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Trạng thái hiện tại
              </Label>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={getStatusVariant(assignment.status)}>
                  {getStatusText(assignment.status)}
                </Badge>
                <Progress
                  value={getProgressValue(assignment.status)}
                  className="w-24 h-2"
                />
              </div>
            </div>

            {assignment.started_at && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Bắt đầu lúc
                </Label>
                <p className="mt-1 text-sm">
                  {new Date(assignment.started_at).toLocaleString("vi-VN")}
                </p>
              </div>
            )}

            {assignment.completed_at && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Hoàn thành lúc
                </Label>
                <p className="mt-1 text-sm">
                  {new Date(assignment.completed_at).toLocaleString("vi-VN")}
                </p>
              </div>
            )}
          </div>

          {/* Status Update Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status-select">Cập nhật trạng thái</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as AssignmentStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AssignmentStatus.PENDING}>
                        Chờ bắt đầu
                      </SelectItem>
                      <SelectItem value={AssignmentStatus.IN_PROGRESS}>
                        Đang thực hiện
                      </SelectItem>
                      <SelectItem value={AssignmentStatus.COMPLETED}>
                        Hoàn thành
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes-textarea">Ghi chú</Label>
                  <Textarea
                    id="notes-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Thêm ghi chú về quá trình thực hiện..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleUpdateStatus}
                  disabled={updateAssignmentMutation.isPending}
                  className="w-full"
                >
                  {updateAssignmentMutation.isPending
                    ? "Đang cập nhật..."
                    : "Cập nhật trạng thái"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Map Section */}
          {mapData && (
            <Card>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Bản đồ lộ trình</h4>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Thông tin:</strong>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Điểm xanh là điểm bắt đầu</li>
                        <li>• Điểm đỏ là điểm kết thúc</li>
                        <li>• Các điểm vàng là điểm thu gom</li>
                        <li>• Đường màu xanh thể hiện lộ trình tối ưu</li>
                      </ul>
                    </div>
                  </div>

                  <SimpleLeafletMap
                    center={mapData.center}
                    points={mapData.points}
                    showRoute={mapData.points.length >= 2}
                    autoFitBounds={true}
                    height="400px"
                    zoom={13}
                  />
                </div>

                {/* Route Points List */}
                {mapData.points.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      Các điểm thu gom ({mapData.points.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {mapData.points.map((point: any, index: number) => (
                        <div
                          key={point.id}
                          className="flex items-center gap-3 p-2 border rounded text-sm"
                        >
                          <Badge
                            variant={
                              index === 0
                                ? "success"
                                : index === mapData.points.length - 1
                                ? "error"
                                : "info"
                            }
                          >
                            {index === 0
                              ? "Start"
                              : index === mapData.points.length - 1
                              ? "End"
                              : index}
                          </Badge>
                          <div className="flex-1">
                            <div className="font-medium">{point.address}</div>
                            <div className="text-xs text-gray-500">
                              {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
