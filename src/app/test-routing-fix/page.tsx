"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import leafletService, { type LatLng } from "@/lib/leaflet-service";

// Dynamic import to prevent SSR issues
const SimpleLeafletMap = dynamic(
  () => import("@/components/ui/simple-leaflet-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  }
);

interface RoutePoint {
  id: string;
  address: string;
  lat: number;
  lng: number;
  type?: "start" | "end" | "waypoint" | "pickup";
}

export default function TestRoutingFixPage() {
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [mapCenter, setMapCenter] = useState<LatLng>(
    leafletService.getDefaultCenter()
  );

  const handleMapClick = async (lat: number, lng: number) => {
    const newPoint: RoutePoint = {
      id: Date.now().toString(),
      address: `Điểm ${points.length + 1}`,
      lat: lat,
      lng: lng,
      type: points.length === 0 ? "start" : "pickup",
    };

    setPoints((prev) => [...prev, newPoint]);

    if (points.length === 0) {
      setMapCenter({ lat, lng });
    }

    // Background reverse geocoding
    try {
      const address = await leafletService.reverseGeocode(lat, lng);
      setPoints((prev) =>
        prev.map((point) =>
          point.id === newPoint.id ? { ...point, address } : point
        )
      );
    } catch (error) {
      console.warn("Could not get address");
    }
  };

  const clearPoints = () => {
    setPoints([]);
  };

  const addSamplePoints = () => {
    const samplePoints: RoutePoint[] = [
      {
        id: "1",
        address: "Bến Thành Market",
        lat: 10.7722,
        lng: 106.6986,
        type: "start",
      },
      {
        id: "2",
        address: "Nhà Thờ Đức Bà",
        lat: 10.7798,
        lng: 106.699,
        type: "pickup",
      },
      {
        id: "3",
        address: "Chợ Bình Tây",
        lat: 10.7558,
        lng: 106.652,
        type: "end",
      },
    ];
    setPoints(samplePoints);
  };

  const mapPoints = points.map((point, index) => ({
    id: point.id,
    lat: point.lat,
    lng: point.lng,
    address: point.address,
    type:
      index === 0
        ? ("start" as const)
        : index === points.length - 1 && points.length > 1
        ? ("end" as const)
        : ("pickup" as const),
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Routing Fix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={addSamplePoints} variant="outline">
              Thêm điểm mẫu
            </Button>
            <Button onClick={clearPoints} variant="outline">
              Xóa tất cả
            </Button>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Hướng dẫn:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Click trên bản đồ để thêm điểm</li>
                <li>• Có ít nhất 2 điểm để hiện tuyến đường</li>
                <li>• Quan sát console để debug lỗi</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <SimpleLeafletMap
              center={mapCenter}
              points={mapPoints}
              showRoute={mapPoints.length >= 2}
              onMapClick={handleMapClick}
              height="400px"
              zoom={13}
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              Điểm đã thêm ({points.length}):
            </h4>
            {points.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có điểm nào</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {points.map((point, index) => (
                  <div
                    key={point.id}
                    className="flex items-center gap-2 p-2 border rounded text-sm"
                  >
                    <span className="font-medium">{index + 1}.</span>
                    <span className="flex-1">{point.address}</span>
                    <span className="text-xs text-gray-500">
                      {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
