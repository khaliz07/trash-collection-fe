"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

const SimpleLeafletMap = dynamic(
  () => import("@/components/ui/simple-leaflet-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  }
);

const samplePoints = [
  {
    id: "1",
    lat: 10.782834,
    lng: 106.698092,
    address: "54 Nguyễn Du, Quận 1, Hồ Chí Minh",
    type: "start" as const,
  },
  {
    id: "2",
    lat: 10.773317,
    lng: 106.700654,
    address: "123 Lê Lợi, Quận 1, Hồ Chí Minh",
    type: "pickup" as const,
  },
  {
    id: "3",
    lat: 10.776889,
    lng: 106.695677,
    address: "456 Hai Bà Trưng, Quận 3, Hồ Chí Minh",
    type: "end" as const,
  },
];

export default function TestLeafletPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Test Leaflet Maps</h1>

      <Card>
        <CardHeader>
          <CardTitle>Leaflet Map with OSRM Routing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Testing map with sample points in Ho Chi Minh City:</p>
            <ul className="space-y-1 text-sm">
              {samplePoints.map((point) => (
                <li key={point.id}>
                  <strong>{point.type.toUpperCase()}:</strong> {point.address}
                </li>
              ))}
            </ul>

            <SimpleLeafletMap
              center={{ lat: 10.776889, lng: 106.695677 }}
              points={samplePoints}
              showRoute={true}
              height="500px"
              zoom={14}
              onRouteUpdate={(route: any) => {
                console.log("Route updated:", route);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
