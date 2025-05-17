import type {
  PerformanceReport,
  RatingReport,
  UserPaymentReport,
  CollectorPaymentReport,
  AttendanceReport,
  UrgentRequestReport,
  HeatmapData,
  DrilldownLateShift,
  DrilldownCollectorProfile,
  DrilldownLowPaymentHousehold,
  DrilldownNegativePointFeedback,
} from './types';

export const mockPerformance: PerformanceReport[] = [
  // Quận 1
  { date: '2024-06-10', totalPoints: 120, completedPoints: 110, onTimePoints: 100, latePoints: 8, canceledPoints: 2, avgCompletionTime: 42, area: 'Quận 1' },
  { date: '2024-06-09', totalPoints: 115, completedPoints: 105, onTimePoints: 97, latePoints: 6, canceledPoints: 2, avgCompletionTime: 41, area: 'Quận 1' },
  { date: '2024-06-08', totalPoints: 118, completedPoints: 112, onTimePoints: 104, latePoints: 7, canceledPoints: 1, avgCompletionTime: 43, area: 'Quận 1' },
  { date: '2024-06-07', totalPoints: 122, completedPoints: 120, onTimePoints: 110, latePoints: 8, canceledPoints: 2, avgCompletionTime: 40, area: 'Quận 1' },
  { date: '2024-06-06', totalPoints: 119, completedPoints: 115, onTimePoints: 108, latePoints: 5, canceledPoints: 1, avgCompletionTime: 39, area: 'Quận 1' },
  // Quận 3
  { date: '2024-06-10', totalPoints: 90, completedPoints: 80, onTimePoints: 75, latePoints: 4, canceledPoints: 1, avgCompletionTime: 39, area: 'Quận 3' },
  { date: '2024-06-09', totalPoints: 92, completedPoints: 85, onTimePoints: 80, latePoints: 3, canceledPoints: 2, avgCompletionTime: 38, area: 'Quận 3' },
  { date: '2024-06-08', totalPoints: 88, completedPoints: 78, onTimePoints: 70, latePoints: 6, canceledPoints: 2, avgCompletionTime: 40, area: 'Quận 3' },
  { date: '2024-06-07', totalPoints: 95, completedPoints: 90, onTimePoints: 85, latePoints: 4, canceledPoints: 1, avgCompletionTime: 37, area: 'Quận 3' },
  { date: '2024-06-06', totalPoints: 91, completedPoints: 83, onTimePoints: 77, latePoints: 5, canceledPoints: 3, avgCompletionTime: 36, area: 'Quận 3' },
  // Quận 7
  { date: '2024-06-10', totalPoints: 100, completedPoints: 90, onTimePoints: 85, latePoints: 3, canceledPoints: 2, avgCompletionTime: 41, area: 'Quận 7' },
  { date: '2024-06-09', totalPoints: 98, completedPoints: 88, onTimePoints: 80, latePoints: 5, canceledPoints: 3, avgCompletionTime: 42, area: 'Quận 7' },
  { date: '2024-06-08', totalPoints: 102, completedPoints: 95, onTimePoints: 90, latePoints: 4, canceledPoints: 3, avgCompletionTime: 40, area: 'Quận 7' },
  { date: '2024-06-07', totalPoints: 105, completedPoints: 100, onTimePoints: 92, latePoints: 6, canceledPoints: 2, avgCompletionTime: 39, area: 'Quận 7' },
  { date: '2024-06-06', totalPoints: 99, completedPoints: 92, onTimePoints: 85, latePoints: 5, canceledPoints: 2, avgCompletionTime: 38, area: 'Quận 7' },
];

export const mockRating: RatingReport = {
  area: 'Toàn hệ thống',
  avgRating: 4.3,
  starCounts: [2, 5, 12, 30, 51],
  topCollectors: [
    { id: 'col1', name: 'Trần Văn Bình', avgRating: 4.9, totalReviews: 40 },
    { id: 'col2', name: 'Nguyễn Thị Hoa', avgRating: 4.8, totalReviews: 35 },
    { id: 'col3', name: 'Lê Văn Cường', avgRating: 4.7, totalReviews: 32 },
    { id: 'col4', name: 'Phạm Thị Mai', avgRating: 4.7, totalReviews: 30 },
    { id: 'col5', name: 'Đỗ Văn Hùng', avgRating: 4.6, totalReviews: 28 },
  ],
  lowCollectors: [
    { id: 'col6', name: 'Ngô Thị Hạnh', avgRating: 3.2, totalReviews: 12 },
    { id: 'col7', name: 'Vũ Minh Tuấn', avgRating: 3.5, totalReviews: 15 },
    { id: 'col8', name: 'Bùi Thị Lan', avgRating: 3.7, totalReviews: 18 },
    { id: 'col9', name: 'Lý Văn Sơn', avgRating: 3.8, totalReviews: 20 },
    { id: 'col10', name: 'Trịnh Thị Thu', avgRating: 3.9, totalReviews: 22 },
  ],
  feedbackRate: 0.82,
  negativeHeatmap: [
    { area: 'Quận 1', count: 3 },
    { area: 'Quận 3', count: 5 },
    { area: 'Quận 7', count: 2 },
  ],
};

