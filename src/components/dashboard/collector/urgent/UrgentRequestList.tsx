"use client";
import { useState } from 'react';
import { mockUrgentRequests } from './mockData';
import { UrgentRequest, UrgentRequestStatus } from './types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UrgentRequestDetailDialog } from './UrgentRequestDetailDialog';

const STATUS_OPTIONS = [
  { value: undefined, label: 'Tất cả', variant: 'default' },
  { value: UrgentRequestStatus.PENDING, label: 'Chưa xử lý', variant: 'warning' },
  { value: UrgentRequestStatus.ACCEPTED, label: 'Đã nhận', variant: 'info' },
  { value: UrgentRequestStatus.COMPLETED, label: 'Đã hoàn tất', variant: 'success' },
];

function getStatusConfig(status: UrgentRequestStatus) {
  switch (status) {
    case UrgentRequestStatus.PENDING:
      return { label: 'Chưa xử lý', variant: 'warning' };
    case UrgentRequestStatus.ACCEPTED:
      return { label: 'Đã nhận', variant: 'info' };
    case UrgentRequestStatus.COMPLETED:
      return { label: 'Đã hoàn tất', variant: 'success' };
    default:
      return { label: 'Không xác định', variant: 'default' };
  }
}

export function UrgentRequestList() {
  const [filter, setFilter] = useState<UrgentRequestStatus | undefined>(undefined);
  const [selected, setSelected] = useState<UrgentRequest | null>(null);

  const filtered = filter
    ? mockUrgentRequests.filter((r) => r.status === filter)
    : mockUrgentRequests;

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">Yêu cầu khẩn cấp</h2>
      <div className="flex gap-2 mb-4">
        {STATUS_OPTIONS.map((opt) => (
          <Badge
            key={opt.label}
            variant={opt.variant as any}
            className={cn('cursor-pointer', filter === opt.value ? 'ring-2 ring-primary' : 'opacity-70')}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </Badge>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && <div className="text-center text-muted-foreground">Không có yêu cầu nào.</div>}
        {filtered.map((req) => {
          const status = getStatusConfig(req.status);
          return (
            <Card key={req.id} className="p-4 flex flex-col md:flex-row md:items-center gap-2 cursor-pointer hover:shadow" onClick={() => setSelected(req)}>
              <div className="flex-1">
                <div className="font-semibold">#{req.id} - {req.address}</div>
                <div className="text-xs text-muted-foreground">{req.createdAt.replace('T', ' ')}</div>
                <div className="text-sm">Loại rác: {req.wasteType} | Ước tính: {req.estimatedWeight}</div>
                {req.note && <div className="text-xs text-yellow-700">Ghi chú: {req.note}</div>}
              </div>
              <div className="flex flex-col items-end gap-1 min-w-[110px]">
                <Badge variant={status.variant as any}>{status.label}</Badge>
                {req.fee && <div className="text-xs text-primary font-semibold">Phí: {req.fee.toLocaleString()}đ</div>}
              </div>
            </Card>
          );
        })}
      </div>
      {selected && (
        <UrgentRequestDetailDialog
          request={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
} 