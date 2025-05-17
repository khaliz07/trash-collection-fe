import { UrgentRequest, UrgentRequestStatus } from './types';

function randomStatus(idx: number): UrgentRequestStatus {
  if (idx % 3 === 0) return UrgentRequestStatus.PENDING;
  if (idx % 3 === 1) return UrgentRequestStatus.ACCEPTED;
  return UrgentRequestStatus.COMPLETED;
}

function randomWasteType(idx: number) {
  const types = ['Rác sinh hoạt', 'Rác tái chế', 'Rác cồng kềnh', 'Rác nguy hại'];
  return types[idx % types.length];
}

function randomNote(idx: number) {
  const notes = [
    '',
    'Có mùi hôi, cần xử lý sớm',
    'Có nhiều thùng carton lớn',
    'Khối lượng lớn, cần xe tải',
    'Yêu cầu thu gom ngoài giờ',
    'Có vật sắc nhọn, cần cẩn thận',
    'Địa chỉ khó tìm, liên hệ trước',
    'Có người già, cần hỗ trợ',
    'Rác để ngoài cổng',
    'Cần thu gom gấp',
  ];
  return notes[idx % notes.length];
}

function randomUser(idx: number) {
  const names = ['Nguyễn Thị B', 'Ẩn danh', 'Lê Văn D', 'Trần Văn E', 'Phạm Thị F', 'Hoàng Văn G', 'Vũ Thị H', 'Ngô Văn I', 'Đặng Thị J', 'Bùi Văn K'];
  return names[idx % names.length];
}

function randomCollector(idx: number) {
  const ids = ['COL001', 'COL002', 'COL003', 'COL004'];
  const names = ['Nguyễn Văn A', 'Trần Văn C', 'Lê Văn M', 'Phạm Văn N'];
  return { id: ids[idx % ids.length], name: names[idx % names.length] };
}

export const mockUrgentRequests: UrgentRequest[] = Array.from({ length: 30 }).map((_, i) => {
  const status = randomStatus(i);
  const collector = status !== UrgentRequestStatus.PENDING ? randomCollector(i) : undefined;
  return {
    id: `URG${(i + 1).toString().padStart(3, '0')}`,
    createdAt: `2024-06-01T${(8 + (i % 10)).toString().padStart(2, '0')}:${(i * 7) % 60}:00`,
    address: `${10 + (i % 90)} Đường ${String.fromCharCode(65 + (i % 26))}, Quận ${1 + (i % 12)}, TP.HCM`,
    wasteType: randomWasteType(i),
    estimatedWeight: `${2 + (i % 20)}kg`,
    note: randomNote(i),
    status,
    fee: 20000 + (i % 5) * 10000,
    userName: randomUser(i),
    collectorId: collector?.id,
    collectorName: collector?.name,
    completedPhotoUrl: status === UrgentRequestStatus.COMPLETED ? '/images/urgent-completed.jpg' : undefined,
  };
}); 