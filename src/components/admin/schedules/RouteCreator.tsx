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
import { AddressAutoComplete } from "@/components/ui/address-autocomplete";
import api from "@/lib/api";
import leafletService, {
  type LatLng,
  type RouteResult,
} from "@/lib/leaflet-service";
import { RouteStatus } from "@/types/route";
import { CreateSimpleRouteRequest, SimpleRoute } from "@/types/simple-route";
import { AdministrativeAddress } from "@/types/address";
import { AddressService } from "@/lib/address-service";
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
  console.log("🚀 RouteCreator component initialized with:", {
    mode,
    routeId,
    hasInitialData: !!initialData,
    initialPickupPoints: initialData?.pickup_points?.length || 0,
    initialAddress: initialData?.address,
  });
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
  const [mapCenter, setMapCenterState] = useState<LatLng>(
    leafletService.getDefaultCenter()
  );

  // Wrapper for setMapCenter with logging
  const setMapCenter = (center: LatLng) => {
    console.log("📍 setMapCenter called:", {
      newCenter: center,
      caller: new Error().stack?.split("\n")[2]?.trim(), // Get caller info
    });
    setMapCenterState(center);
  };
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [addressErrors, setAddressErrors] = useState<string[]>([]);
  const [isAddressValid, setIsAddressValid] = useState(true);
  const isCreatingRef = useRef(false); // Additional protection against double-calls

  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [hasInitialRouteLoaded, setHasInitialRouteLoaded] = useState(
    // Initialize as true if we're in edit mode with existing route data
    mode === "edit" && !!initialData?.pickup_points?.length
  );

  // Context menu and point editing states
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    lat: number;
    lng: number;
    pointIndex?: number;
  } | null>(null);
  const [editingPointIndex, setEditingPointIndex] = useState<number | null>(null);
  const [isEditingPointPosition, setIsEditingPointPosition] = useState(false);

  // Load route points from initialData for edit mode
  useEffect(() => {
    if (initialData?.pickup_points && mode === "edit") {
      console.log("📥 Loading initial route data for edit mode");

      // Set flag FIRST to prevent admin area focus
      setHasInitialRouteLoaded(true);

      const points = initialData.pickup_points.map((point, index) => ({
        id: `${point.lat}-${point.lng}-${index}`,
        address: point.address || `Điểm ${index + 1}`,
        lat: point.lat,
        lng: point.lng,
        isValid: true,
        type: (index === 0 ? "start" : "pickup") as "start" | "pickup",
      }));
      setRoutePoints(points);

      // Set map center to first point if available, but autoFitBounds will override this
      if (points.length > 0) {
        setMapCenter({ lat: points[0].lat!, lng: points[0].lng! });
      }

      console.log("✅ Initial route loaded, points count:", points.length);
    } else if (mode === "create") {
      // In create mode, allow admin area focus
      setHasInitialRouteLoaded(false);
    }
  }, [initialData?.pickup_points, mode]);

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

  // Determine if we should auto-fit bounds to show entire route
  const shouldAutoFitBounds = useMemo(() => {
    const result =
      mapPoints.length >= 2 && !isAddingPoint && !isChangingAddress;
    console.log("🔍 shouldAutoFitBounds calculation:", {
      mapPointsLength: mapPoints.length,
      isAddingPoint,
      isChangingAddress,
      shouldAutoFit: result,
      mapPoints: mapPoints.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        address: p.address,
      })),
    });
    return result;
  }, [mapPoints.length, isAddingPoint, isChangingAddress]);

  // Handle initial map focus when component first loads or when address changes
  useEffect(() => {
    console.log("🗺️ Map focus useEffect triggered", {
      mapPointsCount: mapPoints.length,
      hasAddress: !!formData.address,
      province: formData.address?.province?.name,
      district: formData.address?.district?.name,
      ward: formData.address?.ward?.name,
      isAddingPoint,
      isChangingAddress,
      mode,
      hasInitialRouteLoaded,
      shouldAutoFitBounds:
        mapPoints.length >= 2 && !isAddingPoint && !isChangingAddress,
    });

    // Skip if currently adding a point or changing address to avoid conflicts
    if (isAddingPoint || isChangingAddress) {
      console.log(
        "⏸️ Skipping map focus - currently adding point or changing address"
      );
      return;
    }

    // Priority 1: If we have multiple route points, DON'T interfere with autoFitBounds
    // This is the key fix - we should not focus on administrative area if route points exist
    if (mapPoints.length >= 2) {
      console.log(
        "🎯 Route points detected, letting autoFitBounds handle focus - NOT focusing on admin area",
        {
          mapPointsCount: mapPoints.length,
          shouldAutoFitBounds:
            mapPoints.length >= 2 && !isAddingPoint && !isChangingAddress,
        }
      );
      return; // Do NOT focus on administrative area
    }

    // Priority 2: Focus on administrative address ONLY if:
    // - We have no route points or just 1 point
    // - AND we're in create mode
    // - AND we haven't loaded an initial route (edit mode protection)
    const shouldFocusOnAdminArea =
      mapPoints.length < 2 &&
      formData.address &&
      (formData.address.province ||
        formData.address.district ||
        formData.address.ward) &&
      mode === "create" && // Only in create mode
      !hasInitialRouteLoaded; // Extra protection

    console.log("🔍 shouldFocusOnAdminArea evaluation:", {
      mapPointsLessThan2: mapPoints.length < 2,
      hasFormDataAddress: !!formData.address,
      hasProvinceOrDistrictOrWard: !!(
        formData.address?.province ||
        formData.address?.district ||
        formData.address?.ward
      ),
      isCreateMode: mode === "create",
      hasNotInitialRouteLoaded: !hasInitialRouteLoaded,
      finalResult: shouldFocusOnAdminArea,
    });

    if (shouldFocusOnAdminArea) {
      console.log(
        "📍 WILL FOCUS on administrative area (create mode, conditions met)"
      );
      const focusOnAdministrativeArea = async () => {
        try {
          const fullAddress = AddressService.formatFullAddress(
            formData.address?.province,
            formData.address?.district,
            formData.address?.ward
          );

          if (fullAddress) {
            console.log("🔍 Geocoding administrative area:", fullAddress);
            const coordinates = await leafletService.geocodeAddress(
              fullAddress
            );
            console.log("✅ Setting map center to:", coordinates);
            setMapCenter(coordinates);
          }
        } catch (error) {
          console.warn("❌ Could not focus on administrative area:", error);
        }
      };

      focusOnAdministrativeArea();
    } else {
      console.log(
        "❌ Not focusing on administrative area - conditions not met"
      );
    }
  }, [
    // Key dependencies that should trigger map focus
    mapPoints.length,
    formData.address?.province?.code,
    formData.address?.district?.code,
    formData.address?.ward?.code,
    isAddingPoint,
    isChangingAddress,
    mode,
    hasInitialRouteLoaded, // Add this to prevent admin area focus after route loads
  ]);

  // Debug: Log SimpleLeafletMap props
  useEffect(() => {
    console.log("🗺️ SimpleLeafletMap props updated:", {
      mapCenter,
      mapPointsCount: mapPoints.length,
      showRoute: mapPoints.length >= 2,
      shouldAutoFitBounds,
      mapPoints: mapPoints.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        address: p.address,
      })),
    });
  }, [mapCenter, mapPoints.length, shouldAutoFitBounds]);

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

    setIsAddingPoint(true);
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
    } finally {
      // Reset adding state after a short delay
      setTimeout(() => setIsAddingPoint(false), 1000);
    }
  };

  // Handle address selection from AutoComplete
  const handleAutoCompleteAddressSelect = async (
    address: string,
    lat?: number,
    lng?: number
  ) => {
    setIsAddingPoint(true);
    try {
      console.log("Adding address from autocomplete:", address, lat, lng);

      let coordinates: { lat: number; lng: number };

      if (lat !== undefined && lng !== undefined) {
        // Use provided coordinates from autocomplete
        coordinates = { lat, lng };
      } else {
        // Fallback to geocoding if no coordinates provided
        coordinates = await leafletService.geocodeAddress(address);
      }

      const newPoint: RoutePoint = {
        id: Date.now().toString(),
        address: address,
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

      toast.success(`Đã thêm điểm thu gom: ${address}`);
    } catch (error) {
      console.error("Error adding address from autocomplete:", error);
      toast.error("Không thể thêm địa chỉ. Vui lòng thử lại.");
    } finally {
      // Reset adding state after a short delay to allow map to update
      setTimeout(() => setIsAddingPoint(false), 1000);
    }
  };

  // Context menu handlers
  const handleMapRightClick = (lat: number, lng: number, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      lat,
      lng
    });
  };

  const handlePointRightClick = (pointIndex: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const point = routePoints[pointIndex];
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      lat: point.lat || 0,
      lng: point.lng || 0,
      pointIndex
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleAddPointFromMenu = async () => {
    if (!contextMenu) return;
    
    // Use existing handleMapClick logic
    await handleMapClick(contextMenu.lat, contextMenu.lng);
    closeContextMenu();
  };

  const handleDeletePoint = () => {
    if (!contextMenu || contextMenu.pointIndex === undefined) return;
    
    const newPoints = routePoints.filter((_, index) => index !== contextMenu.pointIndex);
    setRoutePoints(newPoints);
    closeContextMenu();
  };

  const handleStartEditPosition = () => {
    if (!contextMenu || contextMenu.pointIndex === undefined) return;
    
    setEditingPointIndex(contextMenu.pointIndex);
    setIsEditingPointPosition(true);
    closeContextMenu();
  };

  const handleEditPositionClick = async (lat: number, lng: number) => {
    if (editingPointIndex === null) return;

    // Update point position
    const updatedPoints = routePoints.map((point, index) => 
      index === editingPointIndex 
        ? { ...point, lat, lng, address: `Điểm ${index + 1} (đã cập nhật)` }
        : point
    );
    
    setRoutePoints(updatedPoints);
    setEditingPointIndex(null);
    setIsEditingPointPosition(false);

    // Reverse geocode to get proper address
    try {
      const address = await leafletService.reverseGeocode(lat, lng);
      const finalPoints = updatedPoints.map((point, index) => 
        index === editingPointIndex 
          ? { ...point, address: address || `Điểm ${index + 1}` }
          : point
      );
      setRoutePoints(finalPoints);
    } catch (error) {
      console.warn("Could not get address for updated point:", error);
    }
  };

  // Handle map click to add points - INSTANT UI UPDATE
  const handleMapClick = async (lat: number, lng: number) => {
    // If we're editing a point position, handle that instead
    if (isEditingPointPosition) {
      await handleEditPositionClick(lat, lng);
      return;
    }

    setIsAddingPoint(true);

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
      } finally {
        // Reset adding state after background work is done
        setTimeout(() => setIsAddingPoint(false), 500);
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
  const handleAddressChange = async (
    address: AdministrativeAddress,
    isUserInteraction = false
  ) => {
    console.log("🏠 Address changed:", address, { isUserInteraction });

    setFormData((prev) => ({
      ...prev,
      address: address,
    }));

    // Chỉ focus vào administrative area nếu:
    // 1. Đang ở create mode, HOẶC
    // 2. User chủ động thay đổi (không phải auto-initialization)
    // 3. Edit mode nhưng chưa có initial route data
    const hasRouteData =
      mode === "edit" && (hasInitialRouteLoaded || mapPoints.length >= 2);
    const shouldFocusOnAddress =
      mode === "create" || isUserInteraction || !hasRouteData;

    console.log("🔍 Should focus on admin address?", {
      mode,
      mapPointsLength: mapPoints.length,
      hasInitialRouteLoaded,
      hasRouteData,
      isUserInteraction,
      shouldFocus: shouldFocusOnAddress,
    });

    if (!shouldFocusOnAddress) {
      console.log("⏸️ Skipping admin area focus - route data already exists");
      return;
    }

    // Set flag để tránh conflict với autoFitBounds
    setIsChangingAddress(true);

    try {
      // Build full address string from administrative data
      const fullAddress = AddressService.formatFullAddress(
        address.province,
        address.district,
        address.ward
      );

      if (fullAddress) {
        console.log("🎯 Address changed, forcing map focus to:", fullAddress);

        // Geocode the administrative address to get coordinates
        const coordinates = await leafletService.geocodeAddress(fullAddress);
        console.log("✅ New coordinates:", coordinates);

        // Update map center to focus on the selected area
        setMapCenter(coordinates);
      }
    } catch (error) {
      console.warn("❌ Could not auto-focus map to selected area:", error);
      // Don't show error toast as this is a nice-to-have feature
    } finally {
      // Reset changing address state after a delay
      setTimeout(() => {
        setIsChangingAddress(false);
      }, 1500);
    }
  };
  const handleAddressValidationChange = (
    isValid: boolean,
    errors: string[]
  ) => {
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
              Chọn tỉnh/thành phố, quận/huyện và phường/xã để xác định khu vực
              hoạt động của tuyến đường
            </p>
            <AddressSelector
              value={{
                province_code: formData.address?.province?.code,
                district_code: formData.address?.district?.code,
                ward_code: formData.address?.ward?.code,
                street_address: formData.address?.street_address,
              }}
              onChange={(address) => handleAddressChange(address, true)}
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

            <SimpleLeafletMap
              center={mapCenter}
              points={mapPoints}
              showRoute={mapPoints.length >= 2}
              autoFitBounds={shouldAutoFitBounds} // Auto-fit when we have route points
              onRouteUpdate={handleRouteUpdate}
              onMapClick={handleMapClick}
              onMapRightClick={handleMapRightClick}
              onPointRightClick={handlePointRightClick}
              editingPointIndex={editingPointIndex}
              isEditingPointPosition={isEditingPointPosition}
              height="500px"
              zoom={13}
            />
          </div>

          {/* Smart Address Input with AutoComplete */}
          <div className="space-y-2">
            <h4 className="font-medium">
              Hoặc thêm địa chỉ thủ công (tùy chọn)
            </h4>
            <p className="text-sm text-gray-600">
              Tìm kiếm và chọn địa chỉ cụ thể trong khu vực đã chọn
            </p>
            <AddressAutoComplete
              value={newAddress}
              onChange={setNewAddress}
              onAddressSelect={handleAutoCompleteAddressSelect}
              administrativeArea={formData.address}
              placeholder="Nhập tên đường, địa điểm cụ thể..."
              className="w-full"
            />
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
      
      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeContextMenu}
          />
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            {contextMenu.pointIndex === undefined ? (
              // Right-click on empty map area
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                onClick={handleAddPointFromMenu}
              >
                <span className="text-green-600">+</span>
                Thêm điểm tại vị trí này
              </button>
            ) : (
              // Right-click on existing point
              <>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                  onClick={handleStartEditPosition}
                >
                  <span className="text-blue-600">📍</span>
                  Thay đổi vị trí
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                  onClick={handleDeletePoint}
                >
                  <span>🗑️</span>
                  Xóa điểm này
                </button>
              </>
            )}
          </div>
        </>
      )}
      
      {/* Editing point position overlay */}
      {isEditingPointPosition && editingPointIndex !== null && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <span className="animate-pulse">📍</span>
            <span>Click vào bản đồ để đặt vị trí mới cho điểm {editingPointIndex + 1}</span>
            <button
              onClick={() => {
                setIsEditingPointPosition(false);
                setEditingPointIndex(null);
              }}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteCreator;
