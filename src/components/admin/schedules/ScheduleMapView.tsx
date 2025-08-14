import * as React from "react";
import dynamic from "next/dynamic";
import type { SchedulePoint } from "./types";
import { RouteWithUrgents, UrgentPoint } from "@/types/route";
import leafletService, { type LatLng } from "@/lib/leaflet-service";

// Dynamic import to prevent SSR issues
const SimpleLeafletMap = dynamic(
  () => import("@/components/ui/simple-leaflet-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[220px] flex items-center justify-center text-gray-400 border rounded-lg">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  }
);

export interface ScheduleMapViewProps {
  points: SchedulePoint[];
}

export interface EnhancedScheduleMapViewProps {
  routeData: RouteWithUrgents;
  height?: number;
}

// Legacy component for backward compatibility with Leaflet
export function ScheduleMapView({ points }: ScheduleMapViewProps) {
  if (!points || points.length === 0) {
    return (
      <div className="w-full h-[220px] flex items-center justify-center text-gray-400 border rounded-lg">
        Không có điểm nào để hiển thị
      </div>
    );
  }

  // Convert SchedulePoint to map points format
  const mapPoints = points.map((point, index) => ({
    id: point.id || index.toString(),
    lat: point.lat,
    lng: point.lng,
    address: point.address || `Điểm ${index + 1}`,
    type:
      index === 0
        ? ("start" as const)
        : index === points.length - 1
        ? ("end" as const)
        : ("pickup" as const),
  }));

  // Calculate center point
  const center: LatLng = {
    lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length,
  };

  return (
    <SimpleLeafletMap
      center={center}
      points={mapPoints}
      showRoute={points.length >= 2}
      height="220px"
      zoom={13}
    />
  );
}

// Enhanced component for new features with Leaflet
export function EnhancedScheduleMapView({
  routeData,
  height = 400,
}: EnhancedScheduleMapViewProps) {
  if (!routeData) {
    return (
      <div
        className="w-full flex items-center justify-center text-gray-400 border rounded-lg"
        style={{ height: `${height}px` }}
      >
        Không có dữ liệu lộ trình
      </div>
    );
  }

  // Convert route data to map points
  const mapPoints: any[] = [];
  let center: LatLng = leafletService.getDefaultCenter();

  // Sample pickup points (since RouteWithUrgents doesn't have pickup_points)
  const samplePickupPoints = [
    { lat: 10.762622, lng: 106.660172, address: "54 Nguyễn Du, Q1" },
    { lat: 10.772622, lng: 106.670172, address: "123 Lê Lợi, Q1" },
    { lat: 10.782622, lng: 106.680172, address: "456 Hai Bà Trưng, Q3" },
  ];

  // Add sample pickup points
  samplePickupPoints.forEach((point, index) => {
    mapPoints.push({
      id: `pickup-${index}`,
      lat: point.lat,
      lng: point.lng,
      address: point.address,
      type:
        index === 0
          ? ("start" as const)
          : index === samplePickupPoints.length - 1
          ? ("end" as const)
          : ("pickup" as const),
    });
  });

  // Calculate center from pickup points
  if (mapPoints.length > 0) {
    center = {
      lat: mapPoints.reduce((sum, p) => sum + p.lat, 0) / mapPoints.length,
      lng: mapPoints.reduce((sum, p) => sum + p.lng, 0) / mapPoints.length,
    };
  }

  // Add urgent points
  if (routeData.urgent_points && routeData.urgent_points.length > 0) {
    routeData.urgent_points.forEach((urgent: UrgentPoint, index: number) => {
      mapPoints.push({
        id: `urgent-${urgent.id}`,
        lat: urgent.pickup_lat,
        lng: urgent.pickup_lng,
        address: urgent.pickup_address,
        type: "urgent" as const,
        urgentLevel: urgent.urgency_level,
      });
    });
  }

  if (mapPoints.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-gray-400 border rounded-lg"
        style={{ height: `${height}px` }}
      >
        Không có điểm nào để hiển thị
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Route Info */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Điểm thu gom: {samplePickupPoints.length}</span>
        <span>Yêu cầu khẩn cấp: {routeData.urgent_points?.length || 0}</span>
        {routeData.route.total_distance_km && (
          <span>
            Khoảng cách: {routeData.route.total_distance_km.toFixed(2)} km
          </span>
        )}
        {routeData.route.estimated_time_min && (
          <span>Thời gian: {routeData.route.estimated_time_min} phút</span>
        )}
      </div>

      {/* Map */}
      <SimpleLeafletMap
        center={center}
        points={mapPoints}
        showRoute={mapPoints.length >= 2}
        height="400px"
        zoom={12}
        onRouteUpdate={(route) => {
          console.log("Route updated:", route);
        }}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Điểm bắt đầu</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>Điểm thu gom</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Điểm kết thúc</span>
        </div>
        {routeData.urgent_points && routeData.urgent_points.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Yêu cầu khẩn cấp</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScheduleMapView;
