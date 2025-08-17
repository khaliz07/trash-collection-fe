import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { AddressSelector } from "@/components/ui/address-selector";
import api from "@/lib/api";
import leafletService, {
  type LatLng,
  type RouteResult,
} from "@/lib/leaflet-service";
import { RouteStatus } from "@/types/route";
import { CreateSimpleRouteRequest, SimpleRoute } from "@/types/simple-route";
import { AdministrativeAddress } from "@/types/address";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  onRouteCreated?: (route: SimpleRoute) => void;
  onRouteDeleted?: (routeId: string) => void; // For delete functionality
  initialData?: Partial<CreateSimpleRouteRequest>;
  mode?: "create" | "edit";
  routeId?: string; // For edit mode
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
  onRouteDeleted,
  initialData,
  mode = "create",
  routeId,
}: RouteCreatorProps) {
  const [formData, setFormData] = useState<CreateSimpleRouteRequest>({
    name: "",
    description: "",
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
  const [addressErrors, setAddressErrors] = useState<string[]>([]);
  const [isAddressValid, setIsAddressValid] = useState(true);
  const isCreatingRef = useRef(false); // Additional protection against double-calls

  // Load route points from initialData for edit mode
  useEffect(() => {
    if (mode === "edit" && initialData?.pickup_points) {
      const points: RoutePoint[] = initialData.pickup_points.map(
        (point, index) => ({
          id: `point-${index}`,
          address: point.address,
          lat: point.lat,
          lng: point.lng,
          user_id: point.user_id,
          isValid: true,
          type: index === 0 ? "start" : "pickup",
        })
      );
      setRoutePoints(points);

      // Set map center to first point
      if (points.length > 0 && points[0].lat && points[0].lng) {
        setMapCenter({ lat: points[0].lat, lng: points[0].lng });
      }
    }
  }, [mode, initialData]);

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
            ...(mode == "create" && { estimated_duration: routeData.duration }),
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

  // Address selection handlers
  const handleAddressChange = (address: AdministrativeAddress) => {
    setFormData(prev => ({
      ...prev,
      address: address
    }));
  };

  const handleAddressValidationChange = (isValid: boolean, errors: string[]) => {
    setIsAddressValid(isValid);
    setAddressErrors(errors);
  };

  const createRoute = React.useCallback(async () => {
    // Double protection against multiple calls
    if (isCreating || isCreatingRef.current) {
      console.log("Route creation already in progress, skipping...");
      return;
    }

    console.log("Creating route with data:", formData);

    if (!formData.name || routePoints.length < 2) {
      toast.error(
        "Vui lòng điền đầy đủ thông tin và có ít nhất 2 điểm thu gom"
      );
      return;
    }

    // Address validation is now enabled for create route
    if (!isAddressValid || addressErrors.length > 0) {
      toast.error("Vui lòng kiểm tra và chọn địa chỉ hành chính hợp lệ");
      return;
    }

    // Set both state and ref
    setIsCreating(true);
    isCreatingRef.current = true;

    try {
      const routeData = {
        ...formData,
        pickup_points: routePoints
          .filter((p) => p.lat && p.lng) // Only include valid points
          .map((p) => ({
            address: p.address,
            lat: p.lat!,
            lng: p.lng!,
            user_id: p.user_id,
          })),
        total_distance_km: routeResult ? routeResult.distance / 1000 : 0,
      };

      console.log("Sending route data to API:", routeData);

      const response = await api.post("/admin/routes", routeData);
      const newRoute = response.data;

      console.log("Route created successfully:", newRoute);
      toast.success("Đã tạo lộ trình thành công");

      if (onRouteCreated) {
        onRouteCreated(newRoute);
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
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
      // Reset both state and ref
      setIsCreating(false);
      isCreatingRef.current = false;
    }
  }, [isCreating, formData, routePoints, routeResult, onRouteCreated]);

  const updateRoute = React.useCallback(async () => {
    // Double protection against multiple calls
    if (isCreating || isCreatingRef.current) {
      console.log("Route update already in progress, skipping...");
      return;
    }

    if (!routeId) {
      toast.error("Không tìm thấy ID lộ trình để cập nhật");
      return;
    }

    console.log("Updating route with ID:", routeId, "data:", formData);

    if (!formData.name || routePoints.length < 2) {
      toast.error(
        "Vui lòng điền đầy đủ thông tin và có ít nhất 2 điểm thu gom"
      );
      return;
    }

    // Address validation is now enabled for update route
    if (!isAddressValid || addressErrors.length > 0) {
      toast.error("Vui lòng kiểm tra và chọn địa chỉ hành chính hợp lệ");
      return;
    }

    // Set both state and ref
    setIsCreating(true);
    isCreatingRef.current = true;

    try {
      const routeData = {
        ...formData,
        pickup_points: routePoints
          .filter((p) => p.lat && p.lng) // Only include valid points
          .map((p) => ({
            address: p.address,
            lat: p.lat!,
            lng: p.lng!,
            user_id: p.user_id,
          })),
        total_distance_km: routeResult ? routeResult.distance / 1000 : 0,
      };

      console.log("Sending route update data to API:", routeData);

      const response = await api.put(`/admin/routes/${routeId}`, routeData);
      const updatedRoute = response.data;

      console.log("Route updated successfully:", updatedRoute);
      toast.success("Đã cập nhật lộ trình thành công");

      if (onRouteCreated) {
        onRouteCreated(updatedRoute);
      }
    } catch (error) {
      console.error("Error updating route:", error);
      toast.error("Không thể cập nhật lộ trình");
    } finally {
      // Reset both state and ref
      setIsCreating(false);
      isCreatingRef.current = false;
    }
  }, [isCreating, formData, routePoints, routeResult, onRouteCreated, routeId]);

  const deleteRoute = React.useCallback(async () => {
    if (!routeId) {
      toast.error("Không tìm thấy ID lộ trình để xóa");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa lộ trình này không?")) {
      return;
    }

    // Double protection against multiple calls
    if (isCreating || isCreatingRef.current) {
      console.log("Route operation already in progress, skipping delete...");
      return;
    }

    console.log("Deleting route with ID:", routeId);

    // Set both state and ref
    setIsCreating(true);
    isCreatingRef.current = true;

    try {
      const response = await api.delete(`/admin/routes/${routeId}`);

      console.log("Route deleted successfully");
      toast.success("Đã xóa lộ trình thành công");

      if (onRouteDeleted) {
        onRouteDeleted(routeId);
      }
    } catch (error) {
      console.error("Error deleting route:", error);
      toast.error("Không thể xóa lộ trình");
    } finally {
      // Reset both state and ref
      setIsCreating(false);
      isCreatingRef.current = false;
    }
  }, [isCreating, routeId, onRouteDeleted]);

  const handleSubmit = React.useCallback(async () => {
    if (mode === "edit") {
      await updateRoute();
    } else {
      await createRoute();
    }
  }, [mode, updateRoute, createRoute]);

  // Debounced create route function
  const debouncedCreateRoute = React.useCallback(
    debounce(createRoute, 1000), // 1 second debounce
    [createRoute]
  );

  const handleRouteUpdate = (route: RouteResult) => {
    setRouteResult(route);
    setFormData((prev) => ({
      ...prev,
      estimated_duration: route.duration,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Route Information Form */}
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Route Name */}
            <div className="space-y-2">
              <Label htmlFor="route-name">Tên tuyến đường *</Label>
              <Input
                id="route-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nhập tên tuyến đường..."
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="route-status">Trạng thái *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: RouteStatus) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="DRAFT">Tạm khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Duration */}
            <div className="space-y-2">
              <Label htmlFor="route-duration">Thời gian dự kiến (phút)</Label>
              <Input
                id="route-duration"
                type="number"
                min="1"
                value={formData.estimated_duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimated_duration: parseInt(e.target.value) || 60,
                  }))
                }
                placeholder="60"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="route-description">Mô tả</Label>
            <Textarea
              id="route-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Nhập mô tả cho tuyến đường..."
              rows={3}
            />
          </div>

          {/* Address Selection */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Địa chỉ hành chính</Label>
            <p className="text-sm text-gray-600 mb-4">
              Chọn tỉnh/thành phố, quận/huyện và phường/xã để xác định khu vực hoạt động của tuyến đường
            </p>
            <AddressSelector
              value={{
                province_code: formData.address?.province?.code,
                district_code: formData.address?.district?.code,
                ward_code: formData.address?.ward?.code,
                street_address: formData.address?.street_address,
              }}
              onChange={handleAddressChange}
              onValidationChange={handleAddressValidationChange}
              required={true}
              showStreetAddress={false}
              className="bg-gray-50 p-4 rounded-lg border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Route Points */}
      <Card>
        <CardContent className="space-y-4 pt-4">
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
        {mode === "edit" && (
          <Button
            variant="destructive"
            onClick={deleteRoute}
            disabled={isCreating}
            className="min-w-[120px]"
            type="button"
            data-testid="delete-route-button"
          >
            {isCreating ? "Đang xóa..." : "Xóa"}
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isCreating || !formData.name || routePoints.length < 2}
          className="min-w-[120px]"
          type="button" // Prevent form submission
          data-testid="submit-route-button"
        >
          {isCreating
            ? mode === "edit"
              ? "Đang cập nhật..."
              : "Đang tạo..."
            : mode === "edit"
            ? "Cập nhật"
            : "Tạo lộ trình"}
        </Button>
      </div>
    </div>
  );
}

export default RouteCreator;
