/**
 * Custom Routing Simple Leaflet Map Component - Separated Effects Architecture
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
  const lastRoutedPointsRef = useRef<string>(""); // Track last routed points to prevent duplicate calls

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

  // 🚀 EFFECT 1: Map Initialization (runs ONCE)
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
        console.log("🚀 INITIALIZING MAP (one-time setup)");
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

        // Create map with initial center and zoom
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

        // Add map click handler
        if (stableOnMapClick.current) {
          map.on("click", (e: any) => {
            stableOnMapClick.current!(e.latlng.lat, e.latlng.lng);
          });
        }

        console.log("✅ Map initialized successfully");
      } catch (error) {
        console.error("Failed to initialize map:", error);
        isInitializedRef.current = false;
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
    };
  }, []); // ⭐ EMPTY DEPS - only run once!

  // Helper function to get icon color
  const getIconColor = (type: string) => {
    switch (type) {
      case "start":
        return "#16a34a"; // Green
      case "end":
        return "#dc2626"; // Red
      case "pickup":
        return "#3b82f6"; // Blue
      default:
        return "#e11d48"; // Default red/pink
    }
  };

  // Helper function to update markers
  const updateMapMarkers = useCallback((points: any[]) => {
    if (!mapRef.current || !leafletInstance) {
      console.warn("⚠️ Map not ready for marker updates");
      return;
    }

    console.log("🔄 UPDATING MARKERS", points.length);

    // Clear existing markers
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

    // Add new markers
    points.forEach((point: any, index: number) => {
      if (
        !point ||
        typeof point.lat !== "number" ||
        typeof point.lng !== "number"
      ) {
        console.warn("⚠️ Invalid point data:", point);
        return;
      }

      const type =
        point.type ||
        (index === 0
          ? "start"
          : index === points.length - 1
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

      try {
        const marker = leafletInstance
          .marker([point.lat, point.lng], { icon: customIcon })
          .addTo(mapRef.current);
        markersRef.current.push(marker);

        marker.bindPopup(
          `<div style="font-size: 14px;"><div style="font-weight: 600;">${
            point.address
          }</div><div style="color: #666; font-size: 12px;">${point.lat.toFixed(
            6
          )}, ${point.lng.toFixed(6)}</div></div>`
        );

        if (stableOnMarkerClick.current) {
          marker.on("click", () => stableOnMarkerClick.current!(point.id));
        }
      } catch (error) {
        console.error("Error creating marker:", error);
      }
    });

    console.log(`✅ Updated ${markersRef.current.length} markers`);
  }, []);

  // 🔄 EFFECT 2: Update markers when points change
  useEffect(() => {
    const parsedPoints = JSON.parse(memoizedPoints);
    updateMapMarkers(parsedPoints);
  }, [memoizedPoints, updateMapMarkers]);

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
          return addFallbackRouting(
            map,
            points,
            L,
            stableOnRouteUpdate.current
          );
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
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(osrmUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "LeafletRouting/1.0",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
          throw new Error(`OSRM Error: ${data.message || "No routes found"}`);
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

  // 🛣️ EFFECT 3: Update routing when showRoute or points change
  useEffect(() => {
    if (!mapRef.current || !leafletInstance || !showRoute) {
      // Clear route if showRoute is false
      if (routeLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      return;
    }

    const parsedPoints = JSON.parse(memoizedPoints);
    if (parsedPoints.length < 2) {
      // Clear route if not enough points
      if (routeLayerRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      return;
    }

    console.log("🛣️ UPDATING ROUTING", parsedPoints.length, "points");

    // Clear any existing timeout
    if (routingTimeoutRef.current) {
      clearTimeout(routingTimeoutRef.current);
    }

    // Debounce routing calls to prevent rapid API requests
    routingTimeoutRef.current = setTimeout(() => {
      addCustomRouting(
        mapRef.current,
        parsedPoints,
        leafletInstance,
        stableOnRouteUpdate.current
      );
    }, 800); // 800ms debounce delay

    return () => {
      if (routingTimeoutRef.current) {
        clearTimeout(routingTimeoutRef.current);
        routingTimeoutRef.current = null;
      }
    };
  }, [memoizedPoints, showRoute, addCustomRouting]);

  // 📍 EFFECT 4: Update map center when center prop changes
  useEffect(() => {
    if (
      mapRef.current &&
      typeof center === "object" &&
      center.lat &&
      center.lng
    ) {
      // Only update view if center actually changed significantly (>100m difference)
      const currentCenter = mapRef.current.getCenter();
      const distance = mapRef.current.distance(
        [currentCenter.lat, currentCenter.lng],
        [center.lat, center.lng]
      );

      // Only update if the distance is significant (>100 meters) to avoid micro-adjustments
      if (distance > 100) {
        console.log("📍 Updating map center to:", center);
        mapRef.current.setView(
          [center.lat, center.lng],
          mapRef.current.getZoom(),
          {
            animate: true,
            duration: 0.5,
          }
        );
      }
    }
  }, [memoizedCenter]);

  // 🔄 EFFECT: Invalidate map size when height changes
  useEffect(() => {
    if (mapRef.current && typeof mapRef.current.invalidateSize === "function") {
      setTimeout(() => {
        mapRef.current.invalidateSize();
        console.log("✅ Map size invalidated for height:", height);
      }, 100);
    }
  }, [height]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear debounce timeout
      if (routingTimeoutRef.current) {
        clearTimeout(routingTimeoutRef.current);
        routingTimeoutRef.current = null;
      }
      performCleanup();
    };
  }, [performCleanup]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: "100%", height }}
      className="w-full h-full rounded-lg overflow-hidden border border-gray-200"
    />
  );
}

export default SimpleLeafletMap;
