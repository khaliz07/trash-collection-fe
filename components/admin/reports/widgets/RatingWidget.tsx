import React from 'react';
import { mockRating } from '../mockData';

interface RatingWidgetProps {
  className?: string;
  onDrilldown?: () => void;
}

export function RatingWidget({ className = '', onDrilldown }: RatingWidgetProps) {
  const totalReviews = mockRating.starCounts.reduce((a: number, b: number) => a + b, 0);
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-lg">Đánh giá & hài lòng</div>
        {onDrilldown && (
          <button className="text-xs text-primary underline hover:opacity-80" onClick={onDrilldown}>Xem phản hồi tiêu cực</button>
        )}
      </div>
      <div className="flex items-center gap-4 mb-2">
        <div className="text-3xl font-bold text-yellow-500">{mockRating.avgRating.toFixed(1)}</div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i: number) => (
            <span key={i} className={i < Math.round(mockRating.avgRating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
          ))}
        </div>
        <div className="text-xs text-gray-500">({totalReviews} đánh giá)</div>
      </div>
      <div className="flex gap-2 mb-2">
        {mockRating.starCounts.map((count: number, i: number) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className="h-2 w-full bg-yellow-100 rounded">
              <div className="h-2 rounded bg-yellow-400" style={{ width: `${(count / totalReviews) * 100}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">{5 - i}★</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 mb-2 text-xs">
        <div>Tỷ lệ có phản hồi: <span className="font-semibold text-primary">{(mockRating.feedbackRate * 100).toFixed(0)}%</span></div>
        <div>Top nhân viên tốt: <span className="font-semibold">{mockRating.topCollectors.slice(0, 3).map((c: { name: string }) => c.name).join(', ')}</span></div>
        <div>Vùng có đánh giá tiêu cực: <span className="text-red-500 font-semibold">{mockRating.negativeHeatmap.map((a: { area: string }) => a.area).join(', ')}</span></div>
      </div>
    </div>
  );
}
