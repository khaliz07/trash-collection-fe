/**
 * Custom Routing Simple Leaflet Map Component - No routing machine errors
 */

"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import leafletService, {
  type LatLng,
  type RouteResult,
} from "@/lib/leaflet-service";

export interface LeafletMapProps {
  center: LatLng;
  points: Array<{
    id: string;
    lat: number;
    lng: number;
    address: string;
    type?: "start" | "end" | "pickup" | "waypoint";
  }>;
  showRoute?: boolean;
  height?: string;
  zoom?: number;
  autoFitBounds?: boolean; // Control auto-zoom behavior
  onRouteUpdate?: (route: RouteResult) => void;
  onMarkerClick?: (pointId: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

let leafletInstance: any = null;

function SimpleLeafletMap(props: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const isInitializedRef = useRef(false);

  // Debouncing and rate limiting refs
  const routingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const routeCacheRef = useRef<Map<string, RouteResult>>(new Map());
  const lastRequestTimeRef = useRef<number>(0);
  const requestCountRef = useRef<number>(0);
  const lastRoutedPointsRef = useRef<string>(''); // Track last routed points to prevent duplicate calls

  const {
    center,
    points,
    showRoute = false,
    height = "400px",
    zoom = 13,
    autoFitBounds = false, // Default to false to prevent auto-zoom
    onRouteUpdate,
    onMarkerClick,
    onMapClick,
  } = props;

  // Memoize points to prevent unnecessary re-renders
  const memoizedPoints = useMemo(() => JSON.stringify(points), [points]);
  const memoizedCenter = useMemo(() => JSON.stringify(center), [center]);
  
  // Stable refs for callbacks to prevent useEffect re-runs
  const stableOnRouteUpdate = useRef(onRouteUpdate);
  const stableOnMapClick = useRef(onMapClick);
  const stableOnMarkerClick = useRef(onMarkerClick);
  
  // Update refs when props change
  useEffect(() => {
    stableOnRouteUpdate.current = onRouteUpdate;
    stableOnMapClick.current = onMapClick;
    stableOnMarkerClick.current = onMarkerClick;
  });

  // Complete cleanup function
  const performCleanup = useCallback(() => {
    // Clear route layer
    if (routeLayerRef.current && mapRef.current) {
      try {
        mapRef.current.removeLayer(routeLayerRef.current);
      } catch (e) {
        // Silent cleanup
      }
      routeLayerRef.current = null;
    }

    // Clear markers
    markersRef.current.forEach((marker) => {
      try {
        if (marker && typeof marker.remove === "function") {
          marker.remove();
        }
      } catch (e) {
        // Silent cleanup
      }
    });
    markersRef.current = [];

    // Clear map
    if (mapRef.current) {
      try {
        // Remove all event listeners
        mapRef.current.off();

        // Remove map instance
        mapRef.current.remove();
      } catch (e) {
        // Silent cleanup
      }
      mapRef.current = null;
    }

    isInitializedRef.current = false;
  }, []);

  // Fallback routing function for when OSRM is rate limited
  const addFallbackRouting = useCallback(
    async (
      map: any,
      points: any[],
      L: any,
      onRouteUpdate?: (route: RouteResult) => void
    ) => {
      console.log("Using fallback routing due to rate limiting");

      // Clear existing route layer
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      const fallbackCoordinates = points.map((p) => [p.lat, p.lng]);

      // Calculate approximate distance
      let fallbackDistance = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const dist = map.distance(
          [points[i].lat, points[i].lng],
          [points[i + 1].lat, points[i + 1].lng]
        );
        fallbackDistance += dist;
      }

      const fallbackDuration = (fallbackDistance / 1000) * 3; // 3 minutes per km

      const fallbackLine = L.polyline(fallbackCoordinates, {
        color: "#f59e0b", // Orange color to indicate fallback
        weight: 6,
        opacity: 0.8,
        smoothFactor: 1,
        dashArray: "10, 10", // Dashed line to show it's approximate
      });

      fallbackLine.addTo(map);
      routeLayerRef.current = fallbackLine;

      // Conditionally fit map to route bounds (fallback routing)
      if (autoFitBounds) {
        const group = L.featureGroup([fallbackLine, ...markersRef.current]);
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
      }

      // Call onRouteUpdate callback with fallback data
      if (stableOnRouteUpdate.current) {
        const routeResult: RouteResult = {
          distance: Math.round(fallbackDistance),
          duration: Math.round(fallbackDuration / 60),
          coordinates: fallbackCoordinates.map((coord: any) => ({
            lat: coord[0],
            lng: coord[1],
          })),
          polyline: `fallback_${Date.now()}`,
        };

        stableOnRouteUpdate.current(routeResult);
      }
    },
    []
  );

  // Custom routing function using OSRM API with debouncing and rate limiting
  const addCustomRouting = useCallback(
    async (
      map: any,
      points: any[],
      L: any,
      onRouteUpdate?: (route: RouteResult) => void
    ) => {
      if (points.length < 2) return;

      // Create cache key for points
      const pointsKey = points
        .map((p) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`)
        .join("|");
      
      // Skip if we already routed these exact points (prevent re-render loops)
      if (lastRoutedPointsRef.current === pointsKey) {
        console.log("🚫 Skipping duplicate routing call for same points");
        return;
      }

      // Create cache key
      const cacheKey = pointsKey;

      // Check cache first
      const cachedResult = routeCacheRef.current.get(cacheKey);
      if (cachedResult) {
        console.log("📦 Using cached route result");
        lastRoutedPointsRef.current = pointsKey; // Mark as routed to prevent re-calls

        // Clear existing route layer
        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
          routeLayerRef.current = null;
        }

        // Create polyline from cached data
        const routeLine = L.polyline(
          cachedResult.coordinates.map((c) => [c.lat, c.lng]),
          {
            color: "#3b82f6",
            weight: 6,
            opacity: 0.8,
            smoothFactor: 1,
          }
        );

        routeLine.addTo(map);
        routeLayerRef.current = routeLine;

        // Conditionally fit map to route bounds (cached route)
        if (autoFitBounds) {
          const group = L.featureGroup([routeLine, ...markersRef.current]);
          map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }

        if (stableOnRouteUpdate.current) {
          stableOnRouteUpdate.current(cachedResult);
        }
        return;
      }

      // Rate limiting: Max 5 requests per minute
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTimeRef.current;

      if (timeSinceLastRequest < 60000) {
        // Within last minute
        if (requestCountRef.current >= 5) {
          console.warn("Rate limit exceeded, using fallback routing");
          return addFallbackRouting(map, points, L, stableOnRouteUpdate.current);
        }
      } else {
        // Reset counter after a minute
        requestCountRef.current = 0;
      }

      try {
        // Clear existing route layer
        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
          routeLayerRef.current = null;
        }

        // OSRM API call with proper error handling
        const coordinates = points.map((p) => `${p.lng},${p.lat}`).join(";");
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`;

        console.log("OSRM URL:", osrmUrl);

        // Update request tracking
        requestCountRef.current++;
        lastRequestTimeRef.current = now;

        // Add timeout and proper error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(osrmUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log("OSRM Response status:", response.status);

        if (!response.ok) {
          throw new Error(
            `OSRM API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("OSRM Data:", data);

        if (!data.routes || data.routes.length === 0) {
          throw new Error("No routes found from OSRM");
        }

        const route = data.routes[0];
        const routeCoordinates = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );
        const distance = route.distance;
        const duration = route.duration;

        const routeLine = L.polyline(routeCoordinates, {
          color: "#3b82f6",
          weight: 6,
          opacity: 0.8,
          smoothFactor: 1,
        });

        routeLine.addTo(map);
        routeLayerRef.current = routeLine;

        // Conditionally fit map to route bounds (OSRM route)
        if (autoFitBounds) {
          const group = L.featureGroup([routeLine, ...markersRef.current]);
          map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }

        // Call onRouteUpdate callback
        if (stableOnRouteUpdate.current) {
          const routeResult: RouteResult = {
            distance: Math.round(distance),
            duration: Math.round(duration / 60), // Convert to minutes
            coordinates: routeCoordinates.map((coord: any) => ({
              lat: coord[0],
              lng: coord[1],
            })),
            polyline: route.geometry,
          };

          // Cache the result and mark as routed
          routeCacheRef.current.set(cacheKey, routeResult);
          lastRoutedPointsRef.current = pointsKey; // Mark these points as routed
          console.log("✅ Cached route result for:", cacheKey);

          stableOnRouteUpdate.current(routeResult);
        }
      } catch (error: any) {
        console.error("OSRM routing error:", error);

        // Fallback to straight line routing if OSRM fails
        try {
          console.log("Falling back to straight line routing...");

          const fallbackCoordinates = points.map((p) => [p.lat, p.lng]);

          // Calculate approximate distance
          let fallbackDistance = 0;
          for (let i = 0; i < points.length - 1; i++) {
            const dist = map.distance(
              [points[i].lat, points[i].lng],
              [points[i + 1].lat, points[i + 1].lng]
            );
            fallbackDistance += dist;
          }

          const fallbackDuration = (fallbackDistance / 1000) * 3; // 3 minutes per km

          const fallbackLine = L.polyline(fallbackCoordinates, {
            color: "#f59e0b", // Orange color to indicate fallback
            weight: 6,
            opacity: 0.8,
            smoothFactor: 1,
            dashArray: "10, 10", // Dashed line to show it's approximate
          });

          fallbackLine.addTo(map);
          routeLayerRef.current = fallbackLine;

          // Conditionally fit map to route bounds (error fallback)
          if (autoFitBounds) {
            const group = L.featureGroup([fallbackLine, ...markersRef.current]);
            map.fitBounds(group.getBounds(), { padding: [20, 20] });
          }

          // Call onRouteUpdate callback with fallback data
          if (stableOnRouteUpdate.current) {
            const routeResult: RouteResult = {
              distance: Math.round(fallbackDistance),
              duration: Math.round(fallbackDuration / 60),
              coordinates: fallbackCoordinates.map((coord: any) => ({
                lat: coord[0],
                lng: coord[1],
              })),
              polyline: `fallback_${Date.now()}`,
            };

            lastRoutedPointsRef.current = pointsKey; // Mark as routed to prevent re-calls
            stableOnRouteUpdate.current(routeResult);
          }
        } catch (fallbackError) {
          console.error("Fallback routing also failed:", fallbackError);
          if (stableOnRouteUpdate.current) {
            stableOnRouteUpdate.current({
              distance: 0,
              duration: 0,
              coordinates: [],
              polyline: "",
            });
          }
        }
      }
    },
    []
  );

  // Initialize map
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !mapContainerRef.current ||
      isInitializedRef.current
    ) {
      return;
    }

    let isMounted = true;

    const initializeMap = async () => {
      try {
        isInitializedRef.current = true;

        // Cleanup any existing instances
        performCleanup();

        // Dynamic import Leaflet
        if (!leafletInstance) {
          leafletInstance = (await import("leaflet")).default;

          // Add CSS
          if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
          }

          // Fix default markers
          delete (leafletInstance.Icon.Default.prototype as any)._getIconUrl;
          leafletInstance.Icon.Default.mergeOptions({
            iconRetinaUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          });
        }

        if (!isMounted) return;

        // Create map
        const map = leafletInstance
          .map(mapContainerRef.current!)
          .setView([center.lat, center.lng], zoom);
        mapRef.current = map;

        // Add tile layer
        leafletInstance
          .tileLayer(leafletService.getTileLayerUrl(), {
            attribution: leafletService.getTileLayerAttribution(),
          })
          .addTo(map);

        // Add markers
        const parsedPoints = JSON.parse(memoizedPoints);
        parsedPoints.forEach((point: any, index: number) => {
          if (!isMounted) return;

          const type =
            point.type ||
            (index === 0
              ? "start"
              : index === parsedPoints.length - 1
              ? "end"
              : "waypoint");
          const color = getIconColor(type);

          const customIcon = leafletInstance.divIcon({
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: white;">${
              type === "start"
                ? "S"
                : type === "end"
                ? "E"
                : type === "pickup"
                ? "P"
                : "•"
            }</div>`,
            className: "custom-div-icon",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const marker = leafletInstance
            .marker([point.lat, point.lng], { icon: customIcon })
            .addTo(map);
          markersRef.current.push(marker);

          marker.bindPopup(
            `<div style="font-size: 14px;"><div style="font-weight: 600;">${
              point.address
            }</div><div style="color: #666; font-size: 12px;">${point.lat.toFixed(
              6
            )}, ${point.lng.toFixed(6)}</div></div>`
          );

          if (onMarkerClick) {
            marker.on("click", () => onMarkerClick(point.id));
          }
        });

        // Add map click handler
        if (onMapClick) {
          map.on("click", (e: any) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
          });
        }

        // Add routing if needed with debouncing
        if (showRoute && parsedPoints.length >= 2) {
          // Clear any existing timeout
          if (routingTimeoutRef.current) {
            clearTimeout(routingTimeoutRef.current);
          }

          // Debounce routing calls to prevent rapid API requests
          routingTimeoutRef.current = setTimeout(() => {
            if (isMounted) {
              addCustomRouting(
                map,
                parsedPoints,
                leafletInstance,
                onRouteUpdate
              );
            }
          }, 800); // 800ms debounce delay
        }
      } catch (error) {
        console.error("Failed to initialize map:", error);
        isInitializedRef.current = false;
      }
    };

    initializeMap();

    return () => {
      isMounted = false;

      // Clear debounce timeout
      if (routingTimeoutRef.current) {
        clearTimeout(routingTimeoutRef.current);
        routingTimeoutRef.current = null;
      }

      performCleanup();
    };
  }, [
    memoizedCenter,
    memoizedPoints,
    zoom,
    showRoute,
    autoFitBounds,
    performCleanup,
  ]);

  const getIconColor = (type: string) => {
    switch (type) {
      case "start":
        return "#22c55e";
      case "end":
        return "#ef4444";
      case "pickup":
        return "#f59e0b";
      case "waypoint":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  return (
    <div
      style={{ width: "100%", height }}
      className="relative rounded-lg overflow-hidden"
    >
      <div
        ref={mapContainerRef}
        style={{ height: "100%", width: "100%" }}
        className="leaflet-container"
      />
    </div>
  );
}

export { SimpleLeafletMap };
export default SimpleLeafletMap;
