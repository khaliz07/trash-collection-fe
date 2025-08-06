import type {
  Schedule,
  ScheduleStatus,
  ScheduleCollector,
  ScheduleReview,
  ScheduleAttachment,
  SchedulePoint,
  ScheduleRoute,
} from './types';

export const mockCollectors: ScheduleCollector[] = [
  {
    id: 'col1', name: 'Trần Văn Bình', avatarUrl: '/avatars/col1.png', phone: '0901234567', rating: 4.5, reviewCount: 32,
  },
  {
    id: 'col2', name: 'Nguyễn Thị Hoa', avatarUrl: '/avatars/col2.png', phone: '0912345678', rating: 4.8, reviewCount: 41,
  },
  {
    id: 'col3', name: 'Lê Văn Cường', avatarUrl: '/avatars/col3.png', phone: '0934567890', rating: 3.9, reviewCount: 18,
  },
];

export const mockSchedules: Schedule[] = Array.from({ length: 12 }).map((_, i) => {
  const statusArr: ScheduleStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];
  const wasteTypes = ['Rác sinh hoạt', 'Rác tái chế', 'Rác cồng kềnh', 'Rác nguy hại'];
  const collector = mockCollectors[i % mockCollectors.length];
  const points: SchedulePoint[] = [
    { id: `p${i}a`, lat: 10.76 + i * 0.01, lng: 106.68 + i * 0.01, address: `Điểm đầu ${i+1}`, type: 'start' },
    { id: `p${i}b`, lat: 10.765 + i * 0.01, lng: 106.685 + i * 0.01, address: `Điểm thu 1 - ${i+1}`, type: 'normal' },
    { id: `p${i}c`, lat: 10.77 + i * 0.01, lng: 106.69 + i * 0.01, address: `Điểm thu 2 - ${i+1}`, type: 'normal' },
    { id: `p${i}d`, lat: 10.775 + i * 0.01, lng: 106.695 + i * 0.01, address: `Điểm cuối ${i+1}`, type: 'end' },
  ];
  const attachments: ScheduleAttachment[] = i % 3 === 0 ? [
    { id: `f${i}a`, name: `file${i+1}.pdf`, url: `/files/file${i+1}.pdf` },
  ] : [];
  return {
    id: `sch${i+1}`,
    code: `SCH${1000 + i}`,
    startTime: `2024-06-${String(10 + i).padStart(2, '0')}T08:00:00`,
    endTime: `2024-06-${String(10 + i).padStart(2, '0')}T10:00:00`,
    wasteType: wasteTypes[i % wasteTypes.length],
    status: statusArr[i % statusArr.length],
    note: i % 4 === 0 ? 'Lưu ý: tuyến đường có sửa chữa.' : '',
    attachments,
    collector,
    route: { points },
  };
});

export const mockScheduleReviews: ScheduleReview[] = [
  { id: 'r1', collectorId: 'col1', user: 'user1', rating: 5, comment: 'Rất tốt', createdAt: '2024-06-01T08:30:00Z' },
  { id: 'r2', collectorId: 'col1', user: 'user2', rating: 4, comment: 'Đúng giờ', createdAt: '2024-06-02T09:00:00Z' },
  { id: 'r3', collectorId: 'col2', user: 'user3', rating: 5, comment: 'Thân thiện', createdAt: '2024-06-03T10:00:00Z' },
  { id: 'r4', collectorId: 'col3', user: 'user4', rating: 3, comment: 'Cần cải thiện', createdAt: '2024-06-04T11:00:00Z' },
]; 