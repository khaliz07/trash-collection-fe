import React from 'react';
import { mockUrgentRequest } from '../mockData';

interface UrgentRequestWidgetProps {
  className?: string;
  onDrilldown?: () => void;
}

export function UrgentRequestWidget({ className = '', onDrilldown }: UrgentRequestWidgetProps) {
  const handledRate = mockUrgentRequest.handled24h / mockUrgentRequest.totalRequests;
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-lg">Xử lý yêu cầu khẩn cấp</div>
        {onDrilldown && (
          <button className="text-xs text-primary underline hover:opacity-80" onClick={onDrilldown}>Xem chi tiết</button>
        )}
      </div>
      <div className="flex gap-4 mb-2 text-sm">
        <div>Tổng: <span className="font-semibold text-primary">{mockUrgentRequest.totalRequests}</span></div>
        <div>Xử lý 24h: <span className="font-semibold text-green-600">{mockUrgentRequest.handled24h}</span> ({(handledRate * 100).toFixed(1)}%)</div>
        <div>Quá hạn: <span className="font-semibold text-red-500">{mockUrgentRequest.overdue}</span></div>
      </div>
      <div className="flex gap-2 mb-2">
        {mockUrgentRequest.areaStats.map((a: { area: string; count: number }) => (
          <div key={a.area} className="flex flex-col items-center flex-1">
            <div className="h-2 w-full bg-pink-100 rounded">
              <div className="h-2 rounded bg-pink-500" style={{ width: `${(a.count / mockUrgentRequest.totalRequests) * 100}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">{a.area}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500">Nhân viên chính: {mockUrgentRequest.mainCollectors.map((c: { name: string; count: number }) => `${c.name} (${c.count})`).join(', ')}</div>
    </div>
  );
}
