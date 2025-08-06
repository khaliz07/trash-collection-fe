import * as React from 'react';
import type { Schedule } from './types';

export interface ScheduleTableProps {
  schedules: Schedule[];
  onRowClick: (schedule: Schedule) => void;
}

export function statusLabel(status: string) {
  switch (status) {
    case 'pending': return 'Chờ thực hiện';
    case 'in_progress': return 'Đang thực hiện';
    case 'completed': return 'Hoàn thành';
    case 'cancelled': return 'Đã hủy';
    default: return status;
  }
}

export function statusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function ScheduleTable({ schedules, onRowClick }: ScheduleTableProps) {

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left">Mã lịch trình</th>
            <th className="px-4 py-2 text-left">Thời gian</th>
            <th className="px-4 py-2 text-left">Loại rác</th>
            <th className="px-4 py-2 text-left">Trạng thái</th>
            <th className="px-4 py-2 text-left">Nhân viên</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(sch => (
            <tr key={sch.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick(sch)}>
              <td className="px-4 py-2 font-medium">{sch.code}</td>
              <td className="px-4 py-2 text-sm">{new Date(sch.startTime).toLocaleString()}<br/>-<br/>{new Date(sch.endTime).toLocaleString()}</td>
              <td className="px-4 py-2">{sch.wasteType}</td>
              <td className="px-4 py-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColor(sch.status)}`}>{statusLabel(sch.status)}</span>
              </td>
              <td className="px-4 py-2 flex items-center gap-2">
                <img src={sch.collector.avatarUrl} alt={sch.collector.name} className="w-7 h-7 rounded-full object-cover" />
                <span>{sch.collector.name}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleTable; 