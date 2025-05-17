import { PerformanceSummaryData, PerformanceChartData, CollectionHistoryItem } from './types';

export const mockPerformanceSummary: PerformanceSummaryData = {
  totalCollections: 128,
  onTimeRate: 92,
  urgentHandled: 14,
  positiveFeedback: 37,
  negativeFeedback: 3,
  absences: 1,
  ranking: 3,
  avgSystemCollections: 110,
};

export const mockPerformanceChart: PerformanceChartData[] = [
  { date: '2024-05-27', collections: 5, onTime: 5, late: 0, missed: 0 },
  { date: '2024-05-28', collections: 6, onTime: 5, late: 1, missed: 0 },
  { date: '2024-05-29', collections: 4, onTime: 4, late: 0, missed: 0 },
  { date: '2024-05-30', collections: 7, onTime: 6, late: 1, missed: 0 },
  { date: '2024-05-31', collections: 5, onTime: 4, late: 1, missed: 0 },
  { date: '2024-06-01', collections: 6, onTime: 5, late: 1, missed: 0 },
  { date: '2024-06-02', collections: 4, onTime: 3, late: 0, missed: 1 },
];

export const mockCollectionHistory: CollectionHistoryItem[] = [
  {
    id: 'COL001',
    date: '2024-06-02',
    address: '12 Nguyễn Văn Cừ, Quận 5',
    status: 'on_time',
    feedback: 'positive',
  },
  {
    id: 'COL002',
    date: '2024-06-02',
    address: '45 Lê Lợi, Quận 1',
    status: 'late',
    feedback: 'negative',
    note: 'Đến trễ do kẹt xe',
  },
  {
    id: 'COL003',
    date: '2024-06-01',
    address: '88 Trần Hưng Đạo, Quận 1',
    status: 'on_time',
    feedback: 'positive',
  },
  {
    id: 'COL004',
    date: '2024-06-01',
    address: '99 Nguyễn Thị Minh Khai, Quận 3',
    status: 'missed',
    note: 'Không điểm danh',
  },
  {
    id: 'COL005',
    date: '2024-05-31',
    address: '23 Lý Tự Trọng, Quận 1',
    status: 'on_time',
    feedback: 'positive',
  },
  {
    id: 'COL006',
    date: '2024-05-31',
    address: '77 Nguyễn Trãi, Quận 5',
    status: 'on_time',
  },
  {
    id: 'COL007',
    date: '2024-05-30',
    address: '11 Nguyễn Văn Linh, Quận 7',
    status: 'late',
    note: 'Đến trễ do thời tiết',
  },
  {
    id: 'COL008',
    date: '2024-05-29',
    address: '55 Lê Đại Hành, Quận 11',
    status: 'on_time',
    feedback: 'positive',
  },
  {
    id: 'COL009',
    date: '2024-05-28',
    address: '33 Nguyễn Đình Chiểu, Quận 3',
    status: 'on_time',
  },
  {
    id: 'COL010',
    date: '2024-05-27',
    address: '66 Nguyễn Thông, Quận 3',
    status: 'on_time',
    feedback: 'positive',
  },
]; 