"use client";
import { useState, useEffect } from "react";

export interface PermissionStatus {
  camera: PermissionState | null;
  geolocation: PermissionState | null;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: null,
    geolocation: null,
  });
  const [loading, setLoading] = useState(false);

  // Kiểm tra quyền hiện tại
  const checkPermissions = async () => {
    setLoading(true);
    try {
      if ("permissions" in navigator) {
        const cameraPermission = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        const geoPermission = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });

        setPermissions({
          camera: cameraPermission.state,
          geolocation: geoPermission.state,
        });
      }
    } catch (error) {
      console.log("Permissions API not fully supported");
    }
    setLoading(false);
  };

  // Kiểm tra xem có phải là mobile không
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  // Yêu cầu quyền camera - LUÔN thử request, không check API support trước
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      // Constraints đơn giản cho Android
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "environment", // Camera sau cho mobile
        },
        audio: false,
      };

      let stream: MediaStream | null = null;

      // Cố gắng với tất cả các cách có thể
      try {
        // Cách 1: Modern API
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          console.log("📱 Trying modern getUserMedia...");
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        }
        // Cách 2: Legacy API với type casting
        else if ((navigator as any).getUserMedia) {
          console.log("📱 Trying legacy getUserMedia...");
          stream = await new Promise<MediaStream>((resolve, reject) => {
            (navigator as any).getUserMedia(constraints, resolve, reject);
          });
        }
        // Cách 3: Webkit prefix
        else if ((navigator as any).webkitGetUserMedia) {
          console.log("📱 Trying webkit getUserMedia...");
          stream = await new Promise<MediaStream>((resolve, reject) => {
            (navigator as any).webkitGetUserMedia(constraints, resolve, reject);
          });
        } else {
          throw new Error("No getUserMedia API available");
        }

        if (stream && stream.getTracks().length > 0) {
          // Dừng stream ngay
          stream.getTracks().forEach((track) => {
            console.log("🛑 Stopping track:", track.label);
            track.stop();
          });

          // Cập nhật state
          setPermissions((prev) => ({ ...prev, camera: "granted" }));
          return true;
        } else {
          throw new Error("No video tracks in stream");
        }
      } catch (streamError) {
        console.error("❌ Stream error:", streamError);
        throw streamError;
      }
    } catch (error: any) {
      console.error("❌ Camera permission FAILED:", error);

      // Chi tiết lỗi cho debug
      console.log("📱 Error details:", {
        name: error.name,
        message: error.message,
        constraint: error.constraint,
      });

      if (error.name === "NotAllowedError") {
        alert(
          "⚠️ Bạn đã từ chối quyền Camera.\n\nĐể sử dụng tính năng chụp ảnh:\n1. Nhấn vào biểu tượng 🔒 hoặc ⚙️ trên thanh địa chỉ\n2. Chọn 'Camera' → 'Allow'\n3. Tải lại trang"
        );
        setPermissions((prev) => ({ ...prev, camera: "denied" }));
      } else if (error.name === "NotFoundError") {
        alert("Không tìm thấy camera trên thiết bị này");
      } else if (error.name === "OverconstrainedError") {
        // Thử với constraints cơ bản nhất
        return await requestBasicCameraPermission();
      } else {
        alert(
          "Lỗi camera không xác định. Vui lòng:\n1. Đóng các ứng dụng camera khác\n2. Cập nhật trình duyệt\n3. Thử lại"
        );
      }

      return false;
    }
  };

  // Fallback với constraints cơ bản nhất
  const requestBasicCameraPermission = async (): Promise<boolean> => {
    try {
      console.log("🔧 Trying BASIC camera permission...");

      let stream: MediaStream | null = null;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      } else if ((navigator as any).getUserMedia) {
        stream = await new Promise<MediaStream>((resolve, reject) => {
          (navigator as any).getUserMedia({ video: true }, resolve, reject);
        });
      }

      if (stream) {
        console.log("✅ BASIC camera permission granted!");
        stream.getTracks().forEach((track) => track.stop());
        setPermissions((prev) => ({ ...prev, camera: "granted" }));
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ BASIC camera permission also failed:", error);
      return false;
    }
  };

  // Yêu cầu quyền GPS
  const requestGeolocationPermission = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log("🌍 Geolocation not supported");
        alert("Thiết bị này không hỗ trợ GPS");
        resolve(false);
        return;
      }

      console.log("🌍 Requesting GPS permission on Android...");

      const options = {
        enableHighAccuracy: true, // Force GPS để trigger permission
        timeout: 30000, // 30 giây
        maximumAge: 0, // Fresh request
      };

      console.log("🔐 Triggering Android GPS permission...");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("✅ GPS permission SUCCESS:", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });

          setPermissions((prev) => ({ ...prev, geolocation: "granted" }));
          resolve(true);
        },
        (error) => {
          console.error("❌ GPS permission FAILED:", error);

          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log("🚫 User DENIED GPS permission");
              alert(
                "⚠️ Bạn đã từ chối quyền Vị trí.\n\nĐể sử dụng tính năng định vị:\n1. Nhấn vào biểu tượng 🔒 hoặc ⚙️ trên thanh địa chỉ\n2. Chọn 'Location' → 'Allow'\n3. Tải lại trang"
              );
              setPermissions((prev) => ({ ...prev, geolocation: "denied" }));
              break;
            case error.POSITION_UNAVAILABLE:
              console.log("📍 GPS unavailable");
              alert("Không thể xác định vị trí. Kiểm tra GPS và mạng");
              break;
            case error.TIMEOUT:
              console.log("⏰ GPS timeout");
              alert("Timeout lấy vị trí GPS. Thử lại");
              break;
          }

          resolve(false);
        },
        options
      );
    });
  };

  // Yêu cầu tất cả quyền
  const requestAllPermissions = async (): Promise<{
    camera: boolean;
    geolocation: boolean;
  }> => {
    const [cameraGranted, geoGranted] = await Promise.all([
      requestCameraPermission(),
      requestGeolocationPermission(),
    ]);

    return {
      camera: cameraGranted,
      geolocation: geoGranted,
    };
  };

  // Initialize
  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    permissions,
    loading,
    requestCameraPermission,
    requestGeolocationPermission,
    requestAllPermissions,
    requestBasicCameraPermission,
    isMobile: isMobile(),
  };
}
