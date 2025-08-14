export interface LatLng {
  lat: number;
  lng: number;
}

export interface GoogleRoute {
  polyline: string;
  distance: number; // in meters
  duration: number; // in seconds
}

/**
 * Service class for Google Maps API integration
 */
export class GoogleMapsService {
  private directionsService: google.maps.DirectionsService | null = null;
  private geocoder: google.maps.Geocoder | null = null;

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    if (typeof window !== "undefined" && window.google) {
      this.directionsService = new google.maps.DirectionsService();
      this.geocoder = new google.maps.Geocoder();
    }
  }

  /**
   * Create an optimized route through multiple points
   */
  async createRoute(points: google.maps.LatLngLiteral[]): Promise<{
    polyline: string;
    distance: number;
    duration: number;
  }> {
    if (!this.directionsService) {
      throw new Error("Google Maps not initialized");
    }

    if (points.length < 2) {
      throw new Error("Need at least 2 points to create a route");
    }

    const [origin, ...rest] = points;
    const destination = rest.pop() || origin;
    const waypoints = rest.map((point) => ({
      location: point,
      stopover: true,
    }));

    return new Promise((resolve, reject) => {
      this.directionsService!.route(
        {
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            const route = result.routes[0];
            const distance = route.legs.reduce(
              (total, leg) => total + (leg.distance?.value || 0),
              0
            );
            const duration = route.legs.reduce(
              (total, leg) => total + (leg.duration?.value || 0),
              0
            );

            resolve({
              polyline: route.overview_polyline,
              distance,
              duration: Math.round(duration / 60), // Convert to minutes
            });
          } else {
            reject(new Error("Failed to create route"));
          }
        }
      );
    });
  }

  /**
   * Optimize route order using Google Directions API
   */
  async optimizeRoute(points: google.maps.LatLngLiteral[]): Promise<{
    waypoint_order: number[];
    polyline: string;
    duration: number;
  }> {
    if (!this.directionsService) {
      throw new Error("Google Maps not initialized");
    }

    if (points.length < 3) {
      throw new Error("Need at least 3 points to optimize");
    }

    const [origin, ...rest] = points;
    const destination = rest.pop()!;
    const waypoints = rest.map((point) => ({
      location: point,
      stopover: true,
    }));

    return new Promise((resolve, reject) => {
      this.directionsService!.route(
        {
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            const route = result.routes[0];
            const duration = route.legs.reduce(
              (total, leg) => total + (leg.duration?.value || 0),
              0
            );

            resolve({
              waypoint_order: result.routes[0].waypoint_order || [],
              polyline: route.overview_polyline,
              duration: Math.round(duration / 60), // Convert to minutes
            });
          } else {
            reject(new Error("Failed to optimize route"));
          }
        }
      );
    });
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(address: string): Promise<LatLng> {
    if (!this.geocoder) {
      throw new Error("Google Maps not initialized");
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          reject(new Error("Failed to geocode address"));
        }
      });
    });
  }

  /**
   * Check if the Google Maps API is available
   */
  isAvailable(): boolean {
    return !!(
      typeof window !== "undefined" &&
      window.google &&
      this.directionsService &&
      this.geocoder
    );
  }
}

export default GoogleMapsService;
