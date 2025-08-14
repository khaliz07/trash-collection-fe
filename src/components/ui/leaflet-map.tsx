/**
 * Leaflet Map Component - Free alternative to Google Maps
 */

"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import leafletService, {
  type LatLng,
  type RouteResult,
} from "@/lib/leaflet-service";

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

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  address: string;
  type?: "start" | "end" | "pickup" | "waypoint" | "user" | "urgent";
  status?: any;
  wasteType?: string;
  urgentLevel?: string;
}

export interface LeafletMapProps {
  center: LatLng;
  points: MapPoint[];
  showRoute?: boolean;
  height?: string;
  zoom?: number;
  onRouteUpdate?: (route: RouteResult) => void;
  onMarkerClick?: (pointId: string) => void;
  onMapClick?: () => void;
} // Custom icons for different point types
const createCustomIcon = (type: string, color: string) => {
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
      return "#22c55e"; // green
    case "end":
      return "#ef4444"; // red
    case "pickup":
      return "#f59e0b"; // amber
    case "waypoint":
      return "#3b82f6"; // blue
    default:
      return "#6b7280"; // gray
  }
};

// Routing component
function RoutingMachine({
  points,
  onRouteUpdate,
}: {
  points: LeafletMapProps["points"];
  onRouteUpdate?: (route: RouteResult) => void;
}) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!points || points.length < 2) {
      // Remove existing route
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      return;
    }

    // Remove existing route
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
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
      show: false, // Hide the instruction panel
    } as any).on("routesfound", function (e) {
      const routes = e.routes;
      const summary = routes[0].summary;

      if (onRouteUpdate) {
        onRouteUpdate({
          distance: summary.totalDistance,
          duration: Math.round(summary.totalTime / 60),
          coordinates: routes[0].coordinates.map((coord: L.LatLng) => ({
            lat: coord.lat,
            lng: coord.lng,
          })),
          polyline: "", // OSRM handles this internally
        });
      }
    });

    // Add to map
    routingControl.addTo(map);
    routingControlRef.current = routingControl;

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map, points, onRouteUpdate]);

  return null;
}

// Map click handler component
function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

export function LeafletMap({
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

  useEffect(() => {
    setMapReady(true);
  }, []);

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

  return (
    <div
      style={{ width: "100%", height }}
      className="relative rounded-lg overflow-hidden"
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url={leafletService.getTileLayerUrl()}
          attribution={leafletService.getTileLayerAttribution()}
        />

        {/* Render markers */}
        {points.map((point, index) => {
          const type =
            point.type ||
            (index === 0
              ? "start"
              : index === points.length - 1
              ? "end"
              : "waypoint");
          const color = getIconColor(type);

          return (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={createCustomIcon(type, color)}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{point.address}</div>
                  <div className="text-gray-600">
                    {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {type === "start"
                      ? "Điểm bắt đầu"
                      : type === "end"
                      ? "Điểm kết thúc"
                      : type === "pickup"
                      ? "Điểm thu gom"
                      : "Điểm trung gian"}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Routing */}
        {showRoute && points.length >= 2 && (
          <RoutingMachine points={points} onRouteUpdate={onRouteUpdate} />
        )}

        {/* Map click handler */}
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      </MapContainer>
    </div>
  );
}

// Create the dynamic component that wraps LeafletMap
const DynamicLeafletMap = dynamic(() => Promise.resolve(LeafletMap), {
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
