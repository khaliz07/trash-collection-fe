"use client";

import { useState } from "react";
import {
  MobileDashboard,
  StatsGrid,
  StatCard,
  CollapsibleSection,
  QuickActions,
  MobileFilters,
} from "@/components/ui/mobile-dashboard";
import {
  ResponsiveTable as Table,
  ResponsiveTableBody as TableBody,
  ResponsiveTableCell as TableCell,
  ResponsiveTableHead as TableHead,
  ResponsiveTableHeader as TableHeader,
  ResponsiveTableRow as TableRow,
} from "@/components/ui/responsive-table";
import {
  ResponsiveMapContainer,
  MapInfoPanel,
  LocationList,
} from "@/components/ui/responsive-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Filter,
  Download,
  RefreshCw,
  Navigation,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// Mock data
const mockPayments = [
  {
    id: "1",
    packageName: "Gói gia đình",
    price: 150000,
    paymentDate: "2024-01-15T10:30:00Z",
    expiryDate: "2024-04-15T00:00:00Z",
    paymentMethod: "Chuyển khoản",
    status: "completed",
  },
  {
    id: "2",
    packageName: "Gói tiết kiệm",
    price: 100000,
    paymentDate: "2023-12-10T14:20:00Z",
    expiryDate: "2024-03-10T00:00:00Z",
    paymentMethod: "Tiền mặt",
    status: "completed",
  },
  {
    id: "3",
    packageName: "Gói premium",
    price: 250000,
    paymentDate: "2024-02-01T09:15:00Z",
    expiryDate: "2024-05-01T00:00:00Z",
    paymentMethod: "Thẻ tín dụng",
    status: "pending",
  },
];

const mockLocations = [
  {
    id: "1",
    name: "Điểm thu gom 1",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    status: "completed",
    distance: "2.3km",
    time: "15 phút",
  },
  {
    id: "2",
    name: "Điểm thu gom 2",
    address: "456 Đường XYZ, Quận 2, TP.HCM",
    status: "pending",
    distance: "3.7km",
    time: "25 phút",
  },
  {
    id: "3",
    name: "Điểm thu gom 3",
    address: "789 Đường DEF, Quận 3, TP.HCM",
    status: "skipped",
    distance: "1.8km",
    time: "12 phút",
  },
];

