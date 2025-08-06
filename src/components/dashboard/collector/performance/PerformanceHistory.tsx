"use client";
import { mockCollectionHistory } from './mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function getStatusConfig(status: 'on_time' | 'late' | 'missed') {
  switch (status) {
    case 'on_time': return { label: 'Đúng giờ', variant: 'success' };
    case 'late': return { label: 'Trễ', variant: 'warning' };
    case 'missed': return { label: 'Bỏ sót', variant: 'error' };
    default: return { label: 'Không xác định', variant: 'default' };
  }
}

export function PerformanceHistory() {
  const data = mockCollectionHistory;
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-2">Lịch sử thu gom gần đây</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-muted-foreground">
              <th className="px-2 py-1 text-left">Ngày</th>
              <th className="px-2 py-1 text-left">Địa chỉ</th>
              <th className="px-2 py-1 text-left">Trạng thái</th>
              <th className="px-2 py-1 text-left">Đánh giá</th>
              <th className="px-2 py-1 text-left">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const status = getStatusConfig(item.status);
              return (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-2 py-1 whitespace-nowrap">{item.date}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{item.address}</td>
                  <td className="px-2 py-1"><Badge variant={status.variant as any}>{status.label}</Badge></td>
                  <td className="px-2 py-1">
                    {item.feedback === 'positive' && <span className="text-green-600 font-bold">+</span>}
                    {item.feedback === 'negative' && <span className="text-red-600 font-bold">-</span>}
                  </td>
                  <td className="px-2 py-1 text-xs text-muted-foreground">{item.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
} 