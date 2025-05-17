import { CollectionStatus } from '@/types/collection';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: CollectionStatus.PENDING, label: 'Chưa thu', variant: 'warning' },
  { value: CollectionStatus.IN_PROGRESS, label: 'Đang thu', variant: 'info' },
  { value: CollectionStatus.COMPLETED, label: 'Đã thu', variant: 'success' },
  { value: CollectionStatus.CANNOT_COLLECT, label: 'Không thể thu', variant: 'error' },
];

interface FilterBarProps {
  status: CollectionStatus[];
  onStatusChange: (status: CollectionStatus[]) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function FilterBar({ status, onStatusChange, search, onSearchChange }: FilterBarProps) {
  const handleToggleStatus = (s: CollectionStatus) => {
    if (status.includes(s)) {
      onStatusChange(status.filter((item) => item !== s));
    } else {
      onStatusChange([...status, s]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <Badge
            key={opt.value}
            variant={opt.variant as any}
            className={cn(
              'cursor-pointer',
              status.includes(opt.value) ? 'ring-2 ring-primary' : 'opacity-60'
            )}
            onClick={() => handleToggleStatus(opt.value)}
          >
            {opt.label}
          </Badge>
        ))}
      </div>
      <div className="flex-1 flex gap-2">
        <Input
          className="w-full md:w-64"
          placeholder="Tìm kiếm địa chỉ hoặc mã điểm..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <Button variant="ghost" onClick={() => onSearchChange('')}>Xóa</Button>
        )}
      </div>
    </div>
  );
} 