"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveTable as Table,
  ResponsiveTableBody as TableBody,
  ResponsiveTableCell as TableCell,
  ResponsiveTableHead as TableHead,
  ResponsiveTableHeader as TableHeader,
  ResponsiveTableRow as TableRow,
} from "@/components/ui/responsive-table";
import {
  Search,
  Calendar,
  MapPin,
  Package,
  DollarSign,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { paymentsApi, Payment } from "@/apis/admin-payments.api";

export function UserPaymentsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [packageFilter, setPackageFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const { t } = useTranslation("common");

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearchQuery,
    statusFilter,
    methodFilter,
    packageFilter,
    provinceFilter,
    districtFilter,
    wardFilter,
    startDate,
    endDate,
  ]);

  // Fetch payments data
  const {
    data: paymentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "admin-payments",
      {
        page,
        search: debouncedSearchQuery,
        status: statusFilter,
        paymentMethod: methodFilter,
        packageId: packageFilter,
        province: provinceFilter,
        district: districtFilter,
        ward: wardFilter,
        startDate,
        endDate,
      },
    ],
    queryFn: () =>
      paymentsApi.getPayments({
        page,
        limit: 10,
        search: debouncedSearchQuery,
        status: statusFilter,
        paymentMethod: methodFilter,
        packageId: packageFilter,
        province: provinceFilter,
        district: districtFilter,
        ward: wardFilter,
        startDate,
        endDate,
      }),
    staleTime: 300000, // 5 minutes
  });

  // Fetch provinces for address filter
  const { data: provinces } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => paymentsApi.getProvinces(),
    staleTime: 1800000, // 30 minutes
  });

  // Fetch districts when province changes
  const { data: districts } = useQuery({
    queryKey: ["districts", provinceFilter],
    queryFn: () => paymentsApi.getDistricts(provinceFilter),
    enabled: !!provinceFilter,
    staleTime: 1800000,
  });

  // Fetch wards when district changes
  const { data: wards } = useQuery({
    queryKey: ["wards", districtFilter],
    queryFn: () => paymentsApi.getWards(districtFilter),
    enabled: !!districtFilter,
    staleTime: 1800000,
  });

  // Fetch packages for filter
  const { data: packages } = useQuery({
    queryKey: ["packages"],
    queryFn: () => paymentsApi.getPackages(),
    staleTime: 1800000,
  });

  const payments = paymentsData?.payments || [];
  const pagination = paymentsData?.pagination;

  // Handle loading and error states
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-destructive">
              <p className="mb-2">Lỗi khi tải dữ liệu thanh toán</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "REFUNDED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Hoàn thành";
      case "PENDING":
        return "Đang xử lý";
      case "FAILED":
        return "Thất bại";
      case "REFUNDED":
        return "Đã hoàn tiền";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "CASH":
        return "Tiền mặt";
      case "CARD":
        return "Thẻ tín dụng";
      case "BANK_TRANSFER":
        return "Chuyển khoản";
      case "E_WALLET":
        return "Ví điện tử";
      case "VNPAY":
        return "VNPay";
      case "STRIPE":
        return "Stripe";
      default:
        return method;
    }
  };

  const clearFilters = () => {
    setStatusFilter("");
    setMethodFilter("");
    setPackageFilter("");
    setProvinceFilter("");
    setDistrictFilter("");
    setWardFilter("");
    setStartDate("");
    setEndDate("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc và tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and basic filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm giao dịch, người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter || "ALL"}
              onValueChange={(value) =>
                setStatusFilter(value === "ALL" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="PENDING">Đang xử lý</SelectItem>
                <SelectItem value="FAILED">Thất bại</SelectItem>
                <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Method Filter */}
            <Select
              value={methodFilter || "ALL"}
              onValueChange={(value) =>
                setMethodFilter(value === "ALL" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả phương thức</SelectItem>
                <SelectItem value="CASH">Tiền mặt</SelectItem>
                <SelectItem value="CARD">Thẻ tín dụng</SelectItem>
                <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                <SelectItem value="E_WALLET">Ví điện tử</SelectItem>
                <SelectItem value="VNPAY">VNPay</SelectItem>
                <SelectItem value="STRIPE">Stripe</SelectItem>
              </SelectContent>
            </Select>

            {/* Package Filter */}
            <Select
              value={packageFilter || "ALL"}
              onValueChange={(value) =>
                setPackageFilter(value === "ALL" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Gói dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả gói</SelectItem>
                {packages?.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range and address filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Từ ngày"
              />
              <span className="text-muted-foreground">đến</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Đến ngày"
              />
            </div>

            {/* Province */}
            <Select
              value={provinceFilter || "ALL"}
              onValueChange={(value) => {
                setProvinceFilter(value === "ALL" ? "" : value);
                setDistrictFilter("");
                setWardFilter("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tỉnh/TP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả tỉnh/TP</SelectItem>
                {provinces?.map((province) => (
                  <SelectItem
                    key={province.province_id}
                    value={province.province_name}
                  >
                    {province.province_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* District */}
            <Select
              value={districtFilter || "ALL"}
              onValueChange={(value) => {
                setDistrictFilter(value === "ALL" ? "" : value);
                setWardFilter("");
              }}
              disabled={!provinceFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Quận/Huyện" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả quận/huyện</SelectItem>
                {districts?.map((district) => (
                  <SelectItem
                    key={district.district_id}
                    value={district.district_name}
                  >
                    {district.district_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ward */}
            <Select
              value={wardFilter || "ALL"}
              onValueChange={(value) =>
                setWardFilter(value === "ALL" ? "" : value)
              }
              disabled={!districtFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Phường/Xã" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả phường/xã</SelectItem>
                {wards?.map((ward) => (
                  <SelectItem key={ward.ward_id} value={ward.ward_name}>
                    {ward.ward_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Thanh toán hộ dân</CardTitle>
          <CardDescription>
            Quản lý và theo dõi các giao dịch thanh toán của hộ dân
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Table showCardViewOn="mobile">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã giao dịch</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Gói dịch vụ</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    labels={[
                      "Mã giao dịch",
                      "Khách hàng",
                      "Gói dịch vụ",
                      "Số tiền",
                      "Phương thức",
                      "Trạng thái",
                      "Thời gian",
                    ]}
                    expandable
                  >
                    <TableCell label="Mã giao dịch" priority="medium">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-mono text-sm max-w-[100px] truncate cursor-help">
                            {payment.transactionId ||
                              payment.id.slice(-8).toUpperCase()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono">
                            {payment.transactionId ||
                              payment.id.slice(-8).toUpperCase()}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell label="Khách hàng" priority="high">
                      <div>
                        <div className="font-medium">{payment.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.user.email}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {payment.user.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell label="Gói dịch vụ" priority="medium">
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <div>
                          <div className="font-medium">
                            {payment.package.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payment.package.type}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell label="Số tiền" priority="high">
                      <div className="flex items-center font-medium">
                        {formatCurrency(Number(payment.amount))}
                      </div>
                    </TableCell>
                    <TableCell label="Phương thức" priority="medium">
                      <Badge variant="default">
                        {getMethodLabel(payment.paymentMethod)}
                      </Badge>
                    </TableCell>
                    <TableCell label="Trạng thái" priority="high">
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusLabel(payment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell label="Thời gian" priority="low" hideOnMobile>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(payment.paidAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                trong tổng số {pagination.total} giao dịch
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Trước
                </Button>
                <div className="text-sm">
                  Trang {pagination.page} / {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Tiếp
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
