"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { usePermissions } from "@/hooks/use-permissions";
import { createTimestampedImageFile } from "@/lib/image-utils";

interface CameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function Camera({ onCapture, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [permissionDialogShown, setPermissionDialogShown] = useState(false);
  const { permissions, requestCameraPermission, isMobile } = usePermissions();

  const startCamera = useCallback(async () => {
    try {
      console.log("🎥 Starting camera...");
      setError(null);

      // Safety check: Đảm bảo video element có sẵn
      if (!videoRef.current) {
        console.log("⏳ Video element not ready yet, waiting...");
        setError("Đang chuẩn bị camera interface...");
        return false;
      }

      // Kiểm tra permission trước
      if (permissions.camera !== "granted") {
        console.log("📱 Requesting camera permission...");
        const granted = await requestCameraPermission();
        setPermissionRequested(true);

        if (!granted) {
          setError(
            "⚠️ Vui lòng cấp quyền camera để chụp ảnh điểm danh.\n\n1. Nhấn vào biểu tượng 🔒 trên thanh địa chỉ\n2. Chọn 'Camera' → 'Allow'\n3. Tải lại trang"
          );
          return false;
        }
      }

      // Mobile-optimized constraints
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: isMobile ? 720 : 1280 },
          height: { ideal: isMobile ? 1280 : 720 },
          facingMode: isMobile ? "environment" : "user", // Camera sau cho mobile
          // Đơn giản hóa constraints cho Android
        },
        audio: false,
      };

      console.log("🎥 Camera constraints:", constraints);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MediaDevices API not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log(
        "✅ Camera stream obtained:",
        stream.getTracks().length,
        "tracks"
      );

      // Double check video element
      if (!videoRef.current) {
        console.error(
          "❌ videoRef.current is still null after stream obtained"
        );
        stream.getTracks().forEach((track) => track.stop()); // Clean up
        setError("Video element không sẵn sàng. Vui lòng thử lại.");
        return false;
      }

      console.log("📹 Setting video srcObject...");
      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      // Force video setup
      try {
        console.log("🎬 Attempting to play video...");
        await videoRef.current.play();
        console.log("▶️ Video play successful");
        setIsActive(true);
      } catch (playError) {
        console.error("❌ Video play failed:", playError);

        // Fallback: Set active anyway và let user manual restart
        setIsActive(true);
        setError(
          "Video có thể cần restart thủ công. Nhấn 'Restart Video' nếu không thấy camera."
        );
      }

      console.log("📹 Video element configured");
      return true;
    } catch (err: any) {
      console.error("❌ Camera error:", err);
      let errorMessage = "Không thể khởi động camera.";

      if (err.name === "NotAllowedError") {
        errorMessage =
          "⚠️ Quyền camera bị từ chối.\n\n📱 Để sử dụng camera:\n1. Nhấn vào 🔒 trên thanh địa chỉ\n2. Cho phép 'Camera'\n3. Tải lại trang";
      } else if (err.name === "NotFoundError") {
        errorMessage = "❌ Không tìm thấy camera trên thiết bị này.";
      } else if (err.name === "NotReadableError") {
        errorMessage =
          "🔒 Camera đang được sử dụng bởi ứng dụng khác.\n\nVui lòng đóng các ứng dụng camera khác và thử lại.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage =
          "⚠️ Cài đặt camera không được hỗ trợ.\n\nThử với constraints cơ bản...";
        // Fallback với constraints đơn giản
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            streamRef.current = basicStream;
            setIsActive(true);
            return;
          }
        } catch (basicErr) {
          console.error("❌ Basic camera also failed:", basicErr);
        }
      }

      setError(errorMessage);
    }
  }, [requestCameraPermission, permissions.camera, isMobile]);

  // Tự động start camera nếu đã có permission
  useEffect(() => {
    // Chỉ auto-start nếu đã có permission VÀ video element đã sẵn sàng
    if (permissions.camera === "granted" && !isActive && videoRef.current) {
      console.log(
        "📱 Camera permission already granted and video element ready, auto-starting..."
      );
      startCamera();
    }
  }, [permissions.camera, isActive, startCamera, videoRef.current]);

  // Retry mechanism nếu video element chưa sẵn sàng
  useEffect(() => {
    if (permissions.camera === "granted" && !isActive && !streamRef.current) {
      const retryTimer = setTimeout(() => {
        if (videoRef.current) {
          console.log("🔄 Retry: Video element now ready, starting camera...");
          startCamera();
        } else {
          console.log("🔄 Video element still not ready, will retry again...");
        }
      }, 500); // Tăng thời gian chờ từ 100ms → 500ms

      return () => clearTimeout(retryTimer);
    }
  }, [permissions.camera, isActive, startCamera]);

  // Force refresh khi modal mở
  useEffect(() => {
    // Khi component mount, đợi một chút rồi check video element
    const mountTimer = setTimeout(() => {
      console.log("📺 Component mounted, video element:", !!videoRef.current);
      if (permissions.camera === "granted" && !isActive && videoRef.current) {
        console.log("🚀 Late start: Video element ready after mount");
        startCamera();
      }
    }, 200);

    return () => clearTimeout(mountTimer);
  }, []); // Chỉ chạy một lần khi mount

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = createTimestampedImageFile(
            blob,
            `checkin-${Date.now()}.jpg`
          );
          onCapture(file);
          stopCamera();
          onClose();
        }
      },
      "image/jpeg",
      0.9
    );
  }, [onCapture, onClose, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // Kiểm tra quyền khi component mount
  useEffect(() => {
    if (isMobile) {
      // Hiển thị thông báo yêu cầu quyền cho mobile
      setError(
        "Ứng dụng cần quyền truy cập camera để chụp ảnh điểm danh. Nhấn 'Bật camera' để cấp quyền."
      );
    }
  }, [isMobile]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className={`p-6 w-full mx-4 ${isMobile ? "max-w-sm" : "max-w-md"}`}>
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold">Chụp ảnh điểm danh</h3>
          {isMobile && (
            <p className="text-sm text-gray-600 mt-1">
              Sử dụng camera sau để chụp ảnh rõ nét
            </p>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm mb-4 text-center bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Debug Panel */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <div>
            📱 Permission: <strong>{permissions.camera}</strong>
          </div>
          <div>
            🎥 Camera Active: <strong>{isActive ? "Yes" : "No"}</strong>
          </div>
          <div>
            📡 Stream:{" "}
            <strong>{streamRef.current ? "Connected" : "None"}</strong>
          </div>
          <div>
            🔄 Permission Requested:{" "}
            <strong>{permissionRequested ? "Yes" : "No"}</strong>
          </div>
        </div>

        {/* Video element - LUÔN render để ref có thể attach */}
        <div className={`space-y-4 ${!isActive ? "hidden" : ""}`}>
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg"
              style={{
                maxHeight: isMobile ? "400px" : "300px",
                objectFit: "cover",
                transform: isMobile ? "none" : "scaleX(-1)", // Mirror cho desktop
                backgroundColor: "#000", // Background đen để thấy rõ
                minHeight: "200px", // Đảm bảo có chiều cao tối thiểu
              }}
              onLoadedMetadata={() => {
                console.log("🎥 Video loadedmetadata event fired");
                console.log(
                  "📐 Video dimensions:",
                  videoRef.current?.videoWidth,
                  "x",
                  videoRef.current?.videoHeight
                );
              }}
              onPlaying={() => {
                console.log("▶️ Video playing event fired");
              }}
              onError={(e) => {
                console.error("❌ Video error:", e);
              }}
              onCanPlay={() => {
                console.log("✅ Video can play");
              }}
            />

            {/* Debug overlay */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
              <div>📹 Active: {isActive ? "Yes" : "No"}</div>
              <div>🎥 Stream: {streamRef.current ? "Connected" : "None"}</div>
              <div>
                📺 Video: {videoRef.current?.videoWidth || 0}x
                {videoRef.current?.videoHeight || 0}
              </div>
              <div>▶️ Ready: {videoRef.current?.readyState || 0}</div>
              <div>
                🔗 srcObject: {videoRef.current?.srcObject ? "Set" : "None"}
              </div>
            </div>

            {/* Manual start button nếu video không hiển thị */}
            {streamRef.current &&
              (!videoRef.current?.videoWidth ||
                videoRef.current?.videoWidth === 0) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-center text-white">
                    <div className="mb-2">
                      📹 Camera connected but video not showing
                    </div>
                    <Button
                      onClick={async () => {
                        if (videoRef.current && streamRef.current) {
                          console.log("🔄 Manual video restart");
                          videoRef.current.srcObject = streamRef.current;
                          try {
                            await videoRef.current.play();
                            console.log("✅ Manual play successful");
                          } catch (err) {
                            console.error("❌ Manual play failed:", err);
                          }
                        }
                      }}
                      size="sm"
                    >
                      🔄 Restart Video
                    </Button>
                  </div>
                </div>
              )}

            {/* Overlay hướng dẫn */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-2 right-2 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
                📍 Đảm bảo vị trí làm việc hiện rõ trong khung hình
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={capturePhoto}
              className="flex-1"
              size={isMobile ? "lg" : "default"}
            >
              📸 Chụp ảnh
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              size={isMobile ? "lg" : "default"}
            >
              Hủy
            </Button>
          </div>

          {isMobile && (
            <p className="text-xs text-center text-gray-500">
              Giữ điện thoại thẳng và đợi camera lấy nét
            </p>
          )}
        </div>

        {/* Canvas - LUÔN render để ref có thể attach */}
        <canvas ref={canvasRef} className="hidden" />

        {/* UI Controls */}
        {/* UI Controls */}
        {!isActive ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              {isMobile
                ? "Nhấn nút bên dưới và cho phép truy cập camera"
                : "Nhấn 'Bật camera' để bắt đầu chụp ảnh"}
            </p>
            <div className="space-y-2">
              <Button onClick={startCamera} className="w-full">
                📷 Bật camera
              </Button>

              {/* Debug button */}
              <Button
                onClick={async () => {
                  console.log("🔧 Force debug camera start");
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                      video: true,
                    });
                    console.log("🔧 Debug stream:", stream);
                    if (videoRef.current) {
                      videoRef.current.srcObject = stream;
                      streamRef.current = stream;

                      // Force play
                      await videoRef.current.play();
                      setIsActive(true);
                      console.log("🔧 Debug: Video set up complete");
                    }
                  } catch (err) {
                    console.error("🔧 Debug failed:", err);
                    setError(`Debug error: ${err}`);
                  }
                }}
                variant="outline"
                className="w-full"
                size="sm"
              >
                🔧 Debug Force Start
              </Button>

              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Hủy
              </Button>
            </div>

            {isMobile && permissions.camera === "denied" && (
              <div className="text-xs text-gray-500 mt-2">
                <p>Nếu không thể bật camera, vui lòng:</p>
                <p>1. Vào Cài đặt trình duyệt</p>
                <p>2. Cho phép truy cập Camera cho trang này</p>
                <p>3. Tải lại trang</p>
              </div>
            )}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
