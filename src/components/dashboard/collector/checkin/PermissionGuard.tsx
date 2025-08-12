"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import { useToast } from "@/hooks/use-toast";

interface PermissionGuardProps {
  children: React.ReactNode;
  requireCamera?: boolean;
  requireGeolocation?: boolean;
}

export function PermissionGuard({
  children,
  requireCamera = true,
  requireGeolocation = true,
}: PermissionGuardProps) {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [checking, setChecking] = useState(true);
  const { permissions, requestAllPermissions, isMobile } = usePermissions();
  const { toast } = useToast();

  // Kiểm tra permissions
  const checkPermissions = () => {
    const cameraOk =
      !requireCamera || permissions.camera === "granted" || !isMobile;
    const geoOk = !requireGeolocation || permissions.geolocation === "granted";

    const granted = cameraOk && geoOk;
    setPermissionsGranted(granted);
    setChecking(false);
  };

  // Effect để check permissions khi permissions state thay đổi
  useEffect(() => {
    if (permissions.camera !== null || permissions.geolocation !== null) {
      checkPermissions();
    }
  }, [
    permissions.camera,
    permissions.geolocation,
    requireCamera,
    requireGeolocation,
    isMobile,
  ]);

  const handleRequestPermissions = async () => {
    setChecking(true);

    try {
      const result = await requestAllPermissions();
      console.log("📊 Permission request results:", result);

      if (
        (!requireCamera || result.camera) &&
        (!requireGeolocation || result.geolocation)
      ) {
        setPermissionsGranted(true);
        console.log("✅ All permissions granted successfully");
        toast({
          title: "Quyền đã được cấp",
          description: "Bạn có thể sử dụng tất cả tính năng.",
          variant: "default",
        });
      } else {
        const missing = [];
        if (requireCamera && !result.camera) missing.push("Camera");
        if (requireGeolocation && !result.geolocation) missing.push("GPS");

        console.log("❌ Some permissions missing:", missing);
        toast({
          title: "Cần cấp thêm quyền",
          description: `Vui lòng cấp quyền: ${missing.join(", ")}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("💥 Permission request error:", error);
      toast({
        title: "Lỗi cấp quyền",
        description: "Không thể cấp quyền. Vui lòng thử lại.",
        variant: "destructive",
      });
    }

    setChecking(false);
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="mb-2">Đang kiểm tra quyền truy cập...</p>
        </Card>
      </div>
    );
  }

  if (!permissionsGranted && isMobile) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-6 max-w-sm w-full">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-bold">Cần cấp quyền truy cập</h2>
            <p className="text-gray-600">
              Để sử dụng tính năng điểm danh, ứng dụng cần quyền truy cập:
            </p>
            <div className="space-y-2 text-left">
              {requireCamera && (
                <div className="flex items-center space-x-2">
                  <span
                    className={
                      permissions.camera === "granted"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {permissions.camera === "granted" ? "✅" : "❌"}
                  </span>
                  <span>Camera (để chụp ảnh điểm danh)</span>
                </div>
              )}
              {requireGeolocation && (
                <div className="flex items-center space-x-2">
                  <span
                    className={
                      permissions.geolocation === "granted"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {permissions.geolocation === "granted" ? "✅" : "❌"}
                  </span>
                  <span>Vị trí GPS (để xác định địa điểm)</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleRequestPermissions}
              className="w-full"
              disabled={checking}
            >
              {checking ? "Đang cấp quyền..." : "Cấp quyền truy cập"}
            </Button>

            <div className="text-xs text-gray-500 space-y-1">
              <p>💡 Hướng dẫn cho Android:</p>
              <p>1. Nhấn "Cấp quyền truy cập" bên dưới</p>
              <p>2. Chọn "Allow/Cho phép" khi được hỏi</p>
              <p>3. Nếu không hiện popup:</p>
              <p>&nbsp;&nbsp;• Vào menu ⋮ → Cài đặt trang web</p>
              <p>&nbsp;&nbsp;• Bật Camera và Vị trí</p>
              <p>&nbsp;&nbsp;• Tải lại trang</p>
              <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">
                <p className="font-medium">🔧 Debug Info:</p>
                <p className="text-xs">
                  Browser:{" "}
                  {navigator.userAgent.includes("Chrome") ? "Chrome" : "Other"}
                </p>
                <p className="text-xs">Mobile: {isMobile ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
