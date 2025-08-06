import React from 'react';
import { mockAttendance } from '../mockData';

interface AttendanceWidgetProps {
  className?: string;
  onDrilldown?: () => void;
}

export function AttendanceWidget({ className = '', onDrilldown }: AttendanceWidgetProps) {
  const totalAbsences = mockAttendance.reduce((a: number, b) => a + b.totalAbsences, 0);
  const totalLate = mockAttendance.reduce((a: number, b) => a + b.totalLate, 0);
  const avgOnTime = mockAttendance.reduce((a: number, b) => a + b.onTimeRate, 0) / mockAttendance.length;
  const warnings = mockAttendance.flatMap(a => a.warningCollectors);
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-lg">Điểm danh nhân viên</div>
        {onDrilldown && (
          <button className="text-xs text-primary underline hover:opacity-80" onClick={onDrilldown}>Xem chi tiết</button>
        )}
      </div>
      <div className="flex gap-4 mb-2 text-sm">
        <div>Vắng: <span className="font-semibold text-red-500">{totalAbsences}</span></div>
        <div>Trễ: <span className="font-semibold text-yellow-600">{totalLate}</span></div>
        <div>Đúng giờ: <span className="font-semibold text-green-600">{(avgOnTime * 100).toFixed(1)}%</span></div>
      </div>
      <div className="flex flex-col gap-1 mb-2 text-xs">
        {warnings.length > 0 ? (
          <div>Cảnh báo: {warnings.map((w: { name: string; absences: number }) => `${w.name} (${w.absences} lần)`).join(', ')}</div>
        ) : (
          <div>Không có nhân viên bị cảnh báo</div>
        )}
      </div>
      <div className="h-16 flex items-end gap-2">
        {/* Mini bar chart by shift (placeholder) */}
        {mockAttendance.map((a, i: number) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className="w-6 bg-green-300/30 rounded-t" style={{ height: `${a.onTimeRate * 60 + 10}px` }} />
            <div className="text-xs mt-1 text-gray-500">{a.shift === 'morning' ? 'Sáng' : 'Chiều'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
