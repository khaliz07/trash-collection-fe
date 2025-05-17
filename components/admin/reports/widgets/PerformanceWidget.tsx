import React, { useState } from 'react';
import { mockPerformance } from '../mockData';

interface PerformanceWidgetProps {
  className?: string;
  onDrilldown?: () => void;
}

export function PerformanceWidget({ className = '', onDrilldown }: PerformanceWidgetProps) {
  // Group by area
  const areaMap: Record<string, typeof mockPerformance[0][]> = {};
  mockPerformance.forEach((item) => {
    if (!areaMap[item.area]) areaMap[item.area] = [];
    areaMap[item.area].push(item);
  });
  const areaStats = Object.entries(areaMap).map(([area, items]) => {
    const totalPoints = items.reduce((a, b) => a + b.totalPoints, 0);
    const completedPoints = items.reduce((a, b) => a + b.completedPoints, 0);
    const onTimePoints = items.reduce((a, b) => a + b.onTimePoints, 0);
    const latePoints = items.reduce((a, b) => a + b.latePoints, 0);
    const canceledPoints = items.reduce((a, b) => a + b.canceledPoints, 0);
    const avgCompletionTime = items.reduce((a, b) => a + b.avgCompletionTime, 0) / items.length;
    return {
      area,
      totalPoints,
      completedPoints,
      onTimePoints,
      latePoints,
      canceledPoints,
      avgCompletionTime,
    };
  });

  // Tổng toàn hệ thống
  const total = areaStats.reduce((acc, cur) => {
    acc.totalPoints += cur.totalPoints;
    acc.completedPoints += cur.completedPoints;
    acc.onTimePoints += cur.onTimePoints;
    acc.latePoints += cur.latePoints;
    acc.canceledPoints += cur.canceledPoints;
    acc.avgCompletionTime += cur.avgCompletionTime;
    return acc;
  }, { totalPoints: 0, completedPoints: 0, onTimePoints: 0, latePoints: 0, canceledPoints: 0, avgCompletionTime: 0 });
  const areaCount = areaStats.length;
  const onTimeRate = total.onTimePoints / (total.completedPoints || 1);
  const lateRate = total.latePoints / (total.completedPoints || 1);
  const avgTime = total.avgCompletionTime / (areaCount || 1);

  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-lg">Hiệu suất thu gom</div>
        {onDrilldown && (
          <button className="text-xs text-primary underline hover:opacity-80" onClick={onDrilldown}>Xem chi tiết</button>
        )}
      </div>
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex gap-4 text-sm">
          <div><span className="font-bold text-xl text-primary">{total.completedPoints}</span> / {total.totalPoints} điểm đã thu</div>
          <div className="text-green-600">Đúng lịch: {(onTimeRate * 100).toFixed(1)}%</div>
          <div className="text-yellow-600">Trễ: {(lateRate * 100).toFixed(1)}%</div>
          <div className="text-gray-500">Huỷ: {total.canceledPoints}</div>
        </div>
        <div className="text-xs text-gray-500">Thời gian hoàn thành TB: <span className="font-semibold text-gray-700">{avgTime.toFixed(1)} phút</span></div>
      </div>
      <div className="h-24 flex items-end gap-2 relative">
        {/* Mini bar chart by area */}
        {areaStats.map((stat) => {
          const percent = stat.completedPoints / (stat.totalPoints || 1);
          const isHovered = hoveredArea === stat.area;
          return (
            <div
              key={stat.area}
              className="flex flex-col items-center flex-1 relative"
              onMouseEnter={() => setHoveredArea(stat.area)}
              onMouseLeave={() => setHoveredArea(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 z-20 bg-white border border-gray-200 shadow-lg rounded p-3 text-xs w-48 pointer-events-none animate-fade-in">
                  <div className="font-semibold text-primary mb-1">{stat.area}</div>
                  <div>Đã thu: <span className="font-bold">{stat.completedPoints}</span> / {stat.totalPoints}</div>
                  <div>Đúng giờ: <span className="text-green-600">{((stat.onTimePoints / (stat.completedPoints || 1)) * 100).toFixed(1)}%</span></div>
                  <div>Trễ: <span className="text-yellow-600">{((stat.latePoints / (stat.completedPoints || 1)) * 100).toFixed(1)}%</span></div>
                  <div>Huỷ: <span className="text-gray-500">{stat.canceledPoints}</span></div>
                  <div>Thời gian TB: <span className="text-gray-700">{stat.avgCompletionTime.toFixed(1)} phút</span></div>
                </div>
              )}
              <div className="w-6 bg-primary/30 rounded-t transition-all duration-200" style={{ height: `${percent * 60 + 10}px` }} />
              <div className="text-xs mt-1 text-gray-500">{stat.area}</div>
              <div className="text-[10px] text-gray-400">{stat.completedPoints}/{stat.totalPoints}</div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
