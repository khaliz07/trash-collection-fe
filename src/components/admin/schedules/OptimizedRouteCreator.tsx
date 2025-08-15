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
import { debounce } from "@/lib/utils";
import { CreateRouteRequest, RouteData, RouteStatus } from "@/types/route";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Dynamic import to prevent SSR issues
const SimpleLeafletMap = dynamic(
  () => import("@/components/ui/simple-leaflet-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[350px] flex items-center justify-center bg-gray-100 rounded-lg">
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

export function OptimizedRouteCreator({
  onRouteCreated,
  initialData,
}: RouteCreatorProps) {
  // Get collectors from API
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
  const [isCreating, setIsCreating] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLng>(
    leafletService.getDefaultCenter()
  );
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Optimize re-rendering with useMemo for map points
  const mapPoints = React.useMemo(() => {
    return routePoints.map((point, index) => ({
      id: point.id,
      lat: point.lat || 0,
      lng: point.lng || 0,
      address: point.address,
      type:
        index === 0
          ? ("start" as const)
          : index === routePoints.length - 1 && routePoints.length > 1
          ? ("end" as const)
          : ("pickup" as const),
    }));
  }, [routePoints]);

  // Debounced route calculation to avoid too many API calls
  const debouncedRouteCalculation = useCallback(
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

  useEffect(() => {
    debouncedRouteCalculation(routePoints);
  }, [routePoints, debouncedRouteCalculation]);

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

    // Update map center if first point
    if (routePoints.length === 0) {
      setMapCenter({ lat, lng });
    }

    // 2. Then do background work (reverse geocoding)
    try {
      const address = await leafletService.reverseGeocode(lat, lng);

      // Update with real address
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
  };

  const removePoint = (pointId: string) => {
    setRoutePoints((prev) => prev.filter((p) => p.id !== pointId));
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
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Thông tin cơ bản
            <div className="text-sm font-normal text-gray-600">
              {collectorsLoading
                ? "Đang tải collectors..."
                : `${collectors.length} collector có sẵn`}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="route-name">Tên lộ trình</Label>
              <Input
                id="route-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Lộ trình khu vực A"
              />
            </div>

            <div>
              <Label htmlFor="collector">Người thu gom</Label>
              {collectorsError && (
                <div className="text-sm text-red-600 mb-2">
                  ⚠️ Lỗi tải danh sách collector: {collectorsError}
                </div>
              )}
              <Select
                value={formData.assigned_collector_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    assigned_collector_id: value,
                  }))
                }
                disabled={collectorsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      collectorsLoading ? "Đang tải..." : "Chọn người thu gom"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {collectorsLoading ? (
                    <SelectItem value="" disabled>
                      Đang tải...
                    </SelectItem>
                  ) : collectorsError ? (
                    <SelectItem value="" disabled>
                      Lỗi tải dữ liệu
                    </SelectItem>
                  ) : collectors.length === 0 ? (
                    <SelectItem value="" disabled>
                      Không có collector nào
                    </SelectItem>
                  ) : (
                    collectors.map((collector) => (
                      <SelectItem key={collector.id} value={collector.id}>
                        {collector.name} - {collector.phone}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* Show selected collector info */}
              {formData.assigned_collector_id && !collectorsLoading && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  <div className="text-blue-800">
                    <strong>Đã chọn:</strong>{" "}
                    {
                      collectors.find(
                        (c) => c.id === formData.assigned_collector_id
                      )?.name
                    }{" "}
                    -{" "}
                    {
                      collectors.find(
                        (c) => c.id === formData.assigned_collector_id
                      )?.phone
                    }
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="schedule-time">Thời gian bắt đầu</Label>
              <Input
                id="schedule-time"
                type="datetime-local"
                value={formData.schedule_time}
                onChange={(e) =>
                  setFormData((prev) => ({
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
                  setFormData((prev) => ({
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
                setFormData((prev) => ({
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

      {/* Route Planning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Map */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lựa chọn điểm thu gom</CardTitle>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Click trên bản đồ</strong> để thêm điểm thu gom.
                {routePoints.length === 0 &&
                  " Điểm đầu tiên sẽ là điểm bắt đầu."}
                {routePoints.length >= 2 && " ✅ Lộ trình đã hiển thị!"}
              </div>
            </div>

            {/* Fixed Height Map */}
            <div className="border rounded-lg overflow-hidden">
              <SimpleLeafletMap
                center={mapCenter}
                points={mapPoints}
                showRoute={mapPoints.length >= 2}
                onRouteUpdate={handleRouteUpdate}
                onMapClick={handleMapClick}
                height="350px"
                zoom={13}
              />
            </div>

            {/* Route Status */}
            {isCalculatingRoute && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                Đang tính toán lộ trình...
              </div>
            )}

            {routeResult && (
              <Alert>
                <AlertDescription>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      Khoảng cách: {(routeResult.distance / 1000).toFixed(2)} km
                    </div>
                    <div>Thời gian: {routeResult.duration} phút</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Sample Points */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Điểm mẫu nhanh:</h4>
              <div className="flex flex-wrap gap-2">
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
          </CardContent>
        </Card>

        {/* Right: Points List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Danh sách điểm ({routePoints.length})
              {mapPoints.length >= 2 && (
                <Badge variant="success" className="text-xs">
                  Có lộ trình
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {routePoints.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="mb-4">📍</div>
                <p>Chưa có điểm nào</p>
                <p className="text-sm">
                  Click trên bản đồ để thêm điểm thu gom
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {routePoints.map((point, index) => (
                  <div
                    key={point.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Badge
                      variant={
                        index === 0
                          ? "default"
                          : index === routePoints.length - 1 &&
                            routePoints.length > 1
                          ? "error"
                          : "info"
                      }
                    >
                      {index === 0
                        ? "Bắt đầu"
                        : index === routePoints.length - 1 &&
                          routePoints.length > 1
                        ? "Kết thúc"
                        : `${index + 1}`}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {point.address}
                      </div>
                      <div className="text-xs text-gray-500">
                        {point.lat?.toFixed(6)}, {point.lng?.toFixed(6)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePoint(point.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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

export default OptimizedRouteCreator;
