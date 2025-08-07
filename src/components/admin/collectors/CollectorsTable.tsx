import * as React from 'react';
import type { Collector } from './types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface CollectorsTableProps {
  collectors?: Collector[];
  onViewDetail?: (collector: Collector) => void;
  onEdit?: (collector: Collector) => void;
  onSuspend?: (collector: Collector) => void;
  onDelete?: (collector: Collector) => void;
  onViewReviews?: (collector: Collector) => void;
}

export function CollectorsTable({
  collectors = [],
  onViewDetail,
  onEdit,
  onSuspend,
  onDelete,
  onViewReviews,
}: CollectorsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left">Họ tên</th>
            <th className="px-4 py-2 text-left">SĐT</th>
            <th className="px-4 py-2 text-left">CCCD</th>
            <th className="px-4 py-2 text-left">Biển số xe</th>
            <th className="px-4 py-2 text-left">Ngày bắt đầu</th>
            <th className="px-4 py-2 text-left">Đánh giá</th>
            <th className="px-4 py-2 text-left">Trạng thái</th>
            <th className="px-4 py-2 text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {collectors.map((c) => (
            <tr key={c.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 font-medium">{c.name}</td>
              <td className="px-4 py-2">{c.phone || 'N/A'}</td>
              <td className="px-4 py-2">{c.cccd || 'Chưa cập nhật'}</td>
              <td className="px-4 py-2">{c.licensePlate || 'Chưa cập nhật'}</td>
              <td className="px-4 py-2">
                {c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </td>
              <td className="px-4 py-2 cursor-pointer" onClick={() => onViewReviews?.(c)}>
                <span className="inline-flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < Math.round(c.rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                  ))}
                  <span className="ml-1 text-xs text-gray-500">({c.reviewCount})</span>
                </span>
              </td>
              <td className="px-4 py-2">
                <Badge style={{textWrap:'nowrap'}} variant={
                  c.status === 'ACTIVE' ? 'success' : c.status === 'INACTIVE' ? 'warning' : 'error'
                }>
                  {c.status === 'ACTIVE' ? 'Đang hoạt động' : c.status === 'INACTIVE' ? 'Tạm nghỉ' : 'Tạm ngưng'}
                </Badge>
              </td>
              <td className="px-4 py-2 space-x-1">
                <Button size="sm" variant="outline" onClick={() => onViewDetail?.(c)}>Xem</Button>
                <Button size="sm" variant="secondary" onClick={() => onEdit?.(c)}>Sửa</Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete?.(c)} disabled={c.status === 'ACTIVE'}>Xóa</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CollectorsTable;