import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCollectorsList } from "@/hooks/use-collectors-api";
import leafletService, {
  type LatLng,
  type RouteResult,
} from "@/lib/leaflet-service";
import { CreateRouteRequest, RouteData, RouteStatus } from "@/types/route";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
}

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

interface RouteCreatorProps {
  onRouteCreated?: (route: RouteData) => void;
  initialData?: Partial<CreateRouteRequest>;
}

interface RoutePoint {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
  user_id?: string;
  isValid?: boolean;
  type?: "start" | "end" | "waypoint" | "pickup";
}

export function RouteCreator({
  onRouteCreated,
  initialData,
}: RouteCreatorProps) {
  const {
    collectors,
    loading: collectorsLoading,
    error: collectorsError,
  } = useCollectorsList();

  const [formData, setFormData] = useState<CreateRouteRequest>({
    name: "",
    description: "",
    assigned_collector_id: "",
    schedule_time: "",
    estimated_duration: 60,
    status: "DRAFT" as RouteStatus,
    pickup_points: [],
    ...initialData,
  });

  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLng>(
    leafletService.getDefaultCenter()
  );
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Optimize re-rendering with useMemo for map points (exclude address to prevent routing recalculation)
  const mapPoints = React.useMemo(() => {
    return routePoints.map((point, index) => ({
      id: point.id,
      lat: point.lat || 0,
      lng: point.lng || 0,
      address: point.address, // Include address for display but don't use in dependency
      type:
        index === 0
          ? ("start" as const)
          : index === routePoints.length - 1 && routePoints.length > 1
          ? ("end" as const)
          : ("pickup" as const),
    }));
  }, [routePoints.map((p) => `${p.id}-${p.lat}-${p.lng}`).join("|")]);

  // Debounced route calculation to avoid too many API calls
  const debouncedRouteCalculation = React.useCallback(
    debounce(async (points: RoutePoint[]) => {
      if (points.length < 2) {
        setRouteResult(null);
        return;
      }

      setIsCalculatingRoute(true);
      try {
        const validPoints = points.filter((p) => p.lat && p.lng);
        if (validPoints.length >= 2) {
          const routePoints = validPoints.map((p) => ({
            lat: p.lat!,
            lng: p.lng!,
          }));
          const routeData = await leafletService.calculateRoute(routePoints);

          setRouteResult(routeData);

          // Update form data with route info
          setFormData((prev) => ({
            ...prev,
            estimated_duration: routeData.duration,
            pickup_points: validPoints.map((p) => ({
              address: p.address,
              lat: p.lat!,
              lng: p.lng!,
              user_id: p.user_id,
            })),
          }));
        }
      } catch (error) {
        console.error("Failed to generate route:", error);
        setRouteResult(null);
      } finally {
        setIsCalculatingRoute(false);
      }
    }, 500), // 500ms debounce
    []
  );

  // Memoize coordinates to prevent routing recalculation when only address changes
  const routeCoordinates = useMemo(() => {
    return routePoints.map((point) => ({
      id: point.id,
      lat: point.lat,
      lng: point.lng,
      type: point.type,
    }));
  }, [routePoints.map((p) => `${p.id}-${p.lat}-${p.lng}-${p.type}`).join("|")]);

  useEffect(() => {
    console.log(
      "🔄 RouteCreator: Coordinates changed, triggering route calculation",
      routeCoordinates
    );
    debouncedRouteCalculation(routePoints);
  }, [routeCoordinates, debouncedRouteCalculation]);

  const generateRoute = async () => {
    try {
      const validPoints = routePoints.filter((p) => p.lat && p.lng);
      if (validPoints.length < 2) return;

      const points = validPoints.map((p) => ({ lat: p.lat!, lng: p.lng! }));
      const routeData = await leafletService.calculateRoute(points);

      setRouteResult(routeData);

      // Update form data with route info
      setFormData((prev: CreateRouteRequest) => ({
        ...prev,
        estimated_duration: routeData.duration,
        pickup_points: validPoints.map((p) => ({
          address: p.address,
          lat: p.lat!,
          lng: p.lng!,
          user_id: p.user_id,
        })),
      }));
    } catch (error) {
      console.error("Failed to generate route:", error);
      toast.error("Không thể tạo lộ trình");
    }
  };

  const addAddress = async () => {
    if (!newAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ");
      return;
    }

    try {
      console.log("Adding address:", newAddress);

      // Try to geocode the address using Leaflet service
      const coordinates = await leafletService.geocodeAddress(newAddress);
      console.log("Geocoded coordinates:", coordinates);

      const newPoint: RoutePoint = {
        id: Date.now().toString(),
        address: newAddress,
        lat: coordinates.lat,
        lng: coordinates.lng,
        isValid: true,
        type: routePoints.length === 0 ? "start" : "pickup",
      };

      setRoutePoints((prev) => {
        const updated = [...prev, newPoint];
        console.log("Updated route points:", updated);
        return updated;
      });
      setNewAddress("");

      // Update map center to the first point
      if (routePoints.length === 0) {
        setMapCenter(coordinates);
      }

      toast.success(`Đã thêm điểm thu gom: ${newAddress}`);
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Không thể tìm thấy địa chỉ. Vui lòng kiểm tra lại.");
    }
  };

  // Handle map click to add points - INSTANT UI UPDATE
  const handleMapClick = async (lat: number, lng: number) => {
    // 1. Immediately add point to UI for instant feedback
    const tempId = Date.now().toString();
    const tempPoint: RoutePoint = {
      id: tempId,
      address: `Điểm ${routePoints.length + 1}`, // Temporary name
      lat: lat,
      lng: lng,
      isValid: true,
      type: routePoints.length === 0 ? "start" : "pickup",
    };

    // Update UI immediately
    setRoutePoints((prev) => [...prev, tempPoint]);

    // Only update map center for the very first point to avoid zoom conflicts
    // if (routePoints.length === 0) {
    //   setMapCenter({ lat, lng });
    // }

    // 2. Then do background work (reverse geocoding) - delayed to avoid rapid API calls
    setTimeout(async () => {
      try {
        const address = await leafletService.reverseGeocode(lat, lng);

        // Update with real address (silent update - don't trigger routing recalculation)
        setRoutePoints((prev) =>
          prev.map((point) =>
            point.id === tempId ? { ...point, address: address } : point
          )
        );

        toast.success(`Đã thêm: ${address}`);
      } catch (error) {
        console.warn("Could not get address, using coordinates");
        toast.success(`Đã thêm điểm: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    }, 500); // 500ms delay to debounce reverse geocoding
  };

  const removePoint = (pointId: string) => {
    setRoutePoints((prev) => prev.filter((p) => p.id !== pointId));
  };

  const reorderPoints = (fromIndex: number, toIndex: number) => {
    const newPoints = [...routePoints];
    const [removed] = newPoints.splice(fromIndex, 1);
    newPoints.splice(toIndex, 0, removed);
    setRoutePoints(newPoints);
  };

  const optimizeRoute = async () => {
    if (routePoints.length < 3) {
      toast.error("Cần ít nhất 3 điểm để tối ưu hóa");
      return;
    }

    try {
      const validPoints = routePoints.filter((p) => p.lat && p.lng);
      const points = validPoints.map((p) => ({ lat: p.lat!, lng: p.lng! }));

      const optimizedData = await leafletService.optimizeRoute(points);

      // Reorder points based on optimization
      const reorderedPoints = optimizedData.waypoint_order.map(
        (index: number) => validPoints[index]
      );
      setRoutePoints(reorderedPoints);

      toast.success("Đã tối ưu hóa lộ trình");
    } catch (error) {
      toast.error("Không thể tối ưu hóa lộ trình");
    }
  };

  const createRoute = async () => {
    console.log("Creating route with data:", formData);
    console.log("Route points:", routePoints);

    if (
      !formData.name ||
      !formData.assigned_collector_id ||
      routePoints.length < 2
    ) {
      toast.error(
        "Vui lòng điền đầy đủ thông tin và có ít nhất 2 điểm thu gom"
      );
      return;
    }

    setIsCreating(true);
    try {
      const routeData = {
        ...formData,
        pickup_points: routePoints.map((p) => ({
          address: p.address,
          lat: p.lat!,
          lng: p.lng!,
          user_id: p.user_id || null,
        })),
        route_path: routeResult?.coordinates || [],
        total_distance_km: routeResult ? routeResult.distance / 1000 : 0,
      };

      console.log("Sending route data to API:", routeData);

      const response = await fetch("/api/admin/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData),
      });

      if (!response.ok) {
        throw new Error("Failed to create route");
      }

      const newRoute = await response.json();
      toast.success("Đã tạo lộ trình thành công");

      if (onRouteCreated) {
        onRouteCreated(newRoute);
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        assigned_collector_id: "",
        schedule_time: "",
        estimated_duration: 60,
        status: "DRAFT" as RouteStatus,
        pickup_points: [],
      });
      setRoutePoints([]);
      setRouteResult(null);
    } catch (error) {
      console.error("Error creating route:", error);
      toast.error("Không thể tạo lộ trình");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRouteUpdate = (route: RouteResult) => {
    setRouteResult(route);
    setFormData((prev) => ({
      ...prev,
      estimated_duration: route.duration,
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tạo Lộ Trình Thu Gom (Leaflet + OSRM)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="route-name">Tên lộ trình</Label>
              <Input
                id="route-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev: CreateRouteRequest) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Lộ trình khu vực A"
              />
            </div>

            <div>
              <Label htmlFor="collector">Người thu gom</Label>
              <Select
                value={formData.assigned_collector_id}
                onValueChange={(value) =>
                  setFormData((prev: CreateRouteRequest) => ({
                    ...prev,
                    assigned_collector_id: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn người thu gom" />
                </SelectTrigger>
                <SelectContent>
                  {collectors.map((collector) => (
                    <SelectItem key={collector.id} value={collector.id}>
                      {collector.name} - {collector.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="schedule-time">Thời gian bắt đầu</Label>
              <Input
                id="schedule-time"
                type="datetime-local"
                value={formData.schedule_time}
                onChange={(e) =>
                  setFormData((prev: CreateRouteRequest) => ({
                    ...prev,
                    schedule_time: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="duration">Thời gian dự kiến (phút)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimated_duration}
                onChange={(e) =>
                  setFormData((prev: CreateRouteRequest) => ({
                    ...prev,
                    estimated_duration: parseInt(e.target.value),
                  }))
                }
                min="30"
                step="15"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev: CreateRouteRequest) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Mô tả lộ trình..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Route Points */}
      <Card>
        <CardHeader>
          <CardTitle>Điểm Thu Gom</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Interactive Map for Point Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Chọn điểm trên bản đồ</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRoutePoints([])}
                  disabled={routePoints.length === 0}
                >
                  Xóa tất cả
                </Button>
                {routePoints.length >= 3 && (
                  <Button size="sm" variant="outline" onClick={optimizeRoute}>
                    Tối ưu hóa
                  </Button>
                )}
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Hướng dẫn:</strong>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Click trên bản đồ để thêm điểm thu gom</li>
                  <li>• Điểm đầu tiên (xanh) sẽ là điểm bắt đầu</li>
                  <li>• Điểm cuối cùng (đỏ) sẽ là điểm kết thúc</li>
                  <li>• Cần ít nhất 2 điểm để tạo lộ trình</li>
                </ul>
              </div>
            </div>

            <SimpleLeafletMap
              center={mapCenter}
              points={mapPoints}
              showRoute={mapPoints.length >= 2}
              autoFitBounds={false} // Disable auto-zoom to prevent re-render loops
              onRouteUpdate={handleRouteUpdate}
              onMapClick={handleMapClick}
              height="500px"
              zoom={13}
            />
          </div>

          {/* Manual Address Input (Optional) */}
          <div className="space-y-2">
            <h4 className="font-medium">
              Hoặc thêm địa chỉ thủ công (tùy chọn)
            </h4>
            <div className="flex gap-2">
              <Input
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Nhập địa chỉ cụ thể nếu cần..."
                onKeyPress={(e) => e.key === "Enter" && addAddress()}
              />
              <Button onClick={addAddress} disabled={!newAddress.trim()}>
                Thêm địa chỉ
              </Button>
            </div>

            {/* Quick Add Sample Points */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Điểm mẫu:</span>
              {[
                { name: "Bến Thành", lat: 10.7722, lng: 106.6986 },
                { name: "Nhà Thờ Đức Bà", lat: 10.7798, lng: 106.699 },
                { name: "Chợ Bình Tây", lat: 10.7558, lng: 106.652 },
                { name: "Thống Nhất", lat: 10.7881, lng: 106.7017 },
              ].map((point, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleMapClick(point.lat, point.lng)}
                  className="text-xs"
                >
                  {point.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Current Points */}
          {routePoints.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">
                  Các điểm đã thêm ({routePoints.length})
                </h4>
                {routePoints.length >= 3 && (
                  <Button size="sm" variant="outline" onClick={optimizeRoute}>
                    Tối ưu hóa
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {routePoints.map((point, index) => (
                  <div
                    key={point.id}
                    className="flex items-center gap-3 p-3 border rounded"
                  >
                    <Badge
                      variant={
                        index === 0
                          ? "default"
                          : index === routePoints.length - 1
                          ? "error"
                          : "info"
                      }
                    >
                      {index === 0
                        ? "Start"
                        : index === routePoints.length - 1
                        ? "End"
                        : index}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{point.address}</div>
                      {point.lat && point.lng && (
                        <div className="text-sm text-gray-500">
                          {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePoint(point.id)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {routeResult && (
            <Alert>
              <AlertDescription>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    Khoảng cách: {(routeResult.distance / 1000).toFixed(2)} km
                  </div>
                  <div>Thời gian dự kiến: {routeResult.duration} phút</div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={createRoute}
          disabled={
            isCreating ||
            !formData.name ||
            !formData.assigned_collector_id ||
            routePoints.length < 2
          }
          className="min-w-[120px]"
        >
          {isCreating ? "Đang tạo..." : "Tạo lộ trình"}
        </Button>
      </div>
    </div>
  );
}

export default RouteCreator;
