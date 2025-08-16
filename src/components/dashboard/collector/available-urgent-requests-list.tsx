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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  User,
  Phone,
  Mail,
  MapIcon,
  CheckCircle,
} from "lucide-react";
import { UrgentRequestResponse } from "@/apis/urgent-requests.api";
import {
  useCollectorUrgentRequests,
  useAssignUrgentRequest,
} from "@/hooks/use-collector-urgent-requests";
import dynamic from "next/dynamic";

// Dynamic import for map to avoid SSR issues
const SimpleLeafletMap = dynamic(
  () => import("@/components/ui/simple-leaflet-map"),
  { ssr: false }
);

// Helper functions
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

interface AvailableRequestDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: UrgentRequestResponse | null;
  onAccept: (requestId: string) => void;
}

function AvailableRequestDetailDialog({
  isOpen,
  onClose,
  request,
  onAccept,
}: AvailableRequestDetailDialogProps) {
  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Yêu cầu thu gom #{request.id.slice(-8)}
            </span>
            <Badge variant={getUrgencyBadgeVariant(request.urgency_level)}>
              {getUrgencyText(request.urgency_level)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Chi tiết yêu cầu thu gom khẩn cấp và thông tin khách hàng
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

          {/* Request Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">Ngày tạo:</span>
              <div className="text-sm text-muted-foreground">
                {format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
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

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            onClick={() => {
              onAccept(request.id);
              onClose();
            }}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Nhận yêu cầu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AvailableUrgentRequestsList() {
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] =
    useState<UrgentRequestResponse | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const limit = 10;

  const { data, isLoading, error } = useCollectorUrgentRequests({
    page,
    limit,
    status: "PENDING", // Only available requests
  });

  const acceptMutation = useAssignUrgentRequest();

  const handleRequestClick = (request: UrgentRequestResponse) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  const handleAcceptRequest = async (requestId: string) => {
    await acceptMutation.mutateAsync(requestId);
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

  if (urgentRequests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không có yêu cầu mới</h3>
          <p className="text-muted-foreground">
            Hiện tại không có yêu cầu thu gom khẩn cấp nào cần nhận.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
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
                      {format(new Date(request.requested_date), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(request.createdAt), "HH:mm", {
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
      <AvailableRequestDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onAccept={handleAcceptRequest}
      />
    </div>
  );
}
