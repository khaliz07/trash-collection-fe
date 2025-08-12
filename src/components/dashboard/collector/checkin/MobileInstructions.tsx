"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function MobileInstructions() {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Kiểm tra xem đã dismiss chưa
    const isDismissed = localStorage.getItem(
      "mobile-checkin-instructions-dismissed"
    );
    if (!isDismissed && isMobile()) {
      setIsVisible(true);
    }
  }, []);

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    localStorage.setItem("mobile-checkin-instructions-dismissed", "true");
  };

  if (!isVisible || dismissed) {
    return null;
  }

  return (
    <Card className="mb-4 p-4 bg-blue-50 border-blue-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            📱 Hướng dẫn sử dụng trên mobile
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <div className="flex items-start space-x-2">
              <span>📷</span>
              <span>Sử dụng camera sau để chụp ảnh rõ nét hơn</span>
            </div>
            <div className="flex items-start space-x-2">
              <span>📍</span>
              <span>Bật GPS để xác định vị trí chính xác</span>
            </div>
            <div className="flex items-start space-x-2">
              <span>⏰</span>
              <span>Ảnh phải được chụp trong vòng 5 phút gần đây</span>
            </div>
            <div className="flex items-start space-x-2">
              <span>🔒</span>
              <span>Cấp quyền Camera và GPS khi được yêu cầu</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-blue-600 hover:text-blue-800 p-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