export default function ResponsiveDemo() {
  const [currentView, setCurrentView] = useState<"grid" | "list">("list");
  const [searchTerm, setSearchTerm] = useState("");

  const quickActions = [
    {
      label: "Tải xuống",
      icon: <Download className="h-4 w-4" />,
      onClick: () => toast.success("Đang tải xuống..."),
      variant: "default" as const,
    },
    {
      label: "Làm mới",
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: () => toast.success("Đã làm mới dữ liệu"),
      variant: "outline" as const,
    },
    {
      label: "Xuất báo cáo",
      icon: <Filter className="h-4 w-4" />,
      onClick: () => toast.info("Đang xuất báo cáo..."),
      variant: "secondary" as const,
    },
    {
      label: "Hành động khác 1",
      icon: <Star className="h-4 w-4" />,
      onClick: () => toast.info("Hành động 1"),
      variant: "outline" as const,
    },
    {
      label: "Hành động khác 2",
      icon: <AlertTriangle className="h-4 w-4" />,
      onClick: () => toast.info("Hành động 2"),
      variant: "destructive" as const,
    },
  ];

  const handleLocationSelect = (locationId: string) => {
    const location = mockLocations.find((l) => l.id === locationId);
    toast.success(`Đã chọn: ${location?.name}`);
  };

  return (
    <MobileDashboard>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Demo Responsive Design</h1>
        <p className="text-muted-foreground">
          Thử nghiệm các component responsive cho mobile
        </p>
      </div>

      {/* Stats Grid */}
      <CollapsibleSection title="Thống kê tổng quan" badge="4">
        <StatsGrid columns={4}>
          <StatCard
            title="Tổng thanh toán"
            value="3"
            subtitle="trong tháng"
            icon={<Home className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
            compact
          />
          <StatCard
            title="Điểm thu gom"
            value="15"
            subtitle="hoạt động"
            icon={<MapPin className="h-5 w-5" />}
            trend={{ value: 5, isPositive: false }}
            compact
          />
          <StatCard
            title="Hoàn thành"
            value="12"
            subtitle="hôm nay"
            icon={<CheckCircle className="h-5 w-5" />}
            compact
          />
          <StatCard
            title="Đang chờ"
            value="3"
            subtitle="cần xử lý"
            icon={<Clock className="h-5 w-5" />}
            compact
          />
        </StatsGrid>
      </CollapsibleSection>

      {/* Quick Actions */}
      <CollapsibleSection title="Thao tác nhanh">
        <QuickActions actions={quickActions} />
      </CollapsibleSection>

      {/* Filters */}
      <CollapsibleSection title="Bộ lọc và tìm kiếm" defaultOpen={false}>
        <MobileFilters
          searchPlaceholder="Tìm kiếm thanh toán..."
          onSearch={setSearchTerm}
          showViewToggle
          currentView={currentView}
          onViewChange={setCurrentView}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="pending">Đang chờ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="method">Phương thức thanh toán</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="bank">Chuyển khoản</SelectItem>
                  <SelectItem value="cash">Tiền mặt</SelectItem>
                  <SelectItem value="card">Thẻ tín dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full">Áp dụng bộ lọc</Button>
          </div>
        </MobileFilters>
      </CollapsibleSection>

      {/* Responsive Table */}
      <CollapsibleSection
        title="Bảng dữ liệu responsive"
        badge={mockPayments.length}
      >
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <Table showCardViewOn="mobile">
              <TableHeader>
                <TableRow>
                  <TableHead>Gói dịch vụ</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Ngày thanh toán</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    labels={[
                      "Gói dịch vụ",
                      "Giá",
                      "Ngày thanh toán",
                      "Phương thức",
                      "Trạng thái",
                    ]}
                    expandable
                  >
                    <TableCell
                      label="Gói dịch vụ"
                      priority="high"
                      className="font-medium"
                    >
                      {payment.packageName}
                    </TableCell>
                    <TableCell
                      label="Giá"
                      priority="high"
                      className="font-semibold text-green-600"
                    >
                      {payment.price.toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell label="Ngày thanh toán" priority="medium">
                      {new Date(payment.paymentDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </TableCell>
                    <TableCell label="Phương thức" priority="low" hideOnMobile>
                      <Badge variant="default">{payment.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell label="Trạng thái" priority="medium">
                      <Badge
                        variant={
                          payment.status === "completed" ? "success" : "warning"
                        }
                      >
                        {payment.status === "completed"
                          ? "✅ Hoàn thành"
                          : "⏳ Đang xử lý"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CollapsibleSection>

      {/* Responsive Map */}
      <CollapsibleSection title="Bản đồ responsive">
        <ResponsiveMapContainer
          height="400px"
          showControls
          allowFullscreen
          showLocationButton
          showLayersButton
          onLocationRequest={() => toast.info("Đang tìm vị trí của bạn...")}
          onLayerToggle={() => toast.info("Đã chuyển lớp bản đồ")}
          onReset={() => toast.info("Đã đặt lại bản đồ")}
          onZoomIn={() => toast.info("Phóng to")}
          onZoomOut={() => toast.info("Thu nhỏ")}
        >
          {/* Mock map content */}
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center relative">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Bản đồ thu gom rác
              </h3>
              <p className="text-gray-500">
                {mockLocations.length} điểm thu gom
              </p>
            </div>

            {/* Mock location pins */}
            <div className="absolute top-16 left-16 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute top-32 right-20 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute bottom-24 left-24 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-lg"></div>
          </div>
        </ResponsiveMapContainer>
      </CollapsibleSection>

      {/* Location List */}
      <CollapsibleSection
        title="Danh sách địa điểm"
        badge={mockLocations.length}
        defaultOpen={false}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Các điểm thu gom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LocationList
              locations={mockLocations}
              onLocationSelect={handleLocationSelect}
            />
          </CardContent>
        </Card>
      </CollapsibleSection>

      {/* Map Info Panel Demo */}
      <CollapsibleSection title="Map Info Panel" defaultOpen={false}>
        <div className="space-y-4">
          <MapInfoPanel title="Thông tin điểm thu gom">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Điểm thu gom số 1</h4>
                <p className="text-sm text-muted-foreground">
                  123 Đường ABC, Quận 1
                </p>
              </div>
              <div className="flex justify-between text-sm">
                <span>Khoảng cách:</span>
                <span className="font-medium">2.3km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Thời gian:</span>
                <span className="font-medium">15 phút</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trạng thái:</span>
                <Badge variant="success">Hoàn thành</Badge>
              </div>
              <Button size="sm" className="w-full">
                <Navigation className="h-4 w-4 mr-2" />
                Chỉ đường
              </Button>
            </div>
          </MapInfoPanel>
        </div>
      </CollapsibleSection>
    </MobileDashboard>
  );
}
