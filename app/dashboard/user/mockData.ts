// Mock data for user collection schedule

export interface CollectionFeedback {
  stars: number;
  comment?: string;
  date: string; // ISO
  collectorId: string;
}

export interface CollectionSchedule {
  id: string;
  date: string; // ISO date
  type: 'regular' | 'urgent';
  status: 'collected' | 'pending' | 'overdue';
  address: string;
  feedback?: CollectionFeedback;
}

export const mockSchedule: CollectionSchedule[] = [
  // Đã thu gom hôm nay, chưa đánh giá (được phép đánh giá)
  {
    id: '1',
    date: new Date().toISOString().slice(0, 10),
    type: 'regular',
    status: 'collected',
    address: '123 Đường A, Phường B, Quận C',
  },
  // Đã thu gom 3 ngày trước, đã đánh giá (được phép cập nhật)
  {
    id: '2',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    type: 'regular',
    status: 'collected',
    address: '456 Đường D, Phường E, Quận F',
    feedback: {
      stars: 4,
      comment: 'Ổn, nhưng có thể nhanh hơn.',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      collectorId: 'collector-2',
    },
  },
  // Đã thu gom 10 ngày trước, đã đánh giá (không được phép cập nhật)
  {
    id: '3',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    type: 'regular',
    status: 'collected',
    address: '789 Đường G, Phường H, Quận I',
    feedback: {
      stars: 5,
      comment: 'Rất tốt!',
      date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      collectorId: 'collector-3',
    },
  },
  // Chưa thu gom (pending, không được đánh giá)
  {
    id: '4',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    type: 'regular',
    status: 'pending',
    address: '321 Đường J, Phường K, Quận L',
  },
  // Quá hạn (overdue, không được đánh giá)
  {
    id: '5',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    type: 'regular',
    status: 'overdue',
    address: '654 Đường M, Phường N, Quận O',
  },
]; 