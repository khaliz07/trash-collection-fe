/**
 * Simple Route types for new Route table
 */

export interface TrackPoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface StartTime {
  day: string; // "monday", "tuesday", etc.
  time: string; // "08:00", "14:30", etc.
}

export interface SimpleRoute {
  id: string;
  name: string;
  description?: string;
  startTime: StartTime[]; // Multiple start times
  status: RouteStatus;
  trackPoints: TrackPoint[]; // Route coordinates
  estimated_duration: number; // minutes
  total_distance_km?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSimpleRouteRequest {
  name: string;
  description?: string;
  schedule_time: string; // Will be converted to startTime array
  estimated_duration: number;
  status: RouteStatus;
  pickup_points: Array<{
    address: string;
    lat: number;
    lng: number;
    user_id?: string;
  }>;
  trackPoints?: TrackPoint[]; // Optional, will be generated from pickup_points
  total_distance_km?: number;
}

export enum RouteStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

// Response types
export interface SimpleRouteListResponse {
  routes: SimpleRoute[];
}

export interface SimpleRouteResponse extends SimpleRoute {}
