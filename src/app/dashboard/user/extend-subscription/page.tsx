"use client";

import { QRPaymentDialog } from "@/components/payments/QRPaymentDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserSwitcher } from "@/components/user-switcher";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, CheckCircle, Loader2, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const paymentMethods = [
  { id: "momo", name: "Ví MoMo" },
  { id: "zalopay", name: "ZaloPay" },
  { id: "bank", name: "Chuyển khoản ngân hàng" },
  { id: "credit", name: "Thẻ tín dụng/Ghi nợ" },
];

export default function ExtendSubscriptionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<any>(null);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [extensionHistory, setExtensionHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const summaryRef = useRef<HTMLDivElement>(null);

  const selectedPkg = availablePackages.find((p) => p.id === selected);

  // Fetch current package info
  useEffect(() => {
    const fetchCurrentPackage = async () => {
      try {
        const response = await api.get("/user/current-package");
        const result = await response.data;

        if (result.success) {
          setCurrentPackage(result.package);
        } else {
          toast.error("Không thể tải thông tin gói hiện tại");
        }
      } catch (error) {
        console.error("Error fetching current package:", error);
        toast.error("Lỗi kết nối khi tải thông tin gói");
      } finally {
        setLoading(false);
      }
    };

    const fetchAvailablePackages = async () => {
      try {
        const response = await api.get("/user/extension-packages");
        const result = await response.data;

        if (result.success) {
          setAvailablePackages(result.packages);
        } else {
          toast.error("Không thể tải danh sách gói gia hạn");
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast.error("Lỗi kết nối khi tải danh sách gói");
      } finally {
        setPackagesLoading(false);
      }
    };

    const fetchExtensionHistory = async () => {
      try {
        const response = await api.get("/user/extension-history");
        const result = await response.data;

        if (result.success) {
          setExtensionHistory(result.extensions);
        } else {
          toast.error("Không thể tải lịch sử gia hạn");
        }
      } catch (error) {
        console.error("Error fetching extension history:", error);
        toast.error("Lỗi kết nối khi tải lịch sử gia hạn");
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchCurrentPackage();
    fetchAvailablePackages();
    fetchExtensionHistory();
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => {
      if (summaryRef.current) {
        summaryRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const handlePay = () => {
    if (
      payMethod === "momo" ||
      payMethod === "zalopay" ||
      payMethod === "bank"
    ) {
      // Use QR payment for electronic methods
      setShowQRDialog(true);
    } else {
      // Credit card payment - also use database
      setConfirm(true);
      setTimeout(async () => {
        setConfirm(false);
        await handlePaymentSuccess(`credit-${Date.now()}`);
      }, 1500);
    }
  };

  const handlePaymentSuccess = async (transactionId?: string) => {
    if (!selectedPkg || !payMethod) {
      toast.error("Thông tin thanh toán không đầy đủ");
      return;
    }

    try {
      // Get duration in months from selectedPkg.id
      // Call extend-subscription API with packageId from database
      const response = await api.post("/user/extend-subscription", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: selectedPkg.id, // This is now the actual packageId from database
          duration: selectedPkg.duration, // Duration from package
          price: selectedPkg.final,
          paymentMethod: payMethod,
          transactionId: transactionId || `ext-${Date.now()}`,
        }),
      });

      const result = await response.data;

      if (result.success) {
        setShowQRDialog(false);
        setSuccess(true);
        toast.success(
          `Gia hạn thành công! Dịch vụ được gia hạn ${
            selectedPkg?.duration || ""
          } tháng.`
        );

        // Refresh current package info
        const refreshResponse = await fetch("/api/user/current-package");
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          setCurrentPackage(refreshResult.package);
        }

        // Refresh extension history
        const historyResponse = await fetch("/api/user/extension-history");
        const historyResult = await historyResponse.json();
        if (historyResult.success) {
          setExtensionHistory(historyResult.extensions);
        }
      } else {
        setShowQRDialog(false);
        toast.error(result.error || "Lỗi khi gia hạn dịch vụ");
      }
    } catch (error) {
      console.error("Error extending subscription:", error);
      setShowQRDialog(false);
      toast.error("Lỗi kết nối khi gia hạn dịch vụ");
    }
  };

  const handlePaymentFailure = () => {
    setShowQRDialog(false);
    toast.error("Thanh toán thất bại. Vui lòng thử lại.");
  };

  return (
    <div className="container max-w-full py-8">
      {/* User Switcher for Demo */}

      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Gia hạn dịch vụ</h1>
      </div>
      <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
        <span>⏳ Dịch vụ của bạn còn hiệu lực đến:</span>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : currentPackage ? (
          <span className="font-semibold text-primary">
            {format(parseISO(currentPackage.endDate), "dd/MM/yyyy", {
              locale: vi,
            })}
          </span>
        ) : (
          <span className="text-destructive">Chưa có gói dịch vụ</span>
        )}
      </div>

      {/* Current Package Info */}
      {!loading && currentPackage && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-lg">
                    {currentPackage.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentPackage.description}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Phí: {currentPackage.fee.toLocaleString("vi-VN")}đ/
                    {currentPackage.type === "weekly" ? "tuần" : "tháng"}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  currentPackage.status === "active"
                    ? "default"
                    : currentPackage.status === "expiring"
                    ? "warning"
                    : "error"
                }
              >
                {currentPackage.status === "active" && "✅ Đang hoạt động"}
                {currentPackage.status === "expiring" && "⚠️ Sắp hết hạn"}
                {currentPackage.status === "expired" && "❌ Hết hạn"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {packagesLoading ? (
          // Loading skeleton for packages
          [...Array(3)].map((_, index) => (
            <div
              key={index}
              className="rounded-xl bg-background border shadow-lg p-8 min-h-[370px]"
            >
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : availablePackages.length > 0 ? (
          availablePackages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex flex-col justify-between rounded-xl bg-background border border-primary shadow-lg p-8 relative overflow-hidden min-h-[370px] transition-all duration-200 ease-in-out hover:-translate-y-2 hover:scale-105 hover:shadow-2xl cursor-pointer"
              style={{ minWidth: 0 }}
              onClick={() => handleSelect(pkg.id)}
            >
              {pkg.label && (
                <div className="absolute -right-12 -top-3 bg-primary text-white px-8 py-1 rotate-45 text-xs font-medium">
                  {pkg.label}
                </div>
              )}
              <div>
                <div className="text-xl font-semibold mb-1">{pkg.name}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {pkg.final.toLocaleString()}đ
                  </span>
                  {pkg.discount > 0 && (
                    <span className="text-sm line-through text-muted-foreground">
                      {pkg.price.toLocaleString()}đ
                    </span>
                  )}
                </div>
                <div className="text-base text-muted-foreground mt-1">
                  {pkg.durationText}
                </div>
                <div className="text-xs text-green-700 mt-2 mb-4">
                  {pkg.benefit}
                </div>
                <ul className="mt-4 space-y-3 px-2">
                  {pkg.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>Thu gom {pkg.collectionsPerWeek} lần/tuần</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Button
                  className="w-full"
                  variant={selected === pkg.id ? "default" : "outline"}
                  onClick={() => handleSelect(pkg.id)}
                >
                  {selected === pkg.id ? (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  ) : null}
                  Chọn gói
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Không thể tải thông tin gói dịch vụ
            </p>
          </div>
        )}
      </div>
      {selectedPkg && (
        <div className="mb-8" ref={summaryRef}>
          <Card>
            <CardContent className="p-6">
              <div className="font-semibold mb-2">Tóm tắt đơn hàng</div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Gói:</span>
                  <span>{selectedPkg.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giá:</span>
                  <span>{selectedPkg.price.toLocaleString()}đ</span>
                </div>
                {selectedPkg.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Giảm giá:</span>
                    <span>-{selectedPkg.discount}%</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Tổng thanh toán:</span>
                  <span>{selectedPkg.final.toLocaleString()}đ</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="font-semibold mb-2">
                  Chọn phương thức thanh toán
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((pm) => (
                    <Button
                      key={pm.id}
                      variant={payMethod === pm.id ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setPayMethod(pm.id)}
                    >
                      {pm.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <Button
                  className="w-full"
                  disabled={!payMethod || confirm || success}
                  onClick={handlePay}
                >
                  {confirm
                    ? "Đang xử lý..."
                    : success
                    ? "Gia hạn thành công!"
                    : "Thanh toán ngay"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QR Payment Dialog */}
      {selectedPkg && (
        <QRPaymentDialog
          open={showQRDialog}
          onOpenChange={setShowQRDialog}
          paymentInfo={{
            packageId: selectedPkg.id,
            packageName: selectedPkg.name,
            duration: selectedPkg.duration,
            amount: selectedPkg.final,
            description: `Gia hạn gói ${selectedPkg.name}`,
          }}
          method={payMethod || "unknown"}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
      {/* Lịch sử gia hạn */}
      <div className="mt-10">
        <div className="font-semibold mb-4 text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Lịch sử gia hạn
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="rounded-md border bg-background overflow-x-auto">
              <Table>
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
                      <TableRow key={index}>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : extensionHistory.length > 0 ? (
                    extensionHistory.map((extension) => (
                      <TableRow key={extension.id}>
                        <TableCell className="font-medium">
                          {extension.packageName}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {extension.price.toLocaleString("vi-VN")}đ
                        </TableCell>
                        <TableCell>
                          {format(
                            parseISO(extension.paymentDate),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi }
                          )}
                        </TableCell>
                        <TableCell>
                          {format(
                            parseISO(extension.expiryDate),
                            "dd/MM/yyyy",
                            { locale: vi }
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {extension.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
