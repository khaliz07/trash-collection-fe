"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PermissionDialogPromptProps {
  type: "camera" | "geolocation" | "both";
  onClose: () => void;
  onProceed: () => void;
}

export function PermissionDialogPrompt({
  type,
  onClose,
  onProceed,
}: PermissionDialogPromptProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onProceed();
    }
  }, [countdown, onProceed]);

  const getPermissionText = () => {
    switch (type) {
      case "camera":
        return {
          title: "Chuẩn bị yêu cầu quyền Camera",
          description:
            "Ứng dụng sẽ yêu cầu quyền truy cập camera để chụp ảnh điểm danh.",
          icon: "📷",
        };
      case "geolocation":
        return {
          title: "Chuẩn bị yêu cầu quyền Vị trí",
          description:
            "Ứng dụng sẽ yêu cầu quyền truy cập vị trí để xác định địa điểm làm việc.",
          icon: "📍",
        };
      case "both":
        return {
          title: "Chuẩn bị yêu cầu quyền truy cập",
          description:
            "Ứng dụng sẽ yêu cầu quyền Camera và Vị trí để điểm danh.",
          icon: "🔐",
        };
    }
  };

  const permissionInfo = getPermissionText();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">{permissionInfo.icon}</div>
        <h3 className="text-lg font-bold mb-2">{permissionInfo.title}</h3>
        <p className="text-gray-600 mb-4">{permissionInfo.description}</p>

        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-blue-800 font-medium mb-2">
            Khi dialog xuất hiện, vui lòng:
          </p>
          <div className="text-sm text-blue-700 space-y-1">
            <p>✅ Nhấn "Cho phép" hoặc "Allow"</p>
            <p>❌ Không nhấn "Từ chối" hoặc "Block"</p>
            {type === 'camera' && (
              <p>📱 Android: Sẽ hiển thị dialog "Cho phép truy cập Camera"</p>
            )}
            {type === 'geolocation' && (
              <p>📍 Android: Sẽ hiển thị dialog "Cho phép truy cập Vị trí"</p>
            )}
          </div>
        </div>

        {countdown > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Dialog sẽ xuất hiện sau {countdown} giây...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <p className="text-green-600 font-medium">Đang yêu cầu quyền...</p>
        )}

        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={countdown === 0}
          >
            Hủy
          </Button>
          <Button
            onClick={onProceed}
            className="flex-1"
            disabled={countdown === 0}
          >
            Tiếp tục ngay
          </Button>
        </div>
      </Card>
    </div>
  );
}
