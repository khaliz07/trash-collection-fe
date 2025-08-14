/**
 * Leaflet + OSRM Service for free routing and geocoding
 * Alternative to Google Maps API
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteResult {
  distance: number; // in meters
  duration: number; // in minutes
  coordinates: LatLng[];
  polyline: string;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
  displayName: string;
}

class LeafletService {
  private osrmBaseUrl = "https://router.project-osrm.org";
  private nominatimBaseUrl = "https://nominatim.openstreetmap.org";

  /**
   * Geocode address using Nominatim (OpenStreetMap)
   * Free alternative to Google Geocoding API
   */
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `${this.nominatimBaseUrl}/search?format=json&q=${encodedAddress}&limit=1`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "TrashCollectionApp/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error("Address not found");
      }

      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: address,
        displayName: result.display_name,
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      throw new Error(`Unable to find address: ${address}`);
    }
  }

  /**
   * Reverse geocode coordinates to get address
   * Free alternative to Google Reverse Geocoding API
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const url = `${this.nominatimBaseUrl}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "TrashCollectionApp/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.display_name) {
        return `Điểm (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      }

      // Try to get a meaningful address
      const address = data.address;
      let result = "";

      if (address) {
        const parts = [];
        if (address.house_number) parts.push(address.house_number);
        if (address.road) parts.push(address.road);
        if (address.suburb || address.neighbourhood)
          parts.push(address.suburb || address.neighbourhood);
        if (address.city || address.town)
          parts.push(address.city || address.town);

        result = parts.join(", ");
      }

      return (
        result ||
        data.display_name.split(",").slice(0, 3).join(", ") ||
        `Điểm (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      );
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `Điểm (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
  }

  /**
   * Calculate route using OSRM
   * Free alternative to Google Directions API
   */
  async calculateRoute(points: LatLng[]): Promise<RouteResult> {
    try {
      if (points.length < 2) {
        throw new Error("At least 2 points required");
      }

      // Format coordinates for OSRM: lng,lat;lng,lat;...
      const coordinates = points
        .map((point) => `${point.lng},${point.lat}`)
        .join(";");

      const url = `${this.osrmBaseUrl}/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Route calculation failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error("No route found");
      }

      const route = data.routes[0];

      // Convert coordinates from GeoJSON to LatLng format
      const routeCoordinates: LatLng[] = route.geometry.coordinates.map(
        (coord: [number, number]) => ({
          lat: coord[1],
          lng: coord[0],
        })
      );

      return {
        distance: route.distance, // meters
        duration: Math.round(route.duration / 60), // convert to minutes
        coordinates: routeCoordinates,
        polyline: this.encodePolyline(routeCoordinates), // Simple encoding
      };
    } catch (error) {
      console.error("Route calculation error:", error);
      throw new Error("Unable to calculate route");
    }
  }

  /**
   * Optimize route order using OSRM Trip service
   * Free alternative to Google Route Optimization
   */
  async optimizeRoute(points: LatLng[]): Promise<{
    waypoint_order: number[];
    total_distance: number;
    total_duration: number;
    coordinates: LatLng[];
  }> {
    try {
      if (points.length < 3) {
        throw new Error("At least 3 points required for optimization");
      }

      // Format coordinates for OSRM Trip service
      const coordinates = points
        .map((point) => `${point.lng},${point.lat}`)
        .join(";");

      const url = `${this.osrmBaseUrl}/trip/v1/driving/${coordinates}?overview=full&geometries=geojson`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Route optimization failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.trips || data.trips.length === 0) {
        throw new Error("No optimized route found");
      }

      const trip = data.trips[0];

      // Get waypoint order from OSRM response
      const waypointOrder = data.waypoints.map((wp: any) => wp.waypoint_index);

      // Convert coordinates
      const routeCoordinates: LatLng[] = trip.geometry.coordinates.map(
        (coord: [number, number]) => ({
          lat: coord[1],
          lng: coord[0],
        })
      );

      return {
        waypoint_order: waypointOrder,
        total_distance: trip.distance,
        total_duration: Math.round(trip.duration / 60), // minutes
        coordinates: routeCoordinates,
      };
    } catch (error) {
      console.error("Route optimization error:", error);
      throw new Error("Unable to optimize route");
    }
  }

  /**
   * Simple polyline encoding (basic implementation)
   */
  private encodePolyline(coordinates: LatLng[]): string {
    // Simple encoding - in production you might want to use a proper polyline library
    return coordinates
      .map((coord) => `${coord.lat.toFixed(6)},${coord.lng.toFixed(6)}`)
      .join("|");
  }

  /**
   * Get tile layer URL for Leaflet
   */
  getTileLayerUrl(): string {
    return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  }

  /**
   * Get tile layer attribution
   */
  getTileLayerAttribution(): string {
    return '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  }

  /**
   * Get default map center (Ho Chi Minh City)
   */
  getDefaultCenter(): LatLng {
    return {
      lat: 10.8231,
      lng: 106.6297,
    };
  }

  /**
   * Calculate bounds for multiple points
   */
  calculateBounds(points: LatLng[]): {
    north: number;
    south: number;
    east: number;
    west: number;
  } {
    if (points.length === 0) {
      const center = this.getDefaultCenter();
      return {
        north: center.lat + 0.01,
        south: center.lat - 0.01,
        east: center.lng + 0.01,
        west: center.lng - 0.01,
      };
    }

    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
  }
}

// Export singleton instance
const leafletService = new LeafletService();
export default leafletService;

// Export class for testing
export { LeafletService };
