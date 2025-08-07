"use client"

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { QRPaymentDialog } from "@/components/payments/QRPaymentDialog";

const mockExpiry = "15/06/2024";
const mockPackages = [
  {
    id: "1m",
    name: "1 tháng",
    price: 40000,
    discount: 0,
    final: 40000,
    label: "Gợi ý",
    duration: "30 ngày",
    benefit: "Tiện lợi, linh hoạt"
  },
  {
    id: "3m",
    name: "3 tháng",
    price: 120000,
    discount: 5,
    final: 114000,
    label: "Tiết kiệm nhất",
    duration: "90 ngày",
    benefit: "Tiết kiệm 5% so với tháng"
  },
  {
    id: "12m",
    name: "1 năm",
    price: 480000,
    discount: 10,
    final: 432000,
    label: "Phổ biến",
    duration: "365 ngày",
    benefit: "Tiết kiệm 10% + tặng 1 tháng"
  }
];

const paymentMethods = [
  { id: "momo", name: "Ví MoMo" },
  { id: "zalopay", name: "ZaloPay" },
  { id: "bank", name: "Chuyển khoản ngân hàng" },
  { id: "credit", name: "Thẻ tín dụng/Ghi nợ" }
];

export default function ExtendSubscriptionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const selectedPkg = mockPackages.find((p) => p.id === selected);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => {
      if (summaryRef.current) {
        summaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handlePay = () => {
    if (payMethod === 'momo' || payMethod === 'zalopay' || payMethod === 'bank') {
      // Use QR payment for electronic methods
      setShowQRDialog(true);
    } else {
      // Old flow for credit cards
      setConfirm(true);
      setTimeout(() => {
        setConfirm(false);
        setSuccess(true);
        toast.success('Gia hạn thành công! Cảm ơn bạn đã gia hạn dịch vụ.');
      }, 1500);
    }
  };

  const handlePaymentSuccess = () => {
    setShowQRDialog(false);
    setSuccess(true);
    toast.success('Gia hạn thành công! Hạn sử dụng mới đã được cập nhật.');
  };

  const handlePaymentFailure = () => {
    setShowQRDialog(false);
    toast.error('Thanh toán thất bại. Vui lòng thử lại.');
  };

  return (
    <div className="container max-w-full py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Gia hạn dịch vụ</h1>
      </div>
      <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
        <span>⏳ Dịch vụ của bạn còn hiệu lực đến:</span>
        <span className="font-semibold text-primary">{mockExpiry}</span>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {mockPackages.map((pkg) => (
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
                <span className="text-3xl font-bold">{pkg.final.toLocaleString()}đ</span>
                {pkg.discount > 0 && (
                  <span className="text-sm line-through text-muted-foreground">{pkg.price.toLocaleString()}đ</span>
                )}
              </div>
              <div className="text-base text-muted-foreground mt-1">{pkg.duration}</div>
              <div className="text-xs text-green-700 mt-2 mb-4">{pkg.benefit}</div>
              <ul className="mt-4 space-y-3 px-2">
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary"><path d="M20 6L9 17l-5-5" /></svg>
                  <span>Bao gồm tất cả trong gói tháng</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary"><path d="M20 6L9 17l-5-5" /></svg>
                  <span>Thu gom khẩn miễn phí</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary"><path d="M20 6L9 17l-5-5" /></svg>
                  <span>Hỗ trợ ưu tiên</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary"><path d="M20 6L9 17l-5-5" /></svg>
                  <span>Phân tích chi tiết</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Button className="w-full" variant={selected === pkg.id ? "default" : "outline"} onClick={() => handleSelect(pkg.id)}>
                {selected === pkg.id ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
                Chọn gói
              </Button>
            </div>
          </div>
        ))}
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
                <div className="font-semibold mb-2">Chọn phương thức thanh toán</div>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((pm) => (
                    <Button key={pm.id} variant={payMethod === pm.id ? "default" : "outline"} className="w-full" onClick={() => setPayMethod(pm.id)}>
                      {pm.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <Button className="w-full" disabled={!payMethod || confirm || success} onClick={handlePay}>
                  {confirm ? "Đang xử lý..." : success ? "Gia hạn thành công!" : "Thanh toán ngay"}
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
            packageName: selectedPkg.name,
            duration: selectedPkg.duration,
            amount: selectedPkg.final,
            description: `Gia hạn gói ${selectedPkg.name}`
          }}
          method={payMethod || 'unknown'}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
      {/* Lịch sử gia hạn (tùy chọn) */}
      <div className="mt-10">
        <div className="font-semibold mb-2">Lịch sử gia hạn</div>
        <Card>
          <CardContent className="p-4">
            <div className="rounded-md border bg-background overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gói</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Ngày thanh toán</TableHead>
                    <TableHead>Hạn sử dụng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1 năm</TableCell>
                    <TableCell>1.200.000đ</TableCell>
                    <TableCell>15/06/2023</TableCell>
                    <TableCell>15/06/2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>3 tháng</TableCell>
                    <TableCell>360.000đ</TableCell>
                    <TableCell>15/03/2023</TableCell>
                    <TableCell>15/06/2023</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 