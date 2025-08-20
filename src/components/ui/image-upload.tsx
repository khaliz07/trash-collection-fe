"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { convertFileToBase64, isValidImageFile, compressImage } from "@/lib/image-utils";
import { toast } from "sonner";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSize?: number; // in MB
  className?: string;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  maxSize = 5,
  className
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed max limit
    if (images.length + files.length > maxImages) {
      toast.error(`Chỉ có thể tải lên tối đa ${maxImages} ảnh`);
      return;
    }

    setUploading(true);

    try {
      const newImages: string[] = [];

      for (const file of files) {
        // Validate file
        if (!isValidImageFile(file)) {
          toast.error(`File ${file.name} không hợp lệ. Chỉ chấp nhận ảnh JPEG, PNG, GIF, WebP dưới ${maxSize}MB`);
          continue;
        }

        // Convert to base64
        const base64 = await convertFileToBase64(file);
        
        // Compress image if needed
        const compressedBase64 = await compressImage(base64, 800, 0.8);
        newImages.push(compressedBase64);
      }

      onImagesChange([...images, ...newImages]);
      
      if (newImages.length > 0) {
        toast.success(`Đã tải lên ${newImages.length} ảnh`);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Có lỗi xảy ra khi tải ảnh");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Upload button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= maxImages}
            className="w-full"
          >
            {uploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Tải ảnh ({images.length}/{maxImages})
              </>
            )}
          </Button>
        </div>

        {/* Image preview grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <Card key={index} className="relative group overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image}
                    alt={`Ảnh ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Helper text */}
        <p className="text-xs text-muted-foreground">
          Chấp nhận ảnh JPEG, PNG, GIF, WebP. Tối đa {maxImages} ảnh, mỗi ảnh dưới {maxSize}MB.
        </p>
      </div>
    </div>
  );
}
