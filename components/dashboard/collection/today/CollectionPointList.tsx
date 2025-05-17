'use client'

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CollectionPoint, CollectionStatus, CollectionPointFilters, CollectionPointSortOption } from '@/types/collection';
import { CollectionPointCard } from './CollectionPointCard';
interface CollectionPointListProps {
  points: CollectionPoint[];
  onCheckIn: (pointId: string) => void;
  onUpdateStatus?: (pointId: string, status: CollectionStatus) => void;
  onOpenMap?: (pointId: string) => void;
  onUploadPhoto?: (pointId: string) => void;
  onAddNote?: (pointId: string) => void;
}

const SORT_OPTIONS: CollectionPointSortOption[] = [
  { field: 'scheduledTime', direction: 'asc' },
  { field: 'scheduledTime', direction: 'desc' },
  { field: 'status', direction: 'asc' },
  { field: 'status', direction: 'desc' },
  { field: 'address', direction: 'asc' },
  { field: 'address', direction: 'desc' }
];

const SORT_LABELS = {
  scheduledTime: {
    asc: 'Thời gian - Tăng dần',
    desc: 'Thời gian - Giảm dần'
  },
  status: {
    asc: 'Trạng thái - Tăng dần',
    desc: 'Trạng thái - Giảm dần'
  },
  address: {
    asc: 'Địa chỉ - A-Z',
    desc: 'Địa chỉ - Z-A'
  }
};

export function CollectionPointList({
  points,
  onCheckIn,
  onUpdateStatus,
  onOpenMap,
  onUploadPhoto,
  onAddNote
}: CollectionPointListProps) {
  const [filters, setFilters] = useState<CollectionPointFilters>({});
  const [sortOption, setSortOption] = useState<CollectionPointSortOption>(SORT_OPTIONS[0]);

  // Filter points based on current filters
  const filteredPoints = points.filter(point => {
    if (filters.status && point.status !== filters.status) {
      return false;
    }
    // Add more filter conditions as needed
    return true;
  });

  // Sort filtered points based on current sort option
  const sortedPoints = [...filteredPoints].sort((a, b) => {
    switch (sortOption.field) {
      case 'scheduledTime':
        return sortOption.direction === 'asc'
          ? a.scheduledTime.localeCompare(b.scheduledTime)
          : b.scheduledTime.localeCompare(a.scheduledTime);
      case 'status':
        return sortOption.direction === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      case 'address':
        return sortOption.direction === 'asc'
          ? a.address.localeCompare(b.address)
          : b.address.localeCompare(a.address);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <div className="flex gap-4">
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => 
            setFilters({ ...filters, status: value === 'all' ? undefined : value as CollectionStatus })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.values(CollectionStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status === CollectionStatus.PENDING && 'Chưa thu'}
                {status === CollectionStatus.IN_PROGRESS && 'Đang thu'}
                {status === CollectionStatus.COMPLETED && 'Đã thu'}
                {status === CollectionStatus.CANNOT_COLLECT && 'Không thể thu'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={`${sortOption.field}_${sortOption.direction}`}
          onValueChange={(value) => {
            const [field, direction] = value.split('_');
            setSortOption({
              field: field as CollectionPointSortOption['field'],
              direction: direction as 'asc' | 'desc'
            });
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem
                key={`${option.field}_${option.direction}`}
                value={`${option.field}_${option.direction}`}
              >
                {SORT_LABELS[option.field][option.direction]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Points List */}
      {sortedPoints.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Không có điểm thu gom nào
        </p>
      ) : (
        <div className="space-y-4">
          {sortedPoints.map((point) => (
            <CollectionPointCard
              key={point.id}
              point={point}
              onCheckIn={() => onCheckIn(point.id)}
              onUpdateStatus={(status) => onUpdateStatus?.(point.id, status)}
              onOpenMap={() => onOpenMap?.(point.id)}
              onUploadPhoto={() => onUploadPhoto?.(point.id)}
              onAddNote={() => onAddNote?.(point.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 