/**
 * Fixed Simple Leaflet Map Component - No SSR issues, No routing errors
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
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

function FixedLeafletMap(props: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routingControlRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const isInitializingRef = useRef(false);

  const {
    center,
    points,
    showRoute = false,
    height = "400px",
    zoom = 13,
    onRouteUpdate,
    onMarkerClick,
    onMapClick,
  } = props;

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clean routing control
    if (routingControlRef.current) {
      routingControlRef.current = null;
    }

    // Clean markers
    markersRef.current.forEach(marker => {
      try {
        if (marker && typeof marker.remove === 'function') {
          marker.remove();
        }
      } catch (e) {
        // Silent cleanup
      }
    });
    markersRef.current = [];

    // Clean map
    if (mapInstanceRef.current) {
      try {
        if (typeof mapInstanceRef.current.off === 'function') {
          mapInstanceRef.current.off();
        }
        if (typeof mapInstanceRef.current.remove === 'function') {
          mapInstanceRef.current.remove();
        }
      } catch (e) {
        // Silent cleanup
      }
      mapInstanceRef.current = null;
    }
    
    isInitializingRef.current = false;
  }, []);

  // Main map initialization
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || isInitializingRef.current) {
      return;
    }

    const initMap = async () => {
      try {
        isInitializingRef.current = true;
        
        // Cleanup first
        cleanup();

        // Dynamic import Leaflet
        const L = (await import("leaflet")).default;

        // Add CSS if not exists
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        // Fix default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        // Create map
        const map = L.map(mapContainerRef.current!).setView([center.lat, center.lng], zoom);
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer(leafletService.getTileLayerUrl(), {
          attribution: leafletService.getTileLayerAttribution(),
        }).addTo(map);

        // Add markers
        points.forEach((point, index) => {
          const type = point.type || (index === 0 ? "start" : index === points.length - 1 ? "end" : "waypoint");
          const color = getIconColor(type);

          const customIcon = L.divIcon({
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: white;">${type === "start" ? "S" : type === "end" ? "E" : type === "pickup" ? "P" : "•"}</div>`,
            className: "custom-div-icon",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const marker = L.marker([point.lat, point.lng], { icon: customIcon }).addTo(map);
          markersRef.current.push(marker);

          marker.bindPopup(`<div style="font-size: 14px;"><div style="font-weight: 600;">${point.address}</div><div style="color: #666; font-size: 12px;">${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}</div></div>`);

          if (onMarkerClick) {
            marker.on("click", () => onMarkerClick(point.id));
          }
        });

        // Add map click handler
        if (onMapClick) {
          map.on('click', (e: any) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
          });
        }

        // Add routing after a short delay
        if (showRoute && points.length >= 2) {
          setTimeout(() => {
            addRouting(map, points, L, onRouteUpdate);
          }, 200);
        }

        isInitializingRef.current = false;
      } catch (error) {
        console.error("Failed to initialize map:", error);
        isInitializingRef.current = false;
      }
    };

    initMap();

    return cleanup;
  }, [JSON.stringify(center), JSON.stringify(points), zoom, showRoute, cleanup]);

  const addRouting = async (map: any, points: any[], L: any, onRouteUpdate?: (route: RouteResult) => void) => {
    try {
      // Import routing machine
      await import("leaflet-routing-machine");

      // Clear previous routing
      routingControlRef.current = null;

      const waypoints = points.map((point) => L.latLng(point.lat, point.lng));

      const routingControl = L.Routing.control({
        waypoints,
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: "driving",
        }),
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: () => false,
        lineOptions: {
          styles: [{ color: "#3b82f6", weight: 6, opacity: 0.8 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        show: false,
      })
      .on("routesfound", (e: any) => {
        try {
          const routes = e.routes;
          if (routes && routes.length > 0 && onRouteUpdate) {
            const summary = routes[0].summary;
            onRouteUpdate({
              distance: summary.totalDistance,
              duration: Math.round(summary.totalTime / 60),
              coordinates: routes[0].coordinates?.map((coord: any) => ({ lat: coord.lat, lng: coord.lng })) || [],
              polyline: "",
            });
          }
        } catch (error) {
          console.warn("Route processing error:", error);
        }
      })
      .on("routingerror", (e: any) => {
        console.warn("Routing error:", e.error);
        if (onRouteUpdate) {
          onRouteUpdate({ distance: 0, duration: 0, coordinates: [], polyline: "" });
        }
      });

      routingControl.addTo(map);
      routingControlRef.current = routingControl;
    } catch (error) {
      console.error("Failed to add routing:", error);
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "start": return "#22c55e";
      case "end": return "#ef4444";
      case "pickup": return "#f59e0b";
      case "waypoint": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  return (
    <div style={{ width: "100%", height }} className="relative rounded-lg overflow-hidden">
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} className="leaflet-container" />
    </div>
  );
}

export { FixedLeafletMap };
export default FixedLeafletMap;
