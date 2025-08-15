/**
 * Route Assignment types for schedule management
 */

export enum AssignmentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface RouteAssignment {
  id: string;
  route_id: string;
  collector_id: string;
  assigned_date: string;
  status: AssignmentStatus;
  time_window_start: string;
  time_window_end: string;
  started_at?: string;
  completed_at?: string;
  actual_distance?: number;
  actual_duration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  route: {
    id: string;
    name: string;
    description?: string;
    estimated_duration: number;
    total_distance_km?: string;
    trackPoints: any[];
  };
  collector: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    cccd?: string;
    licensePlate?: string;
    rating?: number;
  };
}

export interface CreateRouteAssignmentRequest {
  route_id: string;
  collector_id: string;
  assigned_date: string;
  time_window_start: string;
  time_window_end: string;
  status?: AssignmentStatus;
  notes?: string;
}

export interface UpdateRouteAssignmentRequest {
  status?: AssignmentStatus;
  time_window_start?: string;
  time_window_end?: string;
  started_at?: string;
  completed_at?: string;
  actual_distance?: number;
  actual_duration?: number;
  notes?: string;
}

// Response types
export interface RouteAssignmentListResponse {
  assignments: RouteAssignment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RouteAssignmentResponse extends RouteAssignment {}

// Helper function to get status display text
export function getAssignmentStatusText(status: AssignmentStatus): string {
  switch (status) {
    case AssignmentStatus.PENDING:
      return "CHUẨN BỊ";
    case AssignmentStatus.IN_PROGRESS:
      return "ĐANG THỰC HIỆN";
    case AssignmentStatus.COMPLETED:
      return "HOÀN THÀNH";
    case AssignmentStatus.CANCELLED:
      return "ĐÃ HỦY";
    default:
      return status;
  }
}

// Helper function to get progress percentage
export function getStatusProgress(status: AssignmentStatus): number {
  switch (status) {
    case AssignmentStatus.PENDING:
      return 0;
    case AssignmentStatus.IN_PROGRESS:
      return 50;
    case AssignmentStatus.COMPLETED:
      return 100;
    case AssignmentStatus.CANCELLED:
      return 0;
    default:
      return 0;
  }
}

// Helper function to get status badge variant
export function getStatusBadgeVariant(status: AssignmentStatus): 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary' {
  switch (status) {
    case AssignmentStatus.PENDING:
      return "warning";
    case AssignmentStatus.IN_PROGRESS:
      return "info";
    case AssignmentStatus.COMPLETED:
      return "success";
    case AssignmentStatus.CANCELLED:
      return "error";
    default:
      return "default";
  }
}
