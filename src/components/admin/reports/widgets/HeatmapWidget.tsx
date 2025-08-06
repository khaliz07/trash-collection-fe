import React from 'react';
import { mockHeatmap } from '../mockData';

function getColor(val: number, type: 'performance' | 'negative' | 'low'): string {
  if (type === 'performance') {
    if (val > 0.8) return 'bg-green-400';
    if (val > 0.7) return 'bg-yellow-300';
    return 'bg-red-400';
  }
  if (type === 'negative') {
    if (val < 0.1) return 'bg-green-400';
    if (val < 0.15) return 'bg-yellow-300';
    return 'bg-red-400';
  }
  if (type === 'low') {
    if (val < 0.2) return 'bg-green-400';
    if (val < 0.3) return 'bg-yellow-300';
    return 'bg-red-400';
  }
  return 'bg-gray-200';
}

interface HeatmapWidgetProps {
  className?: string;
  onAreaClick?: (area: string) => void;
}

export function HeatmapWidget({ className = '', onAreaClick }: HeatmapWidgetProps) {
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      <div className="font-semibold text-lg mb-2">Bản đồ nhiệt (Heatmap)</div>
      <div className="grid grid-cols-3 gap-4">
        {mockHeatmap.map((a, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-100 rounded p-2 transition"
            onClick={() => onAreaClick?.(a.area)}
          >
            <div className="font-semibold text-gray-700">{a.area}</div>
            <div className="flex gap-2">
              <div className={`w-8 h-8 rounded ${getColor(a.performance, 'performance')}`} title="Hiệu suất" />
              <div className={`w-8 h-8 rounded ${getColor(a.negativeRating, 'negative')}`} title="Đánh giá tiêu cực" />
              <div className={`w-8 h-8 rounded ${getColor(a.lowPayment, 'low')}`} title="Thanh toán thấp" />
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
              <span>Hiệu suất: {(a.performance * 100).toFixed(0)}%</span>
              <span>Tiêu cực: {(a.negativeRating * 100).toFixed(0)}%</span>
              <span>Thanh toán: {(a.lowPayment * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-400">* Click vào khu vực để xem chi tiết</div>
    </div>
  );
}
