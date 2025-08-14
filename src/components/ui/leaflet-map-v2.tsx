/**
 * Leaflet Map Component - Free alternative to Google Maps
 * Using dynamic imports to prevent SSR issues
 */

"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
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
  onRouteUpdate?: (route: RouteResult) => void;
  onMarkerClick?: (pointId: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

// Create the actual map component that will be dynamically imported
function LeafletMapComponent({
  center,
  points,
  showRoute = false,
  height = "400px",
  zoom = 13,
  onRouteUpdate,
  onMarkerClick,
  onMapClick,
}: LeafletMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    // Dynamic import of Leaflet components
    const initializeMap = async () => {
      const L = (await import("leaflet")).default;
      const { MapContainer, TileLayer, Marker, Popup } = await import(
        "react-leaflet"
      );
      await import("leaflet/dist/leaflet.css");
      await import("leaflet-routing-machine");

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      setMapReady(true);
    };

    initializeMap();
  }, []);

  // Custom icon creation function
  const createCustomIcon = (type: string, color: string) => {
    if (typeof window === "undefined") return null;

    const L = require("leaflet");
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: white;
        ">
          ${
            type === "start"
              ? "S"
              : type === "end"
              ? "E"
              : type === "pickup"
              ? "P"
              : "•"
          }
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

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

  // Setup routing when map is ready
  useEffect(() => {
    if (!mapReady || !mapRef.current || !showRoute || points.length < 2) {
      return;
    }

    const setupRouting = async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current;

      // Remove existing route
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      // Create waypoints
      const waypoints = points.map((point) => L.latLng(point.lat, point.lng));

      // Create routing control
      const routingControl = L.Routing.control({
        waypoints,
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: "driving",
        }),
        routeWhileDragging: false,
        addWaypoints: false,
        lineOptions: {
          styles: [
            {
              color: "#3b82f6",
              weight: 6,
              opacity: 0.8,
            },
          ],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        show: false,
      } as any).on("routesfound", function (e: any) {
        const routes = e.routes;
        const summary = routes[0].summary;

        if (onRouteUpdate) {
          onRouteUpdate({
            distance: summary.totalDistance,
            duration: Math.round(summary.totalTime / 60),
            coordinates: routes[0].coordinates.map((coord: any) => ({
              lat: coord.lat,
              lng: coord.lng,
            })),
            polyline: "",
          });
        }
      });

      routingControl.addTo(map);
      routingControlRef.current = routingControl;
    };

    setupRouting();

    return () => {
      if (routingControlRef.current && mapRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [mapReady, showRoute, points, onRouteUpdate]);

  if (!mapReady) {
    return (
      <div
        style={{ width: "100%", height }}
        className="flex items-center justify-center bg-gray-100 rounded-lg"
      >
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  // Render map using dynamic components
  return (
    <div
      style={{ width: "100%", height }}
      className="relative rounded-lg overflow-hidden"
    >
      <div id="leaflet-map" style={{ height: "100%", width: "100%" }}>
        {/* Map will be created here using imperative API */}
        <MapRenderer
          center={center}
          points={points}
          zoom={zoom}
          onMapReady={(map) => {
            mapRef.current = map;
          }}
          onMarkerClick={onMarkerClick}
          onMapClick={onMapClick}
          createCustomIcon={createCustomIcon}
          getIconColor={getIconColor}
        />
      </div>
    </div>
  );
}

// Separate component for map rendering
function MapRenderer({
  center,
  points,
  zoom,
  onMapReady,
  onMarkerClick,
  onMapClick,
  createCustomIcon,
  getIconColor,
}: {
  center: LatLng;
  points: LeafletMapProps["points"];
  zoom: number;
  onMapReady: (map: any) => void;
  onMarkerClick?: (pointId: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  createCustomIcon: (type: string, color: string) => any;
  getIconColor: (type: string) => string;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      // Create map
      const map = L.map(mapContainerRef.current).setView(
        [center.lat, center.lng],
        zoom
      );

      // Add tile layer
      L.tileLayer(leafletService.getTileLayerUrl(), {
        attribution: leafletService.getTileLayerAttribution(),
      }).addTo(map);

      // Add markers
      points.forEach((point, index) => {
        const type =
          point.type ||
          (index === 0
            ? "start"
            : index === points.length - 1
            ? "end"
            : "waypoint");
        const color = getIconColor(type);
        const icon = createCustomIcon(type, color);

        if (icon) {
          const marker = L.marker([point.lat, point.lng], { icon }).addTo(map);

          marker.bindPopup(`
            <div style="font-size: 14px;">
              <div style="font-weight: 600;">${point.address}</div>
              <div style="color: #666; font-size: 12px;">
                ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
              </div>
              <div style="color: #888; font-size: 11px; text-transform: capitalize;">
                ${
                  type === "start"
                    ? "Điểm bắt đầu"
                    : type === "end"
                    ? "Điểm kết thúc"
                    : type === "pickup"
                    ? "Điểm thu gom"
                    : "Điểm trung gian"
                }
              </div>
            </div>
          `);

          if (onMarkerClick) {
            marker.on("click", () => onMarkerClick(point.id));
          }
        }
      });

      // Add map click handler
      if (onMapClick) {
        map.on("click", (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      mapInstanceRef.current = map;
      onMapReady(map);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    center,
    points,
    zoom,
    onMapReady,
    onMarkerClick,
    onMapClick,
    createCustomIcon,
    getIconColor,
  ]);

  return (
    <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
  );
}

// Create the dynamic component with proper SSR handling
const DynamicLeafletMap = dynamic(() => Promise.resolve(LeafletMapComponent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-600">Đang tải bản đồ...</p>
      </div>
    </div>
  ),
});

// Export only the dynamic component as default
export default DynamicLeafletMap;
