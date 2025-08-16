"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveTable as Table,
  ResponsiveTableBody as TableBody,
  ResponsiveTableCell as TableCell,
  ResponsiveTableHead as TableHead,
  ResponsiveTableHeader as TableHeader,
  ResponsiveTableRow as TableRow,
} from "@/components/ui/responsive-table";
import { MobileDashboard, StatsGrid, StatCard } from "@/components/ui/mobile-dashboard";
import api from "@/lib/api";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Filter,
  Package,
  RefreshCw,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

interface ServicePackage {
  id: string;
  name: string;
  type: string;
  duration: number; // Add duration field (in months)
  startDate: string;
  endDate: string;
  status: "active" | "expiring" | "expired";
  fee: number;
  monthlyEquivalent?: number; // Add optional monthly equivalent
  area: string;
  description: string;
  features: string[];
  collectionsUsed: number;
  collectionsTotal: number;
  nextCollection: string;
  autoRenewal: boolean;
  daysLeft: number;
  isExpiringSoon: boolean;
  canRenew: boolean;
  renewalPrice: number;
}

interface PaymentRecord {
  id: string;
  invoiceId: string;
  packageName: string;
  duration: string;
  amount: number;
  paidAt: string;
  method: string;
  status: "success" | "failed" | "pending";
  description: string;
  paymentGateway: string;
  transactionId: string;
  downloadUrl?: string;
  failureReason?: string;
}

interface PaymentHistoryResponse {
  success: boolean;
  extensions: PaymentRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  statistics: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    totalAmount: number;
    thisMonth: number;
  };
}

function getPackageStatusVariant(status: string) {
  switch (status) {
    case "active":
      return "default";
    case "expiring":
      return "warning";
    case "expired":
      return "error";
    default:
      return "primary";
  }
}

function getInvoiceStatusVariant(status: string) {
  switch (status) {
    case "success":
      return "default";
    case "failed":
      return "error";
    case "pending":
      return "info";
    default:
      return "default";
  }
}

// Utility function để xác định đơn vị thời gian dựa trên duration
function getPeriodUnit(type: string, duration: number) {
  if (type === "weekly") return "tuần";

  switch (duration) {
    case 1:
      return "tháng";
    case 3:
      return "quý";
    case 6:
      return "nửa năm";
    case 12:
      return "năm";
    default:
      return `${duration} tháng`;
  }
}

