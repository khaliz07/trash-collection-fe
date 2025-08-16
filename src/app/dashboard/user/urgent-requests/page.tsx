"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  User,
  Phone,
} from "lucide-react";
import { useUrgentRequests } from "@/hooks/use-urgent-requests";
import { UrgentRequestResponse } from "@/apis/urgent-requests.api";
import Link from "next/link";

// Helper function to get status badge variant
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

// Helper function to get status text
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

// Helper function to get urgency badge variant
const getUrgencyBadgeVariant = (urgencyLevel: string) => {
  switch (urgencyLevel) {
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

// Helper function to get urgency text
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

export default function UrgentRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useUrgentRequests({
    status: statusFilter || undefined,
    page,
    limit,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Yêu cầu thu gom khẩn cấp
          </h2>
          <p className="text-muted-foreground">
            Quản lý các yêu cầu thu gom khẩn cấp của bạn
          </p>
        </div>
        <div className="text-center py-8">
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Yêu cầu thu gom khẩn cấp
          </h2>
          <p className="text-muted-foreground">
            Quản lý các yêu cầu thu gom khẩn cấp của bạn
          </p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center text-red-600">
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
          </CardContent>
        </Card>
      </div>
    );
  }

  const urgentRequests = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Yêu cầu thu gom khẩn cấp
          </h2>
          <p className="text-muted-foreground">
            Quản lý các yêu cầu thu gom khẩn cấp của bạn
          </p>
        </div>
        <Link href="/dashboard/user/request">
          <Button>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Tạo yêu cầu mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tất cả</SelectItem>
            <SelectItem value="PENDING">Chờ xử lý</SelectItem>
            <SelectItem value="ASSIGNED">Đã phân công</SelectItem>
            <SelectItem value="IN_PROGRESS">Đang thu gom</SelectItem>
            <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {urgentRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có yêu cầu nào</h3>
            <p className="text-muted-foreground mb-4">
              Bạn chưa có yêu cầu thu gom khẩn cấp nào.
            </p>
            <Link href="/dashboard/user/request">
              <Button>Tạo yêu cầu đầu tiên</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {urgentRequests.map((request: UrgentRequestResponse) => (
            <Card key={request.id}>
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
                        {format(
                          new Date(request.createdAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
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
                <div className="space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Địa chỉ thu gom</div>
                      <div className="text-sm text-muted-foreground">
                        {request.pickup_address}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.pickup_lat.toFixed(6)},{" "}
                        {request.pickup_lng.toFixed(6)}
                      </div>
                    </div>
                  </div>

                  {/* Waste Description */}
                  <div>
                    <div className="font-medium mb-1">Mô tả rác thải</div>
                    <div className="text-sm text-muted-foreground">
                      {request.waste_description}
                    </div>
                  </div>

                  {/* Collector Info */}
                  {request.collector && (
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Nhân viên thu gom</div>
                        <div className="text-sm text-muted-foreground">
                          {request.collector.name}
                        </div>
                        {request.collector.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {request.collector.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Completion Date */}
                  {request.completed_at && (
                    <div>
                      <div className="font-medium">Ngày hoàn thành</div>
                      <div className="text-sm text-muted-foreground">
                        {format(
                          new Date(request.completed_at),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </div>
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
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Trang trước
          </Button>
          <span className="flex items-center px-4">
            Trang {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.totalPages}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}
