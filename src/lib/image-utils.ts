/**
 * Kiểm tra xem file ảnh có được tạo trong vòng 5 phút gần đây không
 * @param file File ảnh cần kiểm tra
 * @returns true nếu ảnh được tạo trong vòng 5 phút, false nếu không
 */
export function isImageRecentlyTaken(file: File): boolean {
  const now = Date.now();
  const fileTime = file.lastModified;
  const fiveMinutesInMs = 5 * 60 * 1000; // 5 phút = 5 * 60 * 1000 ms

  return now - fileTime <= fiveMinutesInMs;
}

/**
 * Lấy thời gian tạo file dưới dạng string dễ đọc
 * @param file File cần lấy thời gian
 * @returns Chuỗi thời gian định dạng
 */
export function getFileCreationTime(file: File): string {
  const date = new Date(file.lastModified);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Tính toán thời gian đã trôi qua từ khi tạo file
 * @param file File cần tính thời gian
 * @returns Chuỗi mô tả thời gian đã trôi qua
 */
export function getTimeSinceCreation(file: File): string {
  const now = Date.now();
  const fileTime = file.lastModified;
  const diffMs = now - fileTime;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (diffMinutes > 0) {
    return `${diffMinutes} phút ${diffSeconds} giây trước`;
  } else {
    return `${diffSeconds} giây trước`;
  }
}

/**
 * Kiểm tra xem file có phải là ảnh được chụp gần đây không
 * Kiểm tra cả lastModified và size để phát hiện ảnh cũ được copy
 * @param file File ảnh cần kiểm tra
 * @returns true nếu ảnh có thể được chấp nhận
 */
export function validateImageFreshness(file: File): {
  isValid: boolean;
  reason?: string;
  timeSince: string;
} {
  const timeSince = getTimeSinceCreation(file);

  // Kiểm tra thời gian cơ bản
  if (!isImageRecentlyTaken(file)) {
    return {
      isValid: false,
      reason: "Ảnh không được chụp trong vòng 5 phút gần đây",
      timeSince,
    };
  }

  // Các kiểm tra bổ sung cho ảnh mobile
  const now = Date.now();
  const fileTime = file.lastModified;
  const diffMs = now - fileTime;

  // Nếu ảnh được tạo quá gần hiện tại (< 1 giây), có thể là ảnh được copy
  if (diffMs < 1000 && file.size > 1024 * 1024) {
    // > 1MB
    return {
      isValid: false,
      reason: "Ảnh có thể đã được copy hoặc chỉnh sửa",
      timeSince,
    };
  }

  return {
    isValid: true,
    timeSince,
  };
}

/**
 * Tạo file ảnh mới với timestamp hiện tại (cho camera capture)
 * @param blob Blob data của ảnh
 * @param filename Tên file (tùy chọn)
 * @returns File object với timestamp hiện tại
 */
export function createTimestampedImageFile(
  blob: Blob,
  filename?: string
): File {
  const timestamp = Date.now();
  const name = filename || `checkin-${timestamp}.jpg`;

  return new File([blob], name, {
    type: blob.type || "image/jpeg",
    lastModified: timestamp,
  });
}

// Support system image utilities
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function isValidImageFile(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  return allowedTypes.includes(file.type) && file.size <= maxSize;
}

export function getImageDimensions(
  base64: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = base64;
  });
}

export function compressImage(
  base64: string,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedBase64);
    };
    img.onerror = reject;
    img.src = base64;
  });
}
