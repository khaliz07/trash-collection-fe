"use client";
import { useEffect, useState, useCallback } from "react";
import { LeafletMap } from "@/components/ui/leaflet-map";
import { Button } from "@/components/ui/button";
import { CollectionPoint, CollectionStatus } from "@/types/collection";
import { mockMapCollectionPoints } from "./mockData";
import { FilterBar } from "./FilterBar";
import { CollectionPointMapPopup } from "./CollectionPointMapPopup";
import { UserLocation } from "./types";
import leafletService, { type LatLng } from "@/lib/leaflet-service";

const STATUS_COLORS = {
  [CollectionStatus.PENDING]: "#f59e42",
  [CollectionStatus.IN_PROGRESS]: "#3b82f6",
  [CollectionStatus.COMPLETED]: "#22c55e",
  [CollectionStatus.CANNOT_COLLECT]: "#ef4444",
};

function useCurrentLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      () => setLocation(null),
      { enableHighAccuracy: true }
    );
  }, []);
  return location;
}

export function MapView() {
  const [filterStatus, setFilterStatus] = useState<CollectionStatus[]>([]);
  const [search, setSearch] = useState("");
  const [points, setPoints] = useState<CollectionPoint[]>(
    mockMapCollectionPoints
  );
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(
    null
  );
  const userLocation = useCurrentLocation();

  // Filter points
  const filteredPoints = points.filter((point) => {
    const matchesStatus =
      filterStatus.length === 0 || filterStatus.includes(point.status);
    const matchesSearch =
      !search ||
      point.address.toLowerCase().includes(search.toLowerCase()) ||
      point.wasteType.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Convert collection points to map points format
  const mapPoints = filteredPoints.map((point) => ({
    id: point.id,
    lat: point.location.lat,
    lng: point.location.lng,
    address: point.address,
    type: "pickup" as const,
    status: point.status,
    wasteType: point.wasteType,
  }));

  // Add user location if available
  const allMapPoints = userLocation
    ? [
        {
          id: "user-location",
          lat: userLocation.lat,
          lng: userLocation.lng,
          address: "Vị trí của bạn",
          type: "user" as const,
        },
        ...mapPoints,
      ]
    : mapPoints;

  // Calculate center point
  const center: LatLng =
    filteredPoints.length > 0
      ? {
          lat:
            filteredPoints.reduce((sum, p) => sum + p.location.lat, 0) /
            filteredPoints.length,
          lng:
            filteredPoints.reduce((sum, p) => sum + p.location.lng, 0) /
            filteredPoints.length,
        }
      : leafletService.getDefaultCenter();

  const handleUpdatePoint = useCallback((updatedPoint: CollectionPoint) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === updatedPoint.id ? updatedPoint : p))
    );
    setSelectedPoint(updatedPoint);
  }, []);

  const handleMarkerClick = (pointId: string) => {
    const point = points.find((p) => p.id === pointId);
    if (point) {
      setSelectedPoint(point);
      setActivePointId(pointId);
    }
  };

  const handleMapClick = () => {
    setSelectedPoint(null);
    setActivePointId(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filter Bar */}
      <div className="mb-4">
        <FilterBar
          status={filterStatus}
          onStatusChange={setFilterStatus}
          search={search}
          onSearchChange={setSearch}
        />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <LeafletMap
          center={center}
          points={allMapPoints}
          height="60vh"
          zoom={13}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          showRoute={false}
        />

        {/* Collection Point Popup */}
        {selectedPoint && (
          <div className="absolute top-4 right-4 z-[1000] max-w-md">
            <div className="bg-white p-4 rounded-lg shadow-lg border">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{selectedPoint.address}</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedPoint(null);
                    setActivePointId(null);
                  }}
                >
                  ✕
                </Button>
              </div>
              <CollectionPointMapPopup
                point={selectedPoint}
                onCheckIn={() => {
                  // Handle check in
                  const updatedPoint = {
                    ...selectedPoint,
                    checkInTime: new Date().toISOString(),
                  };
                  handleUpdatePoint(updatedPoint);
                }}
                onNavigate={() => {
                  // Handle navigation
                  window.open(
                    `https://maps.google.com/maps?q=${selectedPoint.location.lat},${selectedPoint.location.lng}`
                  );
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_COLORS).map(([status, color]) => {
          const count = filteredPoints.filter(
            (p) => p.status === status
          ).length;
          return (
            <div
              key={status}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div>
                <div className="text-sm font-medium">
                  {getStatusLabel(status as CollectionStatus)}
                </div>
                <div className="text-lg font-bold">{count}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getStatusLabel(status: CollectionStatus): string {
  switch (status) {
    case CollectionStatus.PENDING:
      return "Chờ thu gom";
    case CollectionStatus.IN_PROGRESS:
      return "Đang thu gom";
    case CollectionStatus.COMPLETED:
      return "Hoàn thành";
    case CollectionStatus.CANNOT_COLLECT:
      return "Không thể thu gom";
    default:
      return status;
  }
}

export default MapView;
