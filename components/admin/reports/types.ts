export {};

// Hiệu suất thu gom
export interface PerformanceReport {
  date: string; // yyyy-mm-dd
  totalPoints: number;
  completedPoints: number;
  onTimePoints: number;
  latePoints: number;
  canceledPoints: number;
  avgCompletionTime: number; // minutes
  area: string;
}

// Đánh giá & hài lòng
export interface RatingReport {
  area: string;
  avgRating: number;
  starCounts: number[]; // [1,2,3,4,5]
  topCollectors: Array<{ id: string; name: string; avgRating: number; totalReviews: number }>;
  lowCollectors: Array<{ id: string; name: string; avgRating: number; totalReviews: number }>;
  feedbackRate: number; // %
  negativeHeatmap: Array<{ area: string; count: number }>;
}

// Thanh toán hộ dân
export interface UserPaymentReport {
  period: string;
  totalPaid: number;
  totalHouseholds: number;
  paidHouseholds: number;
  methodStats: Array<{ method: string; count: number }>;
  lowPaymentAreas: Array<{ area: string; rate: number }>;
}

// Thanh toán nhân viên
export interface CollectorPaymentReport {
  period: string;
  totalPaid: number;
  totalCollectors: number;
  paidCollectors: number;
  areaStats: Array<{ area: string; total: number }>;
  lastPaid: Array<{ id: string; name: string; lastPaidAt: string }>;
}

// Điểm danh nhân viên
export interface AttendanceReport {
  date: string;
  totalAbsences: number;
  totalLate: number;
  onTimeRate: number;
  shift: 'morning' | 'afternoon';
  warningCollectors: Array<{ id: string; name: string; absences: number }>;
}

// Yêu cầu khẩn cấp
export interface UrgentRequestReport {
  date: string;
  totalRequests: number;
  handled24h: number;
  overdue: number;
  areaStats: Array<{ area: string; count: number }>;
  mainCollectors: Array<{ id: string; name: string; count: number }>;
}

// Heatmap
export interface HeatmapData {
  area: string;
  performance: number;
  negativeRating: number;
  lowPayment: number;
}

// Drill-down types (ví dụ cho sidebar)
export interface DrilldownLateShift {
  id: string;
  code: string;
  area: string;
  date: string;
  start: string;
  end: string;
  reason: string;
  collector: { id: string; name: string };
}

export interface DrilldownCollectorProfile {
  id: string;
  name: string;
  totalShifts: number;
  avgRating: number;
  attendanceHistory: Array<{ date: string; status: 'on-time' | 'late' | 'absent' }>;
  paymentHistory: Array<{ period: string; amount: number; paidAt: string }>;
  feedbacks: Array<{ id: string; content: string; rating: number; date: string }>;
}

export interface DrilldownLowPaymentHousehold {
  id: string;
  name: string;
  address: string;
  status: 'paid' | 'unpaid';
  lastPaidAt?: string;
  method?: string;
}

export interface DrilldownNegativePointFeedback {
  id: string;
  content: string;
  rating: number;
  date: string;
  images?: string[];
  area: string;
}
