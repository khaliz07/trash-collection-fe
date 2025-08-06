import { CollectionPoint, CollectionStatus } from '@/types/collection';

function randomStatus(idx: number): CollectionStatus {
  if (idx % 4 === 0) return CollectionStatus.PENDING;
  if (idx % 4 === 1) return CollectionStatus.IN_PROGRESS;
  if (idx % 4 === 2) return CollectionStatus.COMPLETED;
  return CollectionStatus.CANNOT_COLLECT;
}

function randomWasteType(idx: number) {
  const types = ['Rác sinh hoạt', 'Rác tái chế', 'Rác cồng kềnh', 'Rác nguy hại'];
  return types[idx % types.length];
}

function randomNote(idx: number) {
  const notes = [
    undefined,
    'Cần phân loại rác tại chỗ',
    'Có vật sắc nhọn',
    'Đường vào nhỏ, xe lớn không vào được',
    'Đã thu gom đầy đủ, phân loại tốt',
    'Không thể thu gom do đường bị chặn',
    'Rác để ngoài cổng',
    'Cần thu gom gấp',
  ];
  return notes[idx % notes.length];
}

export const mockCollectionPoints: CollectionPoint[] = Array.from({ length: 20 }).map((_, i) => {
  const status = randomStatus(i);
  const completed = status === CollectionStatus.COMPLETED;
  const cannotCollect = status === CollectionStatus.CANNOT_COLLECT;
  return {
    id: `CP${(i + 1).toString().padStart(3, '0')}`,
    address: `${100 + i} Đường ${String.fromCharCode(65 + (i % 26))}, Quận ${1 + (i % 12)}, TP.HCM`,
    scheduledTime: `${8 + (i % 6)}:${(i * 7) % 60}`.padStart(5, '0'),
    wasteType: randomWasteType(i),
    specialNotes: i % 3 === 0 ? randomNote(i) : undefined,
    status,
    requiresPhoto: i % 2 === 0,
    location: {
      lat: 10.75 + (i * 0.01),
      lng: 106.68 + (i * 0.01),
    },
    checkInTime: status === CollectionStatus.IN_PROGRESS || completed || cannotCollect ? `0${8 + (i % 6)}:${(i * 7 + 5) % 60}`.padStart(5, '0') : undefined,
    checkInLocation: status === CollectionStatus.IN_PROGRESS || completed || cannotCollect ? {
      lat: 10.75 + (i * 0.01) + 0.0005,
      lng: 106.68 + (i * 0.01) + 0.0005,
    } : undefined,
    photo: completed || cannotCollect ? '/images/thung-rac-240l-6240.jpg' : undefined,
    note: completed ? 'Đã thu gom đầy đủ, phân loại tốt' : cannotCollect ? 'Không thể thu gom do đường bị chặn' : randomNote(i),
  };
}); 