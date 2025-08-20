"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
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
} from "@/components/ui/mobile-dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RotateCcw,
} from "lucide-react";
import { AddUserDialog } from "@/components/dashboard/add-user-dialog";
import { useTranslation } from "react-i18next";
import { usersApi, User } from "@/apis/admin-users.api";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoadingUserId, setActionLoadingUserId] = useState<string | null>(
    null
  );
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, statusFilter]);

  // Fetch users data
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "admin-users",
      { page, search: debouncedSearchQuery, status: statusFilter },
    ],
    queryFn: () =>
      usersApi.getUsers({
        page,
        limit: 10,
        search: debouncedSearchQuery,
        status: statusFilter,
      }),
    staleTime: 300000, // 5 minutes
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: (userId: string) => usersApi.suspendUser(userId),
    onMutate: (userId: string) => {
      setActionLoadingUserId(userId);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setActionLoadingUserId(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Lỗi khi tạm khóa tài khoản"
      );
      setActionLoadingUserId(null);
    },
  });

  // Activate user mutation
  const activateUserMutation = useMutation({
    mutationFn: (userId: string) => usersApi.activateUser(userId),
    onMutate: (userId: string) => {
      setActionLoadingUserId(userId);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setActionLoadingUserId(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Lỗi khi kích hoạt tài khoản"
      );
      setActionLoadingUserId(null);
    },
  });

  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

  // Handle loading and error states
  if (isLoading) {
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
      </MobileDashboard>
    );
  }

  if (error) {
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-destructive">
                <p className="mb-2">Lỗi khi tải dữ liệu người dùng</p>
                <Button
                  variant="outline"
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ["admin-users"] })
                  }
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </MobileDashboard>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-emerald-600 dark:text-emerald-400";
      case "SUSPENDED":
        return "text-amber-600 dark:text-amber-400";
      case "INACTIVE":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return t("user_status.active", "Đang hoạt động");
      case "SUSPENDED":
        return t("user_status.suspended", "Tạm khóa");
      case "INACTIVE":
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

  // Handle user action
  const handleUserAction = async (userId: string, action: string) => {
    switch (action) {
      case "suspend":
        suspendUserMutation.mutate(userId);
        break;
      case "activate":
        activateUserMutation.mutate(userId);
        break;
      default:
        break;
    }
  };

  // Calculate stats
  const totalUsers = pagination?.total || 0;
  const activeUsers = users.filter((user) => user.status === "ACTIVE").length;
  const newUsers = users.filter((user) => {
    const joinDate = new Date(user.joinDate.split("/").reverse().join("-"));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return joinDate >= thirtyDaysAgo;
  }).length;
  const premiumUsers = users.filter(
    (user) => user.planType && user.planType !== "NONE"
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
          title="Có gói dịch vụ"
          value={premiumUsers}
          icon={<Activity className="h-5 w-5" />}
          compact
        />
      </StatsGrid>

      {/* Actions */}
      {/* <div className="flex justify-end">
        <AddUserDialog />
      </div> */}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t(
              "admin_users.search_placeholder",
              "Tìm kiếm người dùng..."
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter || "ALL"}
            onValueChange={(value) =>
              setStatusFilter(value === "ALL" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
              <SelectItem value="SUSPENDED">Tạm khóa</SelectItem>
              <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filter */}
        {statusFilter && (
          <Button
            variant="outline"
            onClick={() => setStatusFilter("")}
            className="whitespace-nowrap h-10"
            title="Xóa bộ lọc trạng thái"
          >
            ✕ Xóa bộ lọc
          </Button>
        )}
      </div>

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
              {users.map((user) => (
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
                        {user.id.slice(-8).toUpperCase()}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={
                            suspendUserMutation.isPending ||
                            activateUserMutation.isPending
                          }
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.status === "ACTIVE" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                {t(
                                  "admin_users.action.suspend",
                                  "Tạm khóa tài khoản"
                                )}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Xác nhận tạm khóa tài khoản
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn tạm khóa tài khoản của{" "}
                                  <strong>{user.name}</strong>? Người dùng sẽ
                                  không thể đăng nhập vào hệ thống.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleUserAction(user.id, "suspend")
                                  }
                                  className="bg-destructive hover:bg-destructive/90"
                                  disabled={actionLoadingUserId === user.id}
                                >
                                  {actionLoadingUserId === user.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    "Tạm khóa"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {user.status === "SUSPENDED" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {t(
                                  "admin_users.action.activate",
                                  "Kích hoạt lại"
                                )}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Xác nhận kích hoạt lại tài khoản
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn kích hoạt lại tài khoản
                                  của <strong>{user.name}</strong>? Người dùng
                                  sẽ có thể đăng nhập trở lại.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleUserAction(user.id, "activate")
                                  }
                                  disabled={actionLoadingUserId === user.id}
                                >
                                  {actionLoadingUserId === user.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    "Kích hoạt"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                trong tổng số {pagination.total} người dùng
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
    </MobileDashboard>
  );
}
