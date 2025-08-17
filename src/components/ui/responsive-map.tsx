"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Maximize2,
  Minimize2,
  Navigation,
  MapPin,
  Layers,
  Locate,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface ResponsiveMapProps {
  children: React.ReactNode;
  className?: string;
  height?: string | number;
  showControls?: boolean;
  allowFullscreen?: boolean;
  showLocationButton?: boolean;
  showLayersButton?: boolean;
  onLocationRequest?: () => void;
  onLayerToggle?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
}

const ResponsiveMapContainer = React.forwardRef<
  HTMLDivElement,
  ResponsiveMapProps
>(
  (
    {
      className,
      children,
      height = "600px",
      showControls = true,
      allowFullscreen = true,
      showLocationButton = true,
      showLayersButton = false,
      onLocationRequest,
      onLayerToggle,
      onZoomIn,
      onZoomOut,
      onReset,
      ...props
    },
    ref
  ) => {
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Handle escape key to exit fullscreen
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isFullscreen) {
          setIsFullscreen(false);
        }
      };

      if (isFullscreen) {
        document.addEventListener("keydown", handleEscape);
        // Prevent body scroll when in fullscreen
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }, [isFullscreen]);

    const mapContent = (
      <div
        className={cn(
          "relative w-full overflow-hidden",
          isFullscreen
            ? "w-full h-full rounded-lg border border-border/50"
            : "rounded-lg border",
          className
        )}
        style={{ height: isFullscreen ? "100%" : height }}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              height: isFullscreen ? "100%" : height,
            });
          }
          return child;
        })}

        {/* Fullscreen exit button - prominent position */}
        {showControls && isFullscreen && (
          <div className="absolute top-4 left-4 z-[1000]">
            <Button
              size="sm"
              variant="secondary"
              className="h-10 px-3 bg-white/95 hover:bg-white shadow-lg border"
              onClick={() => setIsFullscreen(false)}
              title="Thoát toàn màn hình"
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              <span className="text-sm">Thoát</span>
            </Button>
          </div>
        )}

        {/* Mobile-optimized controls */}
        {showControls && (
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            {/* Zoom controls - always visible */}
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                onClick={onZoomIn}
                title="Phóng to"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                onClick={onZoomOut}
                title="Thu nhỏ"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Additional controls for larger screens */}
            <div className="hidden sm:flex flex-col gap-1">
              {showLocationButton && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                  onClick={onLocationRequest}
                  title="Vị trí của tôi"
                >
                  <Locate className="h-4 w-4" />
                </Button>
              )}

              {showLayersButton && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                  onClick={onLayerToggle}
                  title="Lớp bản đồ"
                >
                  <Layers className="h-4 w-4" />
                </Button>
              )}

              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                onClick={onReset}
                title="Đặt lại"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              {allowFullscreen && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Mobile bottom controls */}
        {showControls && isMobile && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] flex justify-center">
            <Card className="p-2">
              <div className="flex items-center gap-2">
                {showLocationButton && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={onLocationRequest}
                    title="Vị trí của tôi"
                  >
                    <Locate className="h-4 w-4" />
                  </Button>
                )}

                {showLayersButton && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={onLayerToggle}
                    title="Lớp bản đồ"
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={onReset}
                  title="Đặt lại"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                {allowFullscreen && (
                  <Button
                    size="sm"
                    variant="default"
                    className="h-8 px-3 text-xs"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="h-3 w-3 mr-1" />
                        Thoát
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3 w-3 mr-1" />
                        Mở rộng
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    );

    if (isFullscreen) {
      return (
        <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm overflow-hidden flex items-center justify-center p-4">
          <div className="w-full h-[90vh] max-w-[98vw] shadow-2xl rounded-lg overflow-hidden">
            {mapContent}
          </div>
        </div>
      );
    }

    return mapContent;
  }
);
ResponsiveMapContainer.displayName = "ResponsiveMapContainer";

interface MapInfoPanelProps {
  children: React.ReactNode;
  title?: string;
  trigger?: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
}

const MapInfoPanel: React.FC<MapInfoPanelProps> = ({
  children,
  title = "Thông tin",
  trigger,
  side = "bottom",
  className,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              {title}
            </Button>
          )}
        </SheetTrigger>
        <SheetContent
          side={side}
          className={cn("w-[90vw] sm:w-[540px]", className)}
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card className={cn("max-w-sm", className)}>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
};

interface LocationListProps {
  locations: Array<{
    id: string;
    name: string;
    address: string;
    status?: string;
    statusText?: string;
    distance?: string;
    time?: string;
  }>;
  onLocationSelect?: (id: string) => void;
  className?: string;
}

const LocationList: React.FC<LocationListProps> = ({
  locations,
  onLocationSelect,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {locations.map((location) => (
        <Card
          key={location.id}
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onLocationSelect?.(location.id)}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm truncate">
                  {location.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {location.address}
                </p>
                {(location.distance || location.time) && (
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {location.distance && (
                      <span className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        {location.distance}
                      </span>
                    )}
                    {location.time && <span>{location.time}</span>}
                  </div>
                )}
              </div>
              {location.status && (
                <div className="flex-shrink-0">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      location.status === "completed" &&
                        "bg-green-100 text-green-800",
                      location.status === "in-progress" &&
                        "bg-blue-100 text-blue-800",
                      location.status === "pending" &&
                        "bg-yellow-100 text-yellow-800",
                      location.status === "skipped" && "bg-red-100 text-red-800"
                    )}
                  >
                    {location.statusText || location.status}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export { ResponsiveMapContainer, MapInfoPanel, LocationList };
