import { CollectionPoint, CollectionStatus, Collector } from '@/types/collection';

export const mockTodayCollectionPoints: CollectionPoint[] = [
  {
    id: 'CP001',
    address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
    scheduledTime: '08:00',
    wasteType: 'Rác sinh hoạt',
    specialNotes: 'Cần phân loại rác tại chỗ',
    status: CollectionStatus.PENDING,
    requiresPhoto: true,
    location: {
      lat: 10.729567,
      lng: 106.694255
    }
  },
  {
    id: 'CP002',
    address: '456 Lê Văn Lương, Quận 7, TP.HCM',
    scheduledTime: '09:30',
    wasteType: 'Rác tái chế',
    status: CollectionStatus.IN_PROGRESS,
    requiresPhoto: false,
    location: {
      lat: 10.728123,
      lng: 106.695789
    },
    checkInTime: '09:35',
    checkInLocation: {
      lat: 10.728125,
      lng: 106.695790
    }
  },
  {
    id: 'CP003',
    address: '789 Huỳnh Tấn Phát, Quận 7, TP.HCM',
    scheduledTime: '10:00',
    wasteType: 'Rác sinh hoạt',
    status: CollectionStatus.COMPLETED,
    requiresPhoto: true,
    location: {
      lat: 10.732456,
      lng: 106.698123
    },
    checkInTime: '10:05',
    checkInLocation: {
      lat: 10.732460,
      lng: 106.698125
    },
    photo: '/images/thung-rac-240l-6240.jpg',
    note: 'Đã thu gom đầy đủ, phân loại tốt'
  },
  {
    id: 'CP004',
    address: '321 Nguyễn Thị Thập, Quận 7, TP.HCM',
    scheduledTime: '11:30',
    wasteType: 'Rác sinh hoạt',
    status: CollectionStatus.CANNOT_COLLECT,
    requiresPhoto: true,
    location: {
      lat: 10.735789,
      lng: 106.699456
    },
    checkInTime: '11:35',
    checkInLocation: {
      lat: 10.735790,
      lng: 106.699458
    },
    photo: '/images/thung-rac-240l-6240.jpg',
    note: 'Không thể thu gom do đường bị chặn bởi công trình xây dựng'
  }
];

export const mockCollector: Collector = {
  id: 'COL001',
  name: 'Nguyễn Văn A',
  zone: 'Quận 7 - Khu vực 1',
  vehicle: 'Xe tải 51H-123.45'
}; 