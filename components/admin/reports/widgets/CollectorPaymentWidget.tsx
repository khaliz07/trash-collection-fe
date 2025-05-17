import React from 'react';
import { mockCollectorPayment } from '../mockData';

interface CollectorPaymentWidgetProps {
  className?: string;
  onDrilldown?: () => void;
}

export function CollectorPaymentWidget({ className = '', onDrilldown }: CollectorPaymentWidgetProps) {
  const paidRate = mockCollectorPayment.paidCollectors / mockCollectorPayment.totalCollectors;
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-lg">Thanh toán cho nhân viên</div>
        {onDrilldown && (
          <button className="text-xs text-primary underline hover:opacity-80" onClick={onDrilldown}>Xem lịch sử thanh toán</button>
        )}
      </div>
      <div className="flex gap-4 mb-2">
        <div className="text-2xl font-bold text-primary">{mockCollectorPayment.totalPaid.toLocaleString()}₫</div>
        <div className="text-xs text-gray-500 flex flex-col justify-end">Tổng đã chi trả ({mockCollectorPayment.period})</div>
      </div>
      <div className="flex gap-4 mb-2 text-sm">
        <div>Đã thanh toán: <span className="font-semibold text-green-600">{mockCollectorPayment.paidCollectors}</span> / {mockCollectorPayment.totalCollectors} nhân viên ({(paidRate * 100).toFixed(1)}%)</div>
      </div>
      <div className="flex gap-2 mb-2">
        {mockCollectorPayment.areaStats.map((a: { area: string; total: number }) => (
          <div key={a.area} className="flex flex-col items-center flex-1">
            <div className="h-2 w-full bg-green-100 rounded">
              <div className="h-2 rounded bg-green-500" style={{ width: `${(a.total / mockCollectorPayment.totalPaid) * 100}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">{a.area}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500">Gần nhất: {mockCollectorPayment.lastPaid.map((c: { name: string; lastPaidAt: string }) => `${c.name} (${c.lastPaidAt})`).join(', ')}</div>
    </div>
  );
}
