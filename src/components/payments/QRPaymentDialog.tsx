import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import {
  CheckCircle,
  Clock,
  Copy,
  QrCode,
  RefreshCw,
  XCircle,
} from "lucide-react";
import QRCodeLib from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import "./payment-animations.css";
import { api } from "@/lib/api";

interface PaymentInfo {
  packageId: string;
  packageName: string;
  duration: string;
  amount: number;
  description?: string;
}

interface QRPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentInfo: PaymentInfo;
  method?: string; // Payment method for QR URL
  onSuccess?: (transactionId?: string) => void;
  onFailure?: () => void;
}

interface PaymentData {
  paymentId: string;
  qrUrl: string;
  qrDataUrl?: string; // Base64 QR code image
  expiresAt: string;
  amount: number;
  packageName: string;
  duration: string;
}

export function QRPaymentDialog({
  open,
  onOpenChange,
  paymentInfo,
  method = "unknown",
  onSuccess,
  onFailure,
}: QRPaymentDialogProps) {
  const { user } = useAuth();

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed" | "expired"
  >("pending");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Create payment when dialog opens
  useEffect(() => {
    if (open && !paymentData) {
      createPayment();
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (!open || !paymentData || paymentStatus !== "pending") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, paymentData, paymentStatus]);

  // Payment status checking
  useEffect(() => {
    if (!open || !paymentData || paymentStatus !== "pending") return;

    const checkPayment = async () => {
      if (isCheckingPayment) return;

      setIsCheckingPayment(true);
      try {
        const response = await fetch(
          `/api/payments/check/${paymentData.paymentId}`
        );
        const result = await response.json();

        if (result.success && result.payment) {
          if (result.payment.status === "completed") {
            setPaymentStatus("success");
            setShowSuccessAnimation(true);
            toast.success("Thanh toán thành công!");

            // Auto close after success animation
            setTimeout(() => {
              onSuccess?.(paymentData?.paymentId);
              setTimeout(() => {
                handleClose();
              }, 1000);
            }, 3000);
          } else if (result.payment.status === "failed") {
            setPaymentStatus("failed");
            toast.error("Thanh toán thất bại!");
            onFailure?.();
          }
        }
      } catch (error) {
        console.error("Error checking payment:", error);
      } finally {
        setIsCheckingPayment(false);
      }
    };

    const interval = setInterval(checkPayment, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [
    open,
    paymentData,
    paymentStatus,
    isCheckingPayment,
    onSuccess,
    onFailure,
  ]);

  // Listen for payment success messages from popup window
  useEffect(() => {
    if (!open || !paymentData) return;

    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from our own origin
      if (event.origin !== window.location.origin) return;

      if (
        event.data.type === "payment_success" &&
        event.data.paymentId === paymentData.paymentId
      ) {
        console.log("Payment success message received:", event.data);
        setPaymentStatus("success");
        setShowSuccessAnimation(true);
        toast.success("Thanh toán thành công!");

        // Auto close after success animation
        setTimeout(() => {
          onSuccess?.(paymentData?.paymentId);
          setTimeout(() => {
            handleClose();
          }, 1000);
        }, 3000);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [open, paymentData, onSuccess]);

  const createPayment = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/payments", {
        body: JSON.stringify({
          userId: user.id,
          packageId: paymentInfo.packageId,
          amount: paymentInfo.amount,
          description:
            paymentInfo.description || `Gia hạn gói ${paymentInfo.packageName}`,
          packageName: paymentInfo.packageName,
          duration: paymentInfo.duration,
          method: method,
        }),
      });

      const result = await response.data;

      if (result.success) {
        // Generate real QR code
        const qrDataUrl = await generateQRCode(result.qrUrl);

        setPaymentData({
          paymentId: result.paymentId,
          qrUrl: result.qrUrl,
          qrDataUrl: qrDataUrl,
          expiresAt: result.expiresAt,
          amount: result.amount,
          packageName: result.packageName,
          duration: result.duration,
        });
        setTimeLeft(300); // Reset timer
      } else {
        toast.error("Không thể tạo thanh toán");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Lỗi kết nối server");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async (url: string): Promise<string> => {
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });
      return qrDataUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw error;
    }
  };

  const copyPaymentLink = () => {
    if (paymentData?.qrUrl) {
      navigator.clipboard.writeText(paymentData.qrUrl);
      toast.success("Đã sao chép link thanh toán!");
    }
  };

  const simulatePayment = async () => {
    if (!paymentData) return;

    setIsLoading(true);
    try {
      // Call confirm API to mark payment as successful
      const response = await fetch(
        `/api/payments/confirm/${paymentData.paymentId}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (result.success) {
        setPaymentStatus("success");
        setShowSuccessAnimation(true);
        toast.success("Thanh toán thành công!");

        // Auto close after success animation
        setTimeout(() => {
          onSuccess?.(paymentData.paymentId);
          setTimeout(() => {
            handleClose();
          }, 1000);
        }, 3000);
      } else {
        toast.error(result.message || "Thanh toán thất bại!");
      }
    } catch (error) {
      console.error("Error simulating payment:", error);
      toast.error("Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const progressValue = ((300 - timeLeft) / 300) * 100;

  const handleClose = () => {
    setPaymentData(null);
    setPaymentStatus("pending");
    setTimeLeft(300);
    setShowSuccessAnimation(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Thanh toán QR Code
          </DialogTitle>
        </DialogHeader>

        {isLoading && !paymentData ? (
          <div className="flex flex-col items-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p>Đang tạo thanh toán...</p>
          </div>
        ) : paymentData ? (
          <div className="space-y-6">
            {/* Success Animation Overlay */}
            {showSuccessAnimation && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300">
                <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4 animate-in zoom-in duration-500">
                  <div className="relative mb-6">
                    {/* Success Checkmark Animation */}
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center payment-success-animation">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    {/* Confetti Animation */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="w-3 h-3 bg-yellow-400 rounded-full confetti-particle"
                        style={{ animationDelay: "0.3s" }}
                      ></div>
                      <div
                        className="absolute w-2 h-2 bg-blue-400 rounded-full confetti-particle -translate-x-8 -translate-y-4"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                      <div
                        className="absolute w-3 h-3 bg-red-400 rounded-full confetti-particle translate-x-8 -translate-y-4"
                        style={{ animationDelay: "0.7s" }}
                      ></div>
                      <div
                        className="absolute w-2 h-2 bg-purple-400 rounded-full confetti-particle translate-x-6 translate-y-6"
                        style={{ animationDelay: "0.9s" }}
                      ></div>
                      <div
                        className="absolute w-3 h-3 bg-green-400 rounded-full confetti-particle -translate-x-6 translate-y-6"
                        style={{ animationDelay: "1.1s" }}
                      ></div>
                      <div
                        className="absolute w-2 h-2 bg-pink-400 rounded-full confetti-particle translate-x-10 translate-y-2"
                        style={{ animationDelay: "1.3s" }}
                      ></div>
                      <div
                        className="absolute w-2 h-2 bg-orange-400 rounded-full confetti-particle -translate-x-10 translate-y-2"
                        style={{ animationDelay: "1.5s" }}
                      ></div>
                    </div>
                  </div>
                  <h3
                    className="text-xl font-bold text-green-700 mb-2 slide-up-animation"
                    style={{ animationDelay: "0.7s" }}
                  >
                    Thanh toán thành công! 🎉
                  </h3>
                  <p
                    className="text-gray-600 slide-up-animation"
                    style={{ animationDelay: "0.9s" }}
                  >
                    Gói dịch vụ đã được gia hạn thành công
                  </p>
                  <div
                    className="mt-4 slide-up-animation"
                    style={{ animationDelay: "1.1s" }}
                  >
                    <div className="text-lg font-semibold text-green-600">
                      {paymentData.amount.toLocaleString("vi-VN")}đ
                    </div>
                    <div className="text-sm text-gray-500">
                      {paymentData.packageName} - {paymentData.duration}
                    </div>
                  </div>
                  <div
                    className="mt-4 text-xs text-gray-400 slide-up-animation"
                    style={{ animationDelay: "1.3s" }}
                  >
                    Tự động đóng sau 3 giây...
                  </div>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Gói dịch vụ:
                </span>
                <span className="font-medium">{paymentData.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Thời hạn:</span>
                <span className="font-medium">{paymentData.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Số tiền:</span>
                <span className="font-semibold text-lg text-green-600">
                  {paymentData.amount.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              {paymentStatus === "pending" && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Chờ thanh toán
                </Badge>
              )}
              {paymentStatus === "success" && (
                <Badge
                  variant="default"
                  className="flex items-center gap-1 bg-green-500"
                >
                  <CheckCircle className="h-3 w-3" />
                  Thành công
                </Badge>
              )}
              {(paymentStatus === "failed" || paymentStatus === "expired") && (
                <Badge variant="error" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {paymentStatus === "expired" ? "Hết hạn" : "Thất bại"}
                </Badge>
              )}
            </div>

            {paymentStatus === "pending" && (
              <>
                {/* Timer */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Thời gian còn lại:</span>
                    <span className="font-mono">{formatTime(timeLeft)}</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </div>

                {/* QR Code Real */}
                <div className="flex flex-col items-center py-6 border rounded-lg bg-gray-50">
                  {paymentData.qrDataUrl ? (
                    <div className="mb-4">
                      <img
                        src={paymentData.qrDataUrl}
                        alt="QR Code thanh toán"
                        className="border rounded-lg shadow-sm"
                        width={200}
                        height={200}
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <p className="text-sm text-center text-muted-foreground mb-2">
                    Quét mã QR bằng camera điện thoại để thanh toán
                  </p>
                  <p className="text-xs text-center text-gray-500 mb-4">
                    Mã giao dịch: {paymentData.paymentId}
                  </p>
                  <Button
                    onClick={simulatePayment}
                    disabled={isLoading}
                    variant="secondary"
                    size="sm"
                    className="mb-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "🧪 Mô phỏng thanh toán (Test)"
                    )}
                  </Button>
                </div>

                {/* Copy Link */}
                <Button
                  variant="outline"
                  onClick={copyPaymentLink}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Sao chép link thanh toán
                </Button>
              </>
            )}

            {/* Success/Failure Actions - Only show if not showing success animation */}
            {(paymentStatus === "success" ||
              paymentStatus === "failed" ||
              paymentStatus === "expired") &&
              !showSuccessAnimation && (
                <div className="space-y-3">
                  {paymentStatus === "success" && (
                    <div className="text-center py-4">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
                      <p className="text-lg font-medium text-green-700">
                        Thanh toán thành công!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Gói dịch vụ đã được gia hạn
                      </p>
                    </div>
                  )}

                  {(paymentStatus === "failed" ||
                    paymentStatus === "expired") && (
                    <div className="text-center py-4">
                      <XCircle className="h-16 w-16 text-red-500 mx-auto mb-3" />
                      <p className="text-lg font-medium text-red-700">
                        {paymentStatus === "expired"
                          ? "Thanh toán hết hạn"
                          : "Thanh toán thất bại"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vui lòng thử lại sau
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleClose}
                    className="w-full"
                    variant={
                      paymentStatus === "success" ? "default" : "outline"
                    }
                  >
                    {paymentStatus === "success" ? "Hoàn tất" : "Đóng"}
                  </Button>
                </div>
              )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default QRPaymentDialog;
