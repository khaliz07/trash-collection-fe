"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveTable as Table,
  ResponsiveTableBody as TableBody,
  ResponsiveTableCell as TableCell,
  ResponsiveTableHead as TableHead,
  ResponsiveTableHeader as TableHeader,
  ResponsiveTableRow as TableRow,
} from "@/components/ui/responsive-table";
import {
  MobileDashboard,
  StatsGrid,
  StatCard,
  MobileFilters,
} from "@/components/ui/mobile-dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Ban,
  UserX,
  CheckCircle,
  Users,
  UserCheck,
  UserPlus,
  Activity,
} from "lucide-react";
import { AddUserDialog } from "@/components/dashboard/add-user-dialog";
import { useTranslation } from "react-i18next";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation("common");

  // Mock user data
  const users = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      email: "an.nguyen@example.com",
      phone: "+84 912 345 678",
      address: "12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
      joinDate: "15/04/2025",
      status: "active",
      plan: "Monthly",
    },
    {
      id: 2,
      name: "Trần Thị Bích",
      email: "bich.tran@example.com",
      phone: "+84 913 456 789",
      address: "45 Lê Lợi, Quận Hải Châu, Đà Nẵng",
      joinDate: "12/04/2025",
      status: "active",
      plan: "Yearly",
    },
    {
      id: 3,
      name: "Lê Quang Dũng",
      email: "dung.le@example.com",
      phone: "+84 914 567 890",
      address: "78 Phan Đình Phùng, Ba Đình, Hà Nội",
      joinDate: "10/04/2025",
      status: "suspended",
      plan: "Monthly",
    },
    {
      id: 4,
      name: "Phạm Minh Châu",
      email: "chau.pham@example.com",
      phone: "+84 915 678 901",
      address: "23 Trần Hưng Đạo, TP. Nha Trang",
      joinDate: "08/04/2025",
      status: "active",
      plan: "Quarterly",
    },
    {
      id: 5,
      name: "Võ Thị Hạnh",
      email: "hanh.vo@example.com",
      phone: "+84 916 789 012",
      address: "56 Nguyễn Huệ, TP. Huế",
      joinDate: "05/04/2025",
      status: "inactive",
      plan: "Monthly",
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery) ||
      user.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-emerald-600 dark:text-emerald-400";
      case "suspended":
        return "text-amber-600 dark:text-amber-400";
      case "inactive":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t("user_status.active", "Đang hoạt động");
      case "suspended":
        return t("user_status.suspended", "Tạm khóa");
      case "inactive":
        return t("user_status.inactive", "Ngừng hoạt động");
      default:
        return t("user_status.unknown", "Không xác định");
    }
  };

  const planLabel = (plan: string) => {
    switch (plan) {
      case "Monthly":
        return t("user_plan.monthly", "Hàng tháng");
      case "Quarterly":
        return t("user_plan.quarterly", "Hàng quý");
      case "Yearly":
        return t("user_plan.yearly", "Hàng năm");
      default:
        return plan;
    }
  };
  // Calculate stats
  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter(
    (user: any) => user.status === "active"
  ).length;
  const newUsers = filteredUsers.filter((user: any) => {
    const joinDate = new Date(user.joinDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return joinDate >= thirtyDaysAgo;
  }).length;
  const premiumUsers = filteredUsers.filter(
    (user: any) => user.plan === "Premium"
  ).length;

  return (
    <MobileDashboard>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("admin_users.title", "Quản lý người dùng")}
        </h2>
        <p className="text-muted-foreground">
          {t("admin_users.desc", "Quản lý tài khoản và phân quyền hộ dân")}
        </p>
      </div>

      {/* Stats */}
      <StatsGrid columns={4}>
        <StatCard
          title="Tổng người dùng"
          value={totalUsers}
          icon={<Users className="h-5 w-5" />}
          compact
        />
        <StatCard
          title="Đang hoạt động"
          value={activeUsers}
          icon={<UserCheck className="h-5 w-5" />}
          compact
        />
        <StatCard
          title="Người dùng mới"
          value={newUsers}
          subtitle="30 ngày qua"
          icon={<UserPlus className="h-5 w-5" />}
          compact
        />
        <StatCard
          title="Gói Premium"
          value={premiumUsers}
          icon={<Activity className="h-5 w-5" />}
          compact
        />
      </StatsGrid>

      {/* Actions */}
      <div className="flex justify-end">
        <AddUserDialog />
      </div>

      {/* Search and Filters */}
      <MobileFilters
        searchPlaceholder={t(
          "admin_users.search_placeholder",
          "Tìm kiếm người dùng..."
        )}
        onSearch={setSearchQuery}
      >
        <div className="space-y-4">
          <Button variant="outline" className="w-full">
            {t("admin_users.filter", "Lọc theo trạng thái")}
          </Button>
        </div>
      </MobileFilters>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("admin_users.card_title", "Quản lý người dùng")}
          </CardTitle>
          <CardDescription>
            {t(
              "admin_users.card_desc",
              "Xem và quản lý tất cả hộ dân đã đăng ký trong hệ thống"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table showCardViewOn="mobile">
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("admin_users.table.user", "Người dùng")}
                </TableHead>
                <TableHead>
                  {t("admin_users.table.contact", "Liên hệ")}
                </TableHead>
                <TableHead>
                  {t("admin_users.table.address", "Địa chỉ")}
                </TableHead>
                <TableHead>
                  {t("admin_users.table.join_date", "Ngày tham gia")}
                </TableHead>
                <TableHead>
                  {t("admin_users.table.status", "Trạng thái")}
                </TableHead>
                <TableHead>{t("admin_users.table.plan", "Gói")}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  labels={[
                    "Người dùng",
                    "Liên hệ",
                    "Địa chỉ",
                    "Ngày tham gia",
                    "Trạng thái",
                    "Gói",
                    "Hành động",
                  ]}
                  expandable
                >
                  <TableCell label="Người dùng" priority="high">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {t("admin_users.table.id", "Mã")}:{" "}
                        {String(user.id).padStart(5, "0")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell label="Liên hệ" priority="medium">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {user.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell label="Địa chỉ" priority="low" hideOnMobile>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-1 h-3 w-3" />
                      {user.address}
                    </div>
                  </TableCell>
                  <TableCell label="Ngày tham gia" priority="low" hideOnMobile>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-1 h-3 w-3" />
                      {user.joinDate}
                    </div>
                  </TableCell>
                  <TableCell label="Trạng thái" priority="high">
                    <div
                      className={`flex items-center text-sm capitalize ${getStatusColor(
                        user.status
                      )}`}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {statusLabel(user.status)}
                    </div>
                  </TableCell>
                  <TableCell label="Gói" priority="medium">
                    <div className="text-sm">{planLabel(user.plan)}</div>
                  </TableCell>
                  <TableCell label="Hành động" priority="low">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Shield className="mr-2 h-4 w-4" />
                          {t("admin_users.action.change_role", "Đổi vai trò")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Ban className="mr-2 h-4 w-4" />
                          {t(
                            "admin_users.action.suspend",
                            "Tạm khóa tài khoản"
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <UserX className="mr-2 h-4 w-4" />
                          {t("admin_users.action.delete", "Xóa tài khoản")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MobileDashboard>
  );
}
