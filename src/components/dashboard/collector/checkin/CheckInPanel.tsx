"use client";
import { useState } from "react";
import { CheckInData, CheckInConfig } from "./types";
import { mockCheckInData, mockCheckInConfig } from "./mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ImagePreview } from "@/components/ui/image-preview";
import { Camera } from "@/components/ui/camera";
import {
  validateImageFreshness,
  getTimeSinceCreation,
} from "@/lib/image-utils";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { MobileInstructions } from "./MobileInstructions";
import { PermissionDialogPrompt } from "./PermissionDialogPrompt";
import { PermissionDebugger } from "./PermissionDebugger";

function getCurrentTimeString() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

import { CameraDebug } from "@/components/debug/camera-debug";

export default function CheckInPanel() {
  const [data, setData] = useState<CheckInData>(mockCheckInData);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [locationPermissionChecked, setLocationPermissionChecked] =
    useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState<
    "camera" | "geolocation" | "both" | null
  >(null);

  const config: CheckInConfig = mockCheckInConfig;
  const { toast } = useToast();
  const {
    permissions,
    requestGeolocationPermission,
    requestAllPermissions,
    requestCameraPermission,
    isMobile,
  } = usePermissions();

  // Lấy vị trí GPS
  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise(async (resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Trình duyệt không hỗ trợ định vị.");
        return;
      }

      // Yêu cầu quyền GPS nếu chưa có
      if (!locationPermissionChecked) {
        const granted = await requestGeolocationPermission();
        setLocationPermissionChecked(true);

        if (!granted) {
          reject("Vui lòng cấp quyền truy cập vị trí để tiếp tục.");
          return;
        }
      }

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (error) => {
          let errorMessage = "Không thể lấy vị trí GPS.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Thông tin vị trí không khả dụng.";
              break;
            case error.TIMEOUT:
              errorMessage = "Hết thời gian chờ lấy vị trí.";
              break;
          }

          reject(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        }
      );
    });
  };

  // Xử lý upload/chụp ảnh
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetPhoto(file);
    }
  };

  // Xử lý khi nhấn nút chụp ảnh - hiển thị prompt trước khi trigger permission
  const handleCameraClick = () => {
    console.log("🎯 Camera button clicked");
    console.log("📊 Current permissions:", permissions);
    console.log("🎥 Camera modal opening...");
    setShowCamera(true);
  };

  // Thực hiện yêu cầu quyền camera sau khi user đồng ý
  const handleCameraPermissionRequest = async () => {
    setShowPermissionPrompt(null);

    toast({
      title: "Đang yêu cầu quyền camera",
      description: "Vui lòng cho phép truy cập camera khi dialog xuất hiện",
    });

    const granted = await requestCameraPermission();

    if (!granted) {
      toast({
        title: "Không thể truy cập camera",
        description: "Vui lòng cấp quyền camera trong cài đặt trình duyệt",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Quyền camera đã được cấp",
      description: "Bây giờ bạn có thể chụp ảnh",
    });

    // Mở camera sau khi có quyền
    setShowCamera(true);
  };
  const handleCameraCapture = (file: File) => {
    validateAndSetPhoto(file);
  };

  // Kiểm tra và set ảnh
  const validateAndSetPhoto = (file: File) => {
    setError(null);

    // Kiểm tra thời gian tạo ảnh với validation mới
    const validation = validateImageFreshness(file);

    if (!validation.isValid) {
      const errorMsg = `${validation.reason}. Ảnh này được tạo ${validation.timeSince}.`;
      setError(errorMsg);

      // Sử dụng toast để thông báo
      toast({
        title: "Ảnh không hợp lệ",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setPhoto(file);
    setPhotoUrl(URL.createObjectURL(file));

    // Thông báo thành công
    toast({
      title: "Ảnh hợp lệ",
      description: `Ảnh được chụp ${validation.timeSince} - phù hợp cho điểm danh.`,
      variant: "default",
    });
  };

  // Xử lý điểm danh với permission prompt
  const handleCheckIn = async () => {
    setError(null);
    setLoading(true);

    try {
      // Kiểm tra và hiển thị prompt cho quyền GPS nếu cần
      if (permissions.geolocation !== "granted") {
        setLoading(false);
        setShowPermissionPrompt("geolocation");
        return;
      }

      const location = await getLocation();

      if (config.requirePhoto && !photo) {
        const errorMsg = "Vui lòng chụp hoặc tải lên ảnh điểm danh!";
        setError(errorMsg);
        toast({
          title: "Thiếu ảnh điểm danh",
          description: errorMsg,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Simulate API call
      setTimeout(() => {
        setData({
          checkedIn: true,
          checkInTime: getCurrentTimeString(),
          location,
          photoUrl: photoUrl,
        });

        toast({
          title: "Điểm danh thành công!",
          description: `Đã điểm danh lúc ${getCurrentTimeString()}`,
          variant: "default",
        });

        setLoading(false);
      }, 1000);
    } catch (err: any) {
      const errorMsg =
        typeof err === "string"
          ? err
          : err.message || "Có lỗi xảy ra khi điểm danh";
      setError(errorMsg);

      toast({
        title: "Lỗi điểm danh",
        description: errorMsg,
        variant: "destructive",
      });

      setLoading(false);
    }
  };

  // Thực hiện yêu cầu quyền GPS sau khi user đồng ý
  const handleGeolocationPermissionRequest = async () => {
    setShowPermissionPrompt(null);
    setLoading(true);

    toast({
      title: "Đang yêu cầu quyền vị trí",
      description: "Vui lòng cho phép truy cập vị trí khi dialog xuất hiện",
    });

    const gpsGranted = await requestGeolocationPermission();
    if (!gpsGranted) {
      toast({
        title: "Không thể truy cập vị trí",
        description: "Vui lòng cấp quyền vị trí để tiếp tục điểm danh",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Tiếp tục điểm danh sau khi có quyền GPS
    handleCheckIn();
  };

  // Yêu cầu tất cả quyền
  const handleRequestPermissions = async () => {
    setLoading(true);
    const result = await requestAllPermissions();
    setLoading(false);

    if (result.camera && result.geolocation) {
      toast({
        title: "Quyền đã được cấp",
        description: "Bây giờ bạn có thể sử dụng camera và GPS.",
        variant: "default",
      });
    } else {
      const missingPermissions = [];
      if (!result.camera) missingPermissions.push("Camera");
      if (!result.geolocation) missingPermissions.push("GPS");

      toast({
        title: "Một số quyền chưa được cấp",
        description: `Vui lòng cấp quyền: ${missingPermissions.join(", ")}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {/* Mobile Instructions */}
      {isMobile && <MobileInstructions />}

      {/* Debug Panel - only in development */}
      {process.env.NODE_ENV === "development" && <PermissionDebugger />}

      <Card
        className={`mx-auto p-6 mt-8 ${isMobile ? "max-w-sm" : "max-w-md"}`}
      >
        <h2 className="text-lg font-bold mb-2">Điểm danh bắt đầu ca</h2>

        {/* Debug controls */}
        <div className="mb-4 p-4 bg-blue-50 border rounded-lg">
          <h3 className="font-semibold mb-2">🔧 Debug Controls</h3>
          <div className="flex gap-2 flex-wrap">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                console.log("🎯 Force open camera");
                setShowCamera(true);
              }}
            >
              🎥 Force Open Camera
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                console.log("📊 Current states:", {
                  showCamera,
                  permissions,
                  photo: !!photo,
                  photoUrl
                });
              }}
            >
              📊 Log States
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={async () => {
                console.log("📱 Test camera permission");
                const granted = await requestCameraPermission();
                console.log("Permission result:", granted);
              }}
            >
              🔑 Test Permission
            </Button>
          </div>
        </div>

        {/* Mobile permissions warning */}
        {isMobile &&
          (permissions.camera === "denied" ||
            permissions.geolocation === "denied") && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                <p className="font-medium">⚠️ Cần cấp quyền truy cập</p>
                <p className="mt-1">
                  Ứng dụng cần quyền Camera và GPS để điểm danh.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={handleRequestPermissions}
                  disabled={loading}
                >
                  Cấp quyền ngay
                </Button>
              </div>
            {/* Debug tool */}
            <div className="mt-8 border-t pt-4">
              <CameraDebug />
            </div>
          </div>
        )}        <div className="mb-4">
          <Badge variant={data.checkedIn ? "success" : "warning"}>
            {data.checkedIn ? "Đã điểm danh" : "Chưa điểm danh"}
          </Badge>
        </div>
        {data.checkedIn ? (
          <div className="space-y-2">
            <div>
              <span className="font-medium">Thời gian điểm danh:</span>{" "}
              {data.checkInTime}
            </div>
            {data.location && (
              <div>
                <span className="font-medium">Vị trí:</span>{" "}
                {data.location.lat.toFixed(5)}, {data.location.lng.toFixed(5)}
              </div>
            )}
            {data.photoUrl && (
              <div>
                <span className="font-medium">Ảnh điểm danh:</span>
                <div className="mt-1">
                  <ImagePreview
                    src={data.photoUrl}
                    alt="Ảnh điểm danh"
                    previewSize="sm"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {config.requirePhoto && (
              <div className="mb-4">
                <label className="block font-medium mb-2">
                  Chụp hoặc tải lên ảnh điểm danh:
                </label>

                <div className="space-y-3">
                  {/* Nút chụp ảnh */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCameraClick}
                    className="w-full"
                    size={isMobile ? "lg" : "default"}
                  >
                    📷 Chụp ảnh ngay
                  </Button>

                  {/* Hoặc upload file */}
                  <div className="text-center text-sm text-gray-500">hoặc</div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className={isMobile ? "text-base" : ""}
                  />

                  {isMobile && (
                    <p className="text-xs text-gray-500 text-center">
                      💡 Khuyến khích chụp ảnh trực tiếp để đảm bảo thời gian
                      chính xác
                    </p>
                  )}
                </div>

                {photoUrl && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Ảnh đã chọn:</span>
                      {photo && (
                        <span className="text-xs text-gray-500">
                          {getTimeSinceCreation(photo)}
                        </span>
                      )}
                    </div>
                    <ImagePreview
                      src={photoUrl}
                      alt="Ảnh điểm danh"
                      previewSize="sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoUrl(undefined);
                        setError(null);
                      }}
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      🗑️ Xóa ảnh
                    </Button>
                  </div>
                )}
              </div>
            )}
            {error && (
              <div className="text-red-600 mb-2 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            <Button
              onClick={handleCheckIn}
              disabled={
                loading ||
                (isMobile &&
                  (permissions.camera === "denied" ||
                    permissions.geolocation === "denied"))
              }
              className="w-full"
              size={isMobile ? "lg" : "default"}
            >
              {loading ? "Đang điểm danh..." : "Điểm danh bắt đầu ca"}
            </Button>
          </>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <Camera
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}

        {/* Permission Dialog Prompt */}
        {showPermissionPrompt && (
          <PermissionDialogPrompt
            type={showPermissionPrompt}
            onClose={() => setShowPermissionPrompt(null)}
            onProceed={
              showPermissionPrompt === "camera"
                ? handleCameraPermissionRequest
                : handleGeolocationPermissionRequest
            }
          />
        )}
      </Card>
    </div>
  );
}
