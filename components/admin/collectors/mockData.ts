import type {
  Collector,
  CollectorStatus,
  CollectorArea,
  CollectorReview,
  CollectorPerformance,
  CollectorHistory,
} from './types';

export const mockAreas: CollectorArea[] = [
  { id: 'area1', name: 'Quận 1' },
  { id: 'area2', name: 'Quận 3' },
  { id: 'area3', name: 'Quận 7' },
  { id: 'area4', name: 'Quận 5' },
  { id: 'area5', name: 'Quận 10' },
];

const names = [
  'Trần Văn Bình', 'Nguyễn Thị Hoa', 'Lê Văn Cường', 'Phạm Minh Tuấn', 'Võ Thị Hồng',
  'Đỗ Quang Huy', 'Bùi Thị Lan', 'Ngô Văn Dũng', 'Phan Thị Mai', 'Vũ Đức Anh',
  'Hoàng Thị Hạnh', 'Đặng Văn Sơn', 'Lý Thị Thu', 'Tạ Minh Khoa', 'Trịnh Thị Yến',
  'Mai Văn Phát', 'Châu Thị Kim', 'Lương Văn Hòa', 'Tống Thị Hương', 'Đinh Văn Lộc',
  'Trương Thị Ngọc', 'Huỳnh Văn Tài', 'Cao Thị Bích', 'Kiều Minh Đức', 'Lâm Thị Tuyết',
  'Quách Văn Hùng', 'Thái Thị Hòa', 'Đoàn Văn Phúc', 'Từ Thị Thanh', 'Giang Văn Hậu'
];

export const mockCollectors: Collector[] = [
  ...Array.from({ length: 30 }).map((_, i) => {
    const area = mockAreas[i % mockAreas.length];
    const status: CollectorStatus = i % 5 === 0 ? 'terminated' : i % 3 === 0 ? 'inactive' : 'active';
    const rating = Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 - 5.0
    const reviewCount = Math.floor(Math.random() * 50) + 5;
    const startYear = 2020 + (i % 4);
    const startMonth = (i % 12) + 1;
    const startDay = (i % 28) + 1;
    return {
      id: `c${i+1}`,
      name: names[i],
      phone: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
      area,
      status,
      startDate: `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`,
      rating,
      reviewCount,
      cccd: `0123456789${String(i+1).padStart(3, '0')}`,
      email: `user${i+1}@example.com`,
    };
  }),
];

export const mockCollectorReviews: CollectorReview[] = [
  {
    id: 'r1',
    collectorId: 'c1',
    user: 'user1',
    rating: 5,
    comment: 'Rất nhiệt tình, đúng giờ!',
    createdAt: '2023-12-01T08:30:00Z',
  },
  {
    id: 'r2',
    collectorId: 'c1',
    user: 'user2',
    rating: 4,
    comment: 'Làm việc tốt.',
    createdAt: '2023-11-20T10:00:00Z',
  },
  {
    id: 'r3',
    collectorId: 'c2',
    user: 'user3',
    rating: 5,
    comment: 'Rất thân thiện.',
    createdAt: '2023-10-15T09:00:00Z',
  },
  {
    id: 'r4',
    collectorId: 'c3',
    user: 'user4',
    rating: 2,
    comment: 'Thường xuyên đi trễ.',
    createdAt: '2023-09-10T07:45:00Z',
  },
];

export const mockCollectorPerformance: CollectorPerformance[] = [
  {
    collectorId: 'c1',
    totalCollections: 120,
    onTimeRate: 97,
    reviewCount: 32,
    avgRating: 4.5,
  },
  {
    collectorId: 'c2',
    totalCollections: 150,
    onTimeRate: 99,
    reviewCount: 41,
    avgRating: 4.8,
  },
  {
    collectorId: 'c3',
    totalCollections: 80,
    onTimeRate: 85,
    reviewCount: 18,
    avgRating: 3.9,
  },
];

export const mockCollectorHistory: CollectorHistory[] = [
  {
    collectorId: 'c1',
    date: '2022-01-10',
    event: 'Bắt đầu làm việc',
  },
  {
    collectorId: 'c1',
    date: '2022-06-01',
    event: 'Chuyển khu vực',
    detail: 'Từ Quận 3 sang Quận 1',
  },
  {
    collectorId: 'c2',
    date: '2021-08-15',
    event: 'Bắt đầu làm việc',
  },
  {
    collectorId: 'c3',
    date: '2020-05-20',
    event: 'Bắt đầu làm việc',
  },
  {
    collectorId: 'c3',
    date: '2023-08-01',
    event: 'Nghỉ việc',
  },
]; 