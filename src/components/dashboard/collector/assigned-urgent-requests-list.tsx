"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  User,
  Phone,
  Mail,
  CheckCircle,
  PlayCircle,
  Package,
} from "lucide-react";
import { UrgentRequestResponse } from "@/apis/urgent-requests.api";
import {
  useCollectorUrgentRequests,
  useUpdateUrgentRequestStatus,
} from "@/hooks/use-collector-urgent-requests";
import dynamic from "next/dynamic";

// Dynamic import for map to avoid SSR issues
const SimpleLeafletMap = dynamic(
  () => import("@/components/ui/simple-leaflet-map"),
  { ssr: false }
);

// Helper functions
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "ASSIGNED":
      return "info";
    case "IN_PROGRESS":
      return "warning";
    case "COMPLETED":
      return "success";
    default:
      return "default";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "ASSIGNED":
      return "Đã phân công";
    case "IN_PROGRESS":
      return "Đang thu gom";
    case "COMPLETED":
      return "Hoàn thành";
    default:
      return status;
  }
};

const getUrgencyBadgeVariant = (urgencyLevel: string) => {
  switch (urgencyLevel) {
    case "MEDIUM":
      return "default";
    case "HIGH":
      return "warning";
    case "CRITICAL":
      return "error";
    default:
      return "default";
  }
};

const getUrgencyText = (urgencyLevel: string) => {
  switch (urgencyLevel) {
    case "MEDIUM":
      return "Bình thường";
    case "HIGH":
      return "Khẩn cấp";
    case "CRITICAL":
      return "Rất khẩn cấp";
    default:
      return urgencyLevel;
  }
};

interface AssignedRequestDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: UrgentRequestResponse | null;
  onStatusUpdate: (
    requestId: string,
    status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED"
  ) => void;
}

