"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageGallery } from "@/components/ui/image-gallery";
import {
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  useAdminSupportRequests,
  useUpdateSupportRequest,
} from "@/hooks/use-support";
import type { SupportRequest } from "@/types/support";
import { toast } from "sonner";

export default function AdminSupportPage() {
  const [filter, setFilter] = useState({
    search: "",
    status: "all",
    type: "all",
    priority: "all",
  });
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(
    null
  );
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    adminNotes: "",
    priority: "",
    adminResponse: "",
  });

  // API calls
  const { data: requestsData, isLoading } = useAdminSupportRequests({
    ...filter,
    search: filter.search || undefined,
    status: filter.status === "all" ? undefined : filter.status,
    type: filter.type === "all" ? undefined : filter.type,
    priority: filter.priority === "all" ? undefined : filter.priority,
  });

  const updateMutation = useUpdateSupportRequest(selectedRequest?.id || "");

  const requests = requestsData?.data || [];
  const pagination = requestsData?.pagination;

  const statusMap = {
    PENDING: "Chờ xử lý",
    IN_PROGRESS: "Đang xử lý",
    RESOLVED: "Đã giải quyết",
    REJECTED: "Từ chối",
  };

  const typeMap = {
    PAYMENT: "Thanh toán",
    SCHEDULE: "Lịch thu gom",
    ACCOUNT: "Tài khoản",
    TECHNICAL_ISSUE: "Lỗi kỹ thuật",
    OTHER: "Khác",
  };

  const priorityMap = {
    NORMAL: "Bình thường",
    HIGH: "Cao",
    URGENT: "Khẩn cấp",
  };

  function getStatusVariant(status: string) {
    switch (status) {
      case "PENDING":
        return "warning";
      case "IN_PROGRESS":
        return "info";
      case "RESOLVED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  }

  function getPriorityVariant(priority: string) {
    switch (priority) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      case "NORMAL":
        return "default";
      default:
        return "default";
    }
  }

  function openUpdateDialog(request: SupportRequest) {
    setSelectedRequest(request);
    setUpdateData({
      status: request.status,
      adminNotes: request.adminNotes || "",
      priority: request.priority,
      adminResponse: request.adminResponse || "",
    });
    setUpdateDialogOpen(true);
  }

  function handleUpdate() {
    if (!selectedRequest) return;

    updateMutation.mutate(updateData, {
      onSuccess: () => {
        toast.success("Cập nhật yêu cầu hỗ trợ thành công");
        setUpdateDialogOpen(false);
        setSelectedRequest(null);
      },
      onError: (error: any) => {
        toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
      },
    });
  }

  // Thống kê
  const stats = {
    total: requests.length,
    pending: requests.filter((r: any) => r.status === "PENDING").length,
    inProgress: requests.filter((r: any) => r.status === "IN_PROGRESS").length,
    resolved: requests.filter((r: any) => r.status === "RESOLVED").length,
    urgent: requests.filter((r: any) => r.priority === "URGENT").length,
  };

  return (
    <div className="container py-8 max-w-7xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Quản lý hỗ trợ khách hàng
      </h1>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng số</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chờ xử lý</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang xử lý</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.inProgress}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đã giải quyết</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.resolved}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bộ lọc */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Tìm kiếm..."
              value={filter.search}
              onChange={(e) =>
                setFilter((f) => ({ ...f, search: e.target.value }))
              }
            />
            <Select
              value={filter.status}
              onValueChange={(v) =>
                setFilter((f) => ({ ...f, status: v === "all" ? "" : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(statusMap).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.type}
              onValueChange={(v) =>
                setFilter((f) => ({ ...f, type: v === "all" ? "" : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Loại yêu cầu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(typeMap).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.priority}
              onValueChange={(v) =>
                setFilter((f) => ({ ...f, priority: v === "all" ? "" : v }))
              }
            ></Select>
          </div>
        </CardContent>
      </Card>

      {/* Bảng yêu cầu hỗ trợ */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu hỗ trợ</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {typeMap[request.type as keyof typeof typeMap] ||
                          request.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={request.title}>
                        {request.title}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={getStatusVariant(request.status) as any}>
                        {statusMap[request.status as keyof typeof statusMap] ||
                          request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      {request.feedback ? (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={
                                n <= request.feedback.rating
                                  ? "text-yellow-400 fill-yellow-400 w-4 h-4"
                                  : "text-gray-300 w-4 h-4"
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openUpdateDialog(request)}
                      >
                        Xử lý
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                    >
                      Không có yêu cầu hỗ trợ nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog xử lý yêu cầu */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xử lý yêu cầu hỗ trợ</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Khách hàng</label>
                  <p className="text-sm">{selectedRequest.user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedRequest.user?.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Loại yêu cầu</label>
                  <p className="text-sm">
                    {typeMap[selectedRequest.type as keyof typeof typeMap]}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Tiêu đề</label>
                <p className="text-sm">{selectedRequest.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Mô tả</label>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Ảnh đính kèm */}
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Ảnh đính kèm từ khách hàng ({selectedRequest.images.length})
                  </label>
                  <ImageGallery images={selectedRequest.images} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Trạng thái</label>
                  <Select
                    value={updateData.status}
                    onValueChange={(v) =>
                      setUpdateData((d) => ({ ...d, status: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusMap).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Ghi chú của admin</label>
                <Textarea
                  value={updateData.adminNotes}
                  onChange={(e) =>
                    setUpdateData((d) => ({ ...d, adminNotes: e.target.value }))
                  }
                  placeholder="Thêm ghi chú về quá trình xử lý..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Phản hồi cho khách hàng
                </label>
                <Textarea
                  value={updateData.adminResponse}
                  onChange={(e) =>
                    setUpdateData((d) => ({
                      ...d,
                      adminResponse: e.target.value,
                    }))
                  }
                  placeholder="Tin nhắn phản hồi sẽ được gửi cho khách hàng..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Khách hàng sẽ thấy phản hồi này trong phần yêu cầu hỗ trợ của
                  họ
                </p>
              </div>

              {selectedRequest.feedback && (
                <div>
                  <label className="text-sm font-medium">
                    Đánh giá từ khách hàng
                  </label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={
                            n <= selectedRequest.feedback!.rating
                              ? "text-yellow-400 fill-yellow-400 w-4 h-4"
                              : "text-gray-300 w-4 h-4"
                          }
                        />
                      ))}
                      <span className="text-sm font-medium">
                        {selectedRequest.feedback.rating}/5
                      </span>
                    </div>
                    {selectedRequest.feedback.comment && (
                      <p className="text-sm text-gray-600">
                        {selectedRequest.feedback.comment}
                      </p>
                    )}
                    {/* Ảnh từ feedback */}
                    {selectedRequest.feedback.images &&
                      selectedRequest.feedback.images.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">
                            Ảnh đính kèm (
                            {selectedRequest.feedback.images.length})
                          </p>
                          <ImageGallery
                            images={selectedRequest.feedback.images}
                          />
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
