import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImagePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  aspectRatio?: "square" | "video";
  width?: number;
  height?: number;
  previewSize?: "sm" | "md" | "lg";
}

export function ImagePreview({
  src,
  alt = "Image",
  aspectRatio = "square",
  width = 32,
  height = 32,
  previewSize = "sm",
  className,
  ...props
}: ImagePreviewProps) {
  const previewSizeClasses = {
    sm: "max-w-[100px]",
    md: "max-w-[200px]",
    lg: "max-w-[300px]"
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={cn(
            "overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity",
            previewSizeClasses[previewSize],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full w-full",
              aspectRatio === "square" ? "aspect-square" : "aspect-video"
            )}
          >
            <img
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <div className="aspect-video w-full overflow-hidden rounded-md">
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 