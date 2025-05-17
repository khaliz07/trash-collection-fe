import React from 'react';
import { mockUserPayment } from '../mockData';

interface UserPaymentWidgetProps {
  className?: string;
  onDrilldown?: () => void;
}

export function UserPaymentWidget({ className = '', onDrilldown }: UserPaymentWidgetProps) {
  const paidRate = mockUserPayment.paidHouseholds / mockUserPayment.totalHouseholds;
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-lg">Thanh toán từ người dân</div>
        {onDrilldown && (
          <button className="text-xs text-primary underline hover:opacity-80" onClick={onDrilldown}>Xem chi tiết hộ dân</button>
        )}
      </div>
      <div className="flex gap-4 mb-2">
        <div className="text-2xl font-bold text-primary">{mockUserPayment.totalPaid.toLocaleString()}₫</div>
        <div className="text-xs text-gray-500 flex flex-col justify-end">Tổng đã thanh toán ({mockUserPayment.period})</div>
      </div>
      <div className="flex gap-4 mb-2 text-sm">
        <div>Đã thanh toán: <span className="font-semibold text-green-600">{mockUserPayment.paidHouseholds}</span> / {mockUserPayment.totalHouseholds} hộ ({(paidRate * 100).toFixed(1)}%)</div>
      </div>
      <div className="flex gap-2 mb-2">
        {mockUserPayment.methodStats.map((m: { method: string; count: number }) => (
          <div key={m.method} className="flex flex-col items-center flex-1">
            <div className="h-2 w-full bg-blue-100 rounded">
              <div className="h-2 rounded bg-blue-500" style={{ width: `${(m.count / mockUserPayment.paidHouseholds) * 100}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">{m.method}</div>
          </div>
        ))}
      </div>
      {mockUserPayment.lowPaymentAreas.length > 0 && (
        <div className="text-xs text-red-500 font-semibold">Cảnh báo: Khu vực có tỷ lệ thanh toán thấp: {mockUserPayment.lowPaymentAreas.map((a: { area: string; rate: number }) => `${a.area} (${(a.rate * 100).toFixed(0)}%)`).join(', ')}</div>
      )}
    </div>
  );
}