export const mockUserPayment: UserPaymentReport = {
  period: '2024-06',
  totalPaid: 12000000,
  totalHouseholds: 200,
  paidHouseholds: 150,
  methodStats: [
    { method: 'momo', count: 60 },
    { method: 'bank', count: 50 },
    { method: 'cash', count: 40 },
  ],
  lowPaymentAreas: [
    { area: 'Quận 3', rate: 0.28 },
    { area: 'Quận 7', rate: 0.32 },
  ],
};

export const mockCollectorPayment: CollectorPaymentReport = {
  period: '2024-06',
  totalPaid: 9000000,
  totalCollectors: 20,
  paidCollectors: 15,
  areaStats: [
    { area: 'Quận 1', total: 3000000 },
    { area: 'Quận 3', total: 2500000 },
    { area: 'Quận 7', total: 3500000 },
  ],
  lastPaid: [
    { id: 'col1', name: 'Trần Văn Bình', lastPaidAt: '2024-06-05' },
    { id: 'col2', name: 'Nguyễn Thị Hoa', lastPaidAt: '2024-06-06' },
  ],
};

export const mockAttendance: AttendanceReport[] = [
  { date: '2024-06-10', totalAbsences: 2, totalLate: 5, onTimeRate: 0.91, shift: 'morning', warningCollectors: [ { id: 'col7', name: 'Vũ Minh Tuấn', absences: 2 } ] },
  { date: '2024-06-10', totalAbsences: 1, totalLate: 3, onTimeRate: 0.95, shift: 'afternoon', warningCollectors: [ { id: 'col6', name: 'Ngô Thị Hạnh', absences: 1 } ] },
];

export const mockUrgentRequest: UrgentRequestReport = {
  date: '2024-06-10',
  totalRequests: 12,
  handled24h: 10,
  overdue: 2,
  areaStats: [
    { area: 'Quận 1', count: 4 },
    { area: 'Quận 3', count: 5 },
    { area: 'Quận 7', count: 3 },
  ],
  mainCollectors: [
    { id: 'col1', name: 'Trần Văn Bình', count: 3 },
    { id: 'col2', name: 'Nguyễn Thị Hoa', count: 2 },
  ],
};

export const mockHeatmap: HeatmapData[] = [
  { area: 'Quận 1', performance: 0.85, negativeRating: 0.12, lowPayment: 0.25 },
  { area: 'Quận 3', performance: 0.78, negativeRating: 0.18, lowPayment: 0.32 },
  { area: 'Quận 7', performance: 0.82, negativeRating: 0.09, lowPayment: 0.28 },
];

// Drilldown mock (ví dụ)
export const mockLateShifts: DrilldownLateShift[] = [
  { id: 'ls1', code: 'SCH1001', area: 'Quận 1', date: '2024-06-10', start: '07:00', end: '08:30', reason: 'Kẹt xe', collector: { id: 'col7', name: 'Vũ Minh Tuấn' } },
  { id: 'ls2', code: 'SCH1002', area: 'Quận 3', date: '2024-06-10', start: '08:00', end: '09:20', reason: 'Mưa lớn', collector: { id: 'col6', name: 'Ngô Thị Hạnh' } },
];

export const mockCollectorProfile: DrilldownCollectorProfile = {
  id: 'col1',
  name: 'Trần Văn Bình',
  totalShifts: 120,
  avgRating: 4.9,
  attendanceHistory: [
    { date: '2024-06-01', status: 'on-time' },
    { date: '2024-06-02', status: 'late' },
    { date: '2024-06-03', status: 'on-time' },
  ],
  paymentHistory: [
    { period: '2024-05', amount: 3000000, paidAt: '2024-05-05' },
    { period: '2024-06', amount: 3200000, paidAt: '2024-06-05' },
  ],
  feedbacks: [
    { id: 'fb1', content: 'Rất nhiệt tình', rating: 5, date: '2024-06-01' },
    { id: 'fb2', content: 'Đôi khi đến trễ', rating: 3, date: '2024-06-02' },
  ],
};

export const mockLowPaymentHouseholds: DrilldownLowPaymentHousehold[] = [
  { id: 'h1', name: 'Nguyễn Văn A', address: '123 Nguyễn Văn Linh, Q.7', status: 'unpaid', lastPaidAt: '2024-05-10', method: 'momo' },
  { id: 'h2', name: 'Trần Thị B', address: '456 Lê Văn Lương, Q.7', status: 'unpaid' },
];

export const mockNegativeFeedbacks: DrilldownNegativePointFeedback[] = [
  { id: 'nf1', content: 'Rác chưa được thu đúng giờ', rating: 2, date: '2024-06-10', area: 'Quận 3', images: ['/feedbacks/img1.jpg'] },
  { id: 'nf2', content: 'Nhân viên không thân thiện', rating: 1, date: '2024-06-09', area: 'Quận 1' },
];
