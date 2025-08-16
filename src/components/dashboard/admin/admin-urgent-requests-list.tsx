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
  UserCheck,
  XCircle,
  Filter,
} from "lucide-react";
import { UrgentRequestResponse } from "@/apis/urgent-requests.api";
import {
  useAdminUrgentRequests,
  useCancelUrgentRequestAdmin,
} from "@/hooks/use-admin-urgent-requests";
import dynamic from "next/dynamic";

// Dynamic import for map to avoid SSR issues
const SimpleLeafletMap = dynamic(
  () => import("@/components/ui/simple-leaflet-map"),
  { ssr: false }
);

// Helper functions
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "PENDING":
      return "info";
    case "ASSIGNED":
      return "default";
    case "IN_PROGRESS":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Chờ xử lý";
    case "ASSIGNED":
      return "Đã phân công";
    case "IN_PROGRESS":
      return "Đang thu gom";
    case "COMPLETED":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
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

interface AdminRequestDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: UrgentRequestResponse | null;
  onCancel: (requestId: string) => void;
}

function AdminRequestDetailDialog({
  isOpen,
  onClose,
  request,
  onCancel,
}: AdminRequestDetailDialogProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  if (!request) return null;

  const canCancel =
    request.status !== "COMPLETED" && request.status !== "CANCELLED";

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel(request.id);
      onClose();
    } catch (error) {
      console.error("Error cancelling request:", error);
    } finally {
      setIsCancelling(false);
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
            Chi tiết yêu cầu thu gom khẩn cấp - Quản lý bởi Admin
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

          {/* Collector Info (if assigned) */}
          {request.collector && (
            <div className="bg-blue-50 p-4 rounded-lg border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Thông tin nhân viên thu gom
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Tên nhân viên:</span>
                  <div className="text-sm">{request.collector.name}</div>
                </div>

                {request.collector.phone && (
                  <div>
                    <span className="text-sm font-medium">Số điện thoại:</span>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {request.collector.phone}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
            {request.assigned_at && (
              <div>
                <span className="text-sm font-medium">Ngày phân công:</span>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(request.assigned_at), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })}
                </div>
              </div>
            )}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex items-center gap-2"
            >
              {isCancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang hủy...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Hủy yêu cầu
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUrgentRequestsList() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] =
    useState<UrgentRequestResponse | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const limit = 10;

  const { data, isLoading, error } = useAdminUrgentRequests({
    page,
    limit,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    urgency_level: urgencyFilter === "ALL" ? undefined : urgencyFilter,
  });

  const cancelMutation = useCancelUrgentRequestAdmin();

  const handleRequestClick = (request: UrgentRequestResponse) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  const handleCancelRequest = async (requestId: string) => {
    await cancelMutation.mutateAsync(requestId);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Quản lý yêu cầu thu gom khẩn cấp
          </h1>
          <p className="text-muted-foreground">
            Xem và quản lý tất cả yêu cầu thu gom khẩn cấp trong hệ thống
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Lọc:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">Chờ xử lý</SelectItem>
            <SelectItem value="ASSIGNED">Đã phân công</SelectItem>
            <SelectItem value="IN_PROGRESS">Đang thu gom</SelectItem>
            <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo mức độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả mức độ</SelectItem>
            <SelectItem value="CRITICAL">Rất khẩn cấp</SelectItem>
            <SelectItem value="HIGH">Khẩn cấp</SelectItem>
            <SelectItem value="MEDIUM">Bình thường</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {urgentRequests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không có yêu cầu</h3>
            <p className="text-muted-foreground">
              Không có yêu cầu thu gom khẩn cấp nào phù hợp với bộ lọc hiện tại.
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
                        {format(new Date(request.createdAt), "dd/MM HH:mm", {
                          locale: vi,
                        })}
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

                  {/* Collector Info */}
                  {request.collector && (
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700">
                        Nhân viên: {request.collector.name}
                      </span>
                      {request.collector.phone && (
                        <span className="text-muted-foreground">
                          • {request.collector.phone}
                        </span>
                      )}
                    </div>
                  )}

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

                  {/* Assignment/Completion Date */}
                  {request.assigned_at && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Ngày phân công: </span>
                      {format(
                        new Date(request.assigned_at),
                        "dd/MM/yyyy HH:mm",
                        { locale: vi }
                      )}
                    </div>
                  )}
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
      <AdminRequestDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onCancel={handleCancelRequest}
      />
    </div>
  );
}
