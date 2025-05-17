export interface PerformanceSummaryData {
  totalCollections: number;
  onTimeRate: number; // %
  urgentHandled: number;
  positiveFeedback: number;
  negativeFeedback: number;
  absences: number;
  ranking?: number;
  avgSystemCollections?: number;
}

export interface PerformanceChartData {
  date: string; // yyyy-mm-dd
  collections: number;
  onTime: number;
  late: number;
  missed: number;
}

export interface CollectionHistoryItem {
  id: string;
  date: string;
  address: string;
  status: 'on_time' | 'late' | 'missed';
  feedback?: 'positive' | 'negative';
  note?: string;
} 