function AssignedRequestDetailDialog({
  isOpen,
  onClose,
  request,
  onStatusUpdate,
}: AssignedRequestDetailDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!request) return null;

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === request.status) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(request.id, selectedStatus as any);
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Yêu cầu thu gom #{request.id.slice(-8)}
            </span>
            <div className="flex gap-2">
              <Badge variant={getUrgencyBadgeVariant(request.urgency_level)}>
                {getUrgencyText(request.urgency_level)}
              </Badge>
              <Badge variant={getStatusBadgeVariant(request.status)}>
                {getStatusText(request.status)}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Chi tiết yêu cầu thu gom đã nhận và cập nhật trạng thái
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Tên khách hàng:</span>
                <div className="text-sm">{request.user.name}</div>
              </div>
              <div>
                <span className="text-sm font-medium">Email:</span>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {request.user.email}
                </div>
              </div>
              {request.user.phone && (
                <div>
                  <span className="text-sm font-medium">Số điện thoại:</span>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {request.user.phone}
                  </div>
                </div>
              )}
              {(request.user as any).address && (
                <div>
                  <span className="text-sm font-medium">Địa chỉ cư trú:</span>
                  <div className="text-sm text-muted-foreground">
                    {(request.user as any).address}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Request Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium">Ngày tạo:</span>
              <div className="text-sm text-muted-foreground">
                {format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium">Ngày nhận:</span>
              <div className="text-sm text-muted-foreground">
                {request.assigned_at
                  ? format(new Date(request.assigned_at), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })
                  : "Chưa xác định"}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium">Ngày mong muốn:</span>
              <div className="text-sm text-muted-foreground">
                {format(new Date(request.requested_date), "dd/MM/yyyy", {
                  locale: vi,
                })}
              </div>
            </div>
          </div>

          {/* Completion Date */}
          {request.completed_at && (
            <div>
              <span className="text-sm font-medium">Ngày hoàn thành:</span>
              <div className="text-sm text-muted-foreground">
                {format(new Date(request.completed_at), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              </div>
            </div>
          )}

          {/* Pickup Location */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Địa chỉ thu gom</div>
                <div className="text-sm text-muted-foreground">
                  {request.pickup_address}
                </div>
                {request.pickup_lat && request.pickup_lng && (
                  <div className="text-xs text-muted-foreground">
                    {request.pickup_lat.toFixed(6)},{" "}
                    {request.pickup_lng.toFixed(6)}
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            {request.pickup_lat && request.pickup_lng && (
              <div className="h-64 border rounded-lg overflow-hidden">
                <SimpleLeafletMap
                  center={{ lat: request.pickup_lat, lng: request.pickup_lng }}
                  points={[
                    {
                      id: "pickup",
                      lat: request.pickup_lat,
                      lng: request.pickup_lng,
                      address: request.pickup_address,
                      type: "pickup",
                    },
                  ]}
                  zoom={16}
                />
              </div>
            )}
          </div>

          {/* Waste Description */}
          <div>
            <div className="font-medium mb-1">Mô tả rác thải</div>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              {request.waste_description}
            </div>
          </div>

          {/* Status Update Section */}
          {request.status !== "COMPLETED" && (
            <div className="bg-blue-50 p-4 rounded-lg border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Cập nhật trạng thái
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Trạng thái mới:</label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Chọn trạng thái mới" />
                    </SelectTrigger>
                    <SelectContent>
                      {request.status === "ASSIGNED" && (
                        <SelectItem value="IN_PROGRESS">
                          Đang thu gom
                        </SelectItem>
                      )}
                      {(request.status === "ASSIGNED" ||
                        request.status === "IN_PROGRESS") && (
                        <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {request.status !== "COMPLETED" &&
            selectedStatus &&
            selectedStatus !== request.status && (
              <Button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Cập nhật trạng thái
                  </>
                )}
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AssignedUrgentRequestsList() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] =
    useState<UrgentRequestResponse | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const limit = 10;

  const { data, isLoading, error } = useCollectorUrgentRequests({
    page,
    limit,
    status: statusFilter === "ALL" ? "ASSIGNED" : (statusFilter as any), // Default to ASSIGNED
  });

  const statusUpdateMutation = useUpdateUrgentRequestStatus();

  const handleRequestClick = (request: UrgentRequestResponse) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  const handleStatusUpdate = async (
    requestId: string,
    status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED"
  ) => {
    await statusUpdateMutation.mutateAsync({ id: requestId, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Có lỗi xảy ra khi tải dữ liệu</p>
        </CardContent>
      </Card>
    );
  }

  const urgentRequests = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="ASSIGNED">Đã phân công</SelectItem>
            <SelectItem value="IN_PROGRESS">Đang thu gom</SelectItem>
            <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {urgentRequests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Chưa có yêu cầu đã nhận
            </h3>
            <p className="text-muted-foreground">
              Bạn chưa nhận yêu cầu thu gom nào. Hãy kiểm tra tab "Chưa nhận" để
              nhận yêu cầu mới.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {urgentRequests.map((request: UrgentRequestResponse) => (
            <Card
              key={request.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleRequestClick(request)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Yêu cầu #{request.id.slice(-8)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(
                          new Date(request.requested_date),
                          "dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Nhận:{" "}
                        {request.assigned_at
                          ? format(
                              new Date(request.assigned_at),
                              "dd/MM HH:mm",
                              { locale: vi }
                            )
                          : "N/A"}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge
                      variant={getUrgencyBadgeVariant(request.urgency_level)}
                    >
                      {getUrgencyText(request.urgency_level)}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(request.status)}>
                      {getStatusText(request.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Customer Info */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{request.user.name}</span>
                    {request.user.phone && (
                      <span className="text-muted-foreground">
                        • {request.user.phone}
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">
                      {request.pickup_address}
                    </span>
                  </div>

                  {/* Waste Description */}
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Mô tả: </span>
                    {request.waste_description.length > 100
                      ? `${request.waste_description.substring(0, 100)}...`
                      : request.waste_description}
                  </div>

                  {/* Completion Date */}
                  {request.completed_at && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Hoàn thành: </span>
                      {format(
                        new Date(request.completed_at),
                        "dd/MM/yyyy HH:mm",
                        { locale: vi }
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {pagination.page} / {pagination.totalPages}({pagination.total}{" "}
            yêu cầu)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Trang trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <AssignedRequestDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