export default function UserPaymentsPage() {
  const router = useRouter();

  // State management
  const [currentPackage, setCurrentPackage] =
    React.useState<ServicePackage | null>(null);
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [extensionHistory, setExtensionHistory] = React.useState<any[]>([]);
  const [statistics, setStatistics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [paymentsLoading, setPaymentsLoading] = React.useState(true);
  const [historyLoading, setHistoryLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [methodFilter, setMethodFilter] = React.useState<string>("all");
  const [fromDate, setFromDate] = React.useState<string>("");
  const [toDate, setToDate] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Fetch current package
  const fetchCurrentPackage = React.useCallback(async () => {
    try {
      const response = await api.get("/user/current-package");
      const result = await response.data;

      if (result.success) {
        setCurrentPackage(result.package);
      } else {
        //  toast.error("Không thể tải thông tin gói dịch vụ");
      }
    } catch (error) {
      console.error("Error fetching package:", error);
      toast.error("Lỗi kết nối khi tải gói dịch vụ");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch extension history (replacing payment history)
  const fetchExtensionHistory = React.useCallback(async () => {
    try {
      setHistoryLoading(true);
      const response = await api.get("/user/extension-history");
      const result = await response.data;

      if (result.success) {
        setExtensionHistory(result.extensions);
        setStatistics(result.statistics); // Now get statistics from API
      } else {
        toast.error("Không thể tải lịch sử gia hạn");
      }
    } catch (error) {
      console.error("Error fetching extension history:", error);
      toast.error("Lỗi kết nối khi tải lịch sử gia hạn");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    fetchCurrentPackage();
    fetchExtensionHistory();
  }, [fetchCurrentPackage, fetchExtensionHistory]);

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCurrentPackage(), fetchExtensionHistory()]);
    setRefreshing(false);
    toast.success("Đã cập nhật dữ liệu");
  };

  // Navigation handlers
  const handleRequestCollection = () => {
    router.push("/dashboard/user/request");
  };

  const handleExtend = () => {
    router.push("/dashboard/user/extend-subscription");
  };

  // Download invoice
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      window.open(`/api/invoices/${invoiceId}/download`, "_blank");
      toast.success("Đang tải hóa đơn...");
    } catch (error) {
      toast.error("Không thể tải hóa đơn");
    }
  };

  // Auto-renewal toggle
  const handleToggleAutoRenewal = async () => {
    if (!currentPackage) return;

    try {
      const response = await api.get("/api/user/current-package");

      const result = await response.data;
      if (result.success) {
        setCurrentPackage(result.package);
        toast.success(
          result.package.autoRenewal
            ? "Đã bật gia hạn tự động"
            : "Đã tắt gia hạn tự động"
        );
      }
    } catch (error) {
      toast.error("Không thể cập nhật cài đặt");
    }
  };

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Quản lý gói dịch vụ & thanh toán
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi gói dịch vụ hiện tại và lịch sử thanh toán của bạn
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {/* Current Package & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Package */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gói dịch vụ hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : currentPackage ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-muted-foreground">
                          Tên gói:
                        </span>
                        <span className="font-semibold">
                          {currentPackage.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-muted-foreground">
                          Thời gian:
                        </span>
                        <span className="text-sm">
                          {format(
                            parseISO(currentPackage.startDate),
                            "dd/MM/yyyy",
                            { locale: vi }
                          )}{" "}
                          -{" "}
                          {format(
                            parseISO(currentPackage.endDate),
                            "dd/MM/yyyy",
                            { locale: vi }
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-muted-foreground">
                          Trạng thái:
                        </span>
                        <Badge
                          variant={getPackageStatusVariant(
                            currentPackage.status
                          )}
                        >
                          {currentPackage.status === "active" &&
                            "✅ Đang hoạt động"}
                          {currentPackage.status === "expiring" &&
                            "⚠️ Sắp hết hạn"}
                          {currentPackage.status === "expired" && "❌ Hết hạn"}
                        </Badge>
                        {currentPackage.isExpiringSoon && (
                          <Badge variant="warning">
                            <Clock className="h-3 w-3 mr-1" />
                            {currentPackage.daysLeft} ngày
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-muted-foreground">
                          Phí định kỳ:
                        </span>
                        <span className="font-semibold text-green-600">
                          {currentPackage.fee.toLocaleString("vi-VN")}đ/
                          {getPeriodUnit(
                            currentPackage.type,
                            currentPackage.duration
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-muted-foreground">
                          Khu vực:
                        </span>
                        <span className="text-sm">{currentPackage.area}</span>
                      </div>

                      <div className="space-y-2">
                        <span className="font-medium text-sm text-muted-foreground">
                          Tiến độ sử dụng:
                        </span>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>
                              {currentPackage.collectionsUsed || 0}/
                              {currentPackage.collectionsTotal || 0} lần thu gom
                            </span>
                            <span>
                              {currentPackage.collectionsTotal &&
                              currentPackage.collectionsTotal > 0
                                ? Math.round(
                                    ((currentPackage.collectionsUsed || 0) /
                                      currentPackage.collectionsTotal) *
                                      100
                                  )
                                : 0}
                              %
                            </span>
                          </div>
                          <Progress
                            value={Math.min(
                              100,
                              Math.max(
                                0,
                                currentPackage.collectionsTotal &&
                                  currentPackage.collectionsTotal > 0
                                  ? ((currentPackage.collectionsUsed || 0) /
                                      currentPackage.collectionsTotal) *
                                      100
                                  : 0
                              )
                            )}
                            className="h-2"
                          />
                        </div>
                      </div>

                      {currentPackage.nextCollection && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-muted-foreground">
                            Thu gom tiếp theo:
                          </span>
                          <span className="text-sm font-medium text-blue-600">
                            {format(
                              parseISO(currentPackage.nextCollection),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Package Features */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      Quyền lợi gói dịch vụ:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentPackage.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Chưa có gói dịch vụ nào
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-wrap gap-3">
              {currentPackage?.status === "expired" ? (
                <Button onClick={handleExtend} className="flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Mua gói mới
                </Button>
              ) : (
                <Button
                  onClick={handleExtend}
                  //disabled={!currentPackage.canRenew}
                  variant={
                    currentPackage?.isExpiringSoon ? "default" : "secondary"
                  }
                  className="flex-1"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Gia hạn
                </Button>
              )}

              {currentPackage?.status !== "expired" && (
                <Button variant="outline" onClick={handleRequestCollection}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Yêu cầu thu gom gấp
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleAutoRenewal}
                className="flex items-center gap-2"
              >
                {currentPackage?.autoRenewal
                  ? "🔄 Tắt tự động gia hạn"
                  : "⏸️ Bật tự động gia hạn"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Thống kê
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ) : statistics ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {statistics.totalAmount.toLocaleString("vi-VN")}đ
                  </div>
                  <div className="text-sm text-green-700">
                    Tổng đã thanh toán
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-semibold text-blue-600">
                      {statistics.successful}
                    </div>
                    <div className="text-xs text-blue-700">Thành công</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded">
                    <div className="text-lg font-semibold text-red-600">
                      {statistics.failed}
                    </div>
                    <div className="text-xs text-red-700">Thất bại</div>
                  </div>
                </div>

                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="text-lg font-semibold text-orange-600">
                    {statistics.thisMonth}
                  </div>
                  <div className="text-xs text-orange-700">
                    Thanh toán tháng này
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Không có dữ liệu thống kê
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Lịch sử gia hạn
            </CardTitle>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                  <SelectItem value="pending">Đang xử lý</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="QR">QR Code</SelectItem>
                  <SelectItem value="VNPay">VNPay</SelectItem>
                  <SelectItem value="Momo">Momo</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setMethodFilter("all");
                  setFromDate("");
                  setToDate("");
                  setCurrentPage(1);
                }}
              >
                <Filter className="h-4 w-4 mr-1" />
                Xóa bộ lọc
              </Button>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="fromDate" className="text-sm">
                Từ ngày:
              </Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="toDate" className="text-sm">
                Đến ngày:
              </Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchExtensionHistory()}
              disabled={historyLoading}
            >
              <Search className="h-4 w-4 mr-1" />
              Tìm kiếm
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table showCardViewOn="mobile">
            <TableHeader>
              <TableRow>
                <TableHead>Gói dịch vụ</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Ngày thanh toán</TableHead>
                <TableHead>Hạn sử dụng</TableHead>
                <TableHead>Phương thức thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyLoading ? (
                // Loading skeleton
                [...Array(3)].map((_, index) => (
                  <TableRow key={index} labels={["Gói dịch vụ", "Giá", "Ngày thanh toán", "Hạn sử dụng", "Phương thức thanh toán", "Trạng thái"]}>
                    <TableCell label="Gói dịch vụ">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell label="Giá">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell label="Ngày thanh toán">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell label="Hạn sử dụng">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell label="Phương thức thanh toán" hideOnMobile>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell label="Trạng thái" hideOnMobile>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    </TableRow>
                  ))
                ) : extensionHistory.length > 0 ? (
                  extensionHistory.map((extension) => (
                    <TableRow key={extension.id} labels={["Gói dịch vụ", "Giá", "Ngày thanh toán", "Hạn sử dụng", "Phương thức thanh toán", "Trạng thái"]} expandable>
                      <TableCell label="Gói dịch vụ" className="font-medium" priority="high">
                        {extension.packageName}
                      </TableCell>
                      <TableCell label="Giá" className="font-semibold text-green-600" priority="high">
                        {extension.price.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell label="Ngày thanh toán" priority="medium">
                        {format(
                          parseISO(extension.paymentDate),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </TableCell>
                      <TableCell label="Hạn sử dụng" priority="medium">
                        {format(parseISO(extension.expiryDate), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </TableCell>
                      <TableCell label="Phương thức thanh toán" hideOnMobile priority="low">
                        <Badge variant="default">
                          {extension.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell label="Trạng thái" hideOnMobile priority="low">
                        <Badge
                          variant={
                            extension.status === "completed"
                              ? "success"
                              : "warning"
                          }
                        >
                          {extension.status === "completed"
                            ? "✅ Hoàn thành"
                            : "⏳ Đang xử lý"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Chưa có lịch sử gia hạn nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
