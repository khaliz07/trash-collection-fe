/**
 * Type definitions for routing system
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface TimeWindow {
  start: string; // "08:00"
  end: string; // "12:00"
}

export interface RouteData {
  id: string;
  route_name: string;
  route_code: string;
  work_zone_id?: string;
  description?: string;

  // Google Maps integration
  route_path: any; // Google Directions API response
  route_polyline: string; // Encoded polyline from Google
  total_distance_km: number;
  estimated_time_min: number;

  // Schedule configuration
  active_days: string[]; // ["monday", "wednesday", "friday"]
  time_windows: TimeWindow[];

  // Status and metadata
  status: RouteStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;

  // Legacy fields for backward compatibility
  name?: string;
  isActive?: boolean;
  routeGeometry?: any;
  waypoints?: any;
  estimatedDuration?: number;
  estimatedDistance?: number;
  difficultyLevel?: number;
  scheduledDays?: string[];
  startTime?: string;
  endTime?: string;
}

export interface UrgentPoint {
  id: string;
  user_id: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  requested_date: string;
  urgency_level: UrgencyLevel;
  waste_description: string;
  status: UrgentStatus;
  assigned_route_id?: string;
  assigned_collector_id?: string;
  assigned_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RouteAssignmentData {
  id: string;
  route_id: string;
  collector_id: string;
  assigned_date: string;
  time_window_start: string;
  time_window_end: string;
  status: AssignmentStatus;
  started_at?: string;
  completed_at?: string;
  actual_distance?: number;
  actual_duration?: number; // in minutes
  created_at: string;
  updated_at: string;

  // Populated relations
  collector?: CollectorInfo;
  route?: RouteData;
}

export interface CollectorInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  licensePlate?: string;
  status: UserStatus;

  // Performance metrics
  completedRoutes?: number;
  onTimePercentage?: number;
  experienceMonths?: number;
  totalReviews?: number;
  isPreferred?: boolean;

  // Current workload
  currentLoad?: {
    routes_today: number;
    total_routes: number;
    current_route_id?: string;
  };

  // Today's schedule
  todaySchedule?: Array<{
    route_name: string;
    time_window: string;
    status: string;
  }>;

  // Recent performance stats
  recentStats?: {
    on_time_percentage: number;
    completion_rate: number;
    urgent_response_time: number; // average minutes
  };

  // Availability status
  availability: "available" | "busy" | "preferred" | "offline";
  avatarUrl?: string;
}

export interface RouteWithUrgents {
  route: RouteData;
  urgent_points: UrgentPoint[];
  assigned_collector?: CollectorInfo;
}

export interface RouteHistoryItem {
  id: string;
  route_id: string;
  collector_id: string;
  assigned_date: string;
  time_window_start: string;
  time_window_end: string;
  status: AssignmentStatus;
  started_at?: string;
  completed_at?: string;
  actual_distance?: number;
  actual_duration?: number;
  efficiency_score?: number;
  urgent_requests_handled: number;
  urgent_requests?: UrgentPoint[];
  notes?: string;

  // Performance metrics for this execution
  performance_metrics?: {
    on_time_percentage: number;
    completion_rate: number;
    avg_response_time: number;
    customer_rating: number;
  };
}

export interface ActiveRoute {
  route_id: string;
  collector_id: string;
  assigned_date: string;
  time_window_start: string;
  time_window_end: string;
  current_location?: LatLng;
  progress_percentage?: number;
}

// Enums matching Prisma schema
export enum RouteStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

export enum AssignmentStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum UrgencyLevel {
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum UrgentStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum UserRole {
  USER = "USER",
  COLLECTOR = "COLLECTOR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

// Google Maps specific types
export interface GoogleRoute {
  polyline: string;
  distance: number; // in kilometers
  duration: number; // in minutes
  waypoints: number[];
  path: LatLng[];
}

export interface LocationMetadata {
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp?: number;
}

// API response types
export interface RouteCreateRequest {
  route_name: string;
  route_code: string;
  work_zone_id?: string;
  description?: string;
  waypoints: LatLng[];
  active_days: string[];
  time_windows: TimeWindow[];
  status?: RouteStatus;
}

export interface RouteUpdateRequest extends Partial<RouteCreateRequest> {
  id: string;
}

export interface UrgentRequestCreateRequest {
  user_id: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  urgency_level: UrgencyLevel;
  waste_description: string;
}

export interface RouteAssignmentRequest {
  route_id: string;
  collector_id: string;
  assigned_date: string;
  time_window_start: string;
  time_window_end: string;
}

// Utility types for forms and components
export interface RouteFormData {
  route_name: string;
  route_code: string;
  work_zone_id?: string;
  description?: string;
  active_days: string[];
  time_windows: TimeWindow[];
  status: RouteStatus;
  waypoints: LatLng[];
}

export interface CollectorFilters {
  availability: "all" | "available" | "busy" | "preferred";
  experience: "all" | "expert" | "experienced" | "beginner";
  rating: "all" | "excellent" | "good" | "average";
}

export interface HistoryFilters {
  dateRange: "7" | "30" | "90" | "365" | "all";
  status: "all" | "completed" | "in_progress" | "cancelled" | "missed";
  sortBy:
    | "date_desc"
    | "date_asc"
    | "duration_desc"
    | "duration_asc"
    | "efficiency_desc";
}

// Component prop types
export interface ScheduleSidebarProps {
  open: boolean;
  schedule: ScheduleData | null;
  onClose: () => void;
}

export interface ScheduleData {
  id: string;
  route: RouteData;
  collector: CollectorInfo;
  assignedDate: string;
  timeWindow: TimeWindow;
  startTime: string;
  wasteType: string;
  urgentRequests?: UrgentPoint[];
}

// Validation schemas (for use with form libraries)
export interface RouteValidationErrors {
  route_name?: string;
  route_code?: string;
  active_days?: string;
  time_windows?: string;
  waypoints?: string;
}

// Helper utility types
export type RouteStatusColor = {
  [K in RouteStatus]: string;
};

export type UrgencyLevelColor = {
  [K in UrgencyLevel]: string;
};

export type AssignmentStatusColor = {
  [K in AssignmentStatus]: string;
};

// Constants for styling and labels
export const ROUTE_STATUS_COLORS: RouteStatusColor = {
  [RouteStatus.DRAFT]: "bg-gray-100 text-gray-800",
  [RouteStatus.ACTIVE]: "bg-green-100 text-green-800",
  [RouteStatus.INACTIVE]: "bg-yellow-100 text-yellow-800",
  [RouteStatus.ARCHIVED]: "bg-red-100 text-red-800",
};

export const URGENCY_LEVEL_COLORS: UrgencyLevelColor = {
  [UrgencyLevel.MEDIUM]: "bg-blue-100 text-blue-800",
  [UrgencyLevel.HIGH]: "bg-orange-100 text-orange-800",
  [UrgencyLevel.CRITICAL]: "bg-red-100 text-red-800",
};

export const ASSIGNMENT_STATUS_COLORS: AssignmentStatusColor = {
  [AssignmentStatus.PENDING]: "bg-gray-100 text-gray-800",
  [AssignmentStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [AssignmentStatus.COMPLETED]: "bg-green-100 text-green-800",
  [AssignmentStatus.CANCELLED]: "bg-red-100 text-red-800",
};

// Label mappings for Vietnamese UI
export const ROUTE_STATUS_LABELS = {
  [RouteStatus.DRAFT]: "Bản nháp",
  [RouteStatus.ACTIVE]: "Đang hoạt động",
  [RouteStatus.INACTIVE]: "Tạm dừng",
  [RouteStatus.ARCHIVED]: "Lưu trữ",
};

export const URGENCY_LEVEL_LABELS = {
  [UrgencyLevel.MEDIUM]: "Trung bình",
  [UrgencyLevel.HIGH]: "Cao",
  [UrgencyLevel.CRITICAL]: "Khẩn cấp",
};

export const ASSIGNMENT_STATUS_LABELS = {
  [AssignmentStatus.PENDING]: "Chờ xử lý",
  [AssignmentStatus.IN_PROGRESS]: "Đang thực hiện",
  [AssignmentStatus.COMPLETED]: "Hoàn thành",
  [AssignmentStatus.CANCELLED]: "Đã hủy",
};

export const DAY_LABELS = {
  monday: "T2",
  tuesday: "T3",
  wednesday: "T4",
  thursday: "T5",
  friday: "T6",
  saturday: "T7",
  sunday: "CN",
};

// Request types for API
export interface CreateRouteRequest {
  name: string;
  description?: string;
  assigned_collector_id: string;
  schedule_time: string;
  estimated_duration: number;
  status: RouteStatus;
  pickup_points: Array<{
    address: string;
    lat: number;
    lng: number;
    user_id?: string;
  }>;
}

// Utility types for API responses and data manipulation
export interface RouteWithUrgents {
  route: RouteData;
  urgent_points: UrgentPoint[];
}

export type RouteUpdate = Partial<
  Omit<RouteData, "id" | "created_at" | "updated_at">
>;
