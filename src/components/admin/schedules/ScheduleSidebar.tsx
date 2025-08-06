import * as React from 'react';
import type { Schedule } from './types';
import ScheduleMapView from './ScheduleMapView';
import { statusColor, statusLabel } from './ScheduleTable';

export interface ScheduleSidebarProps {
  open: boolean;
  schedule: Schedule | null;
  onClose: () => void;
}

export function ScheduleSidebar({ open, schedule, onClose }: ScheduleSidebarProps) {
  if (!schedule) return null;
  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity" onClick={onClose} />}
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-xl md:max-w-2xl lg:max-w-2xl bg-white shadow-lg flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{ width: '35vw', minWidth: 340 }}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="text-lg font-bold">Chi tiết lịch trình</div>
          <button className="text-2xl text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Thông tin chung */}
          <div>
            <div className="text-sm text-gray-500 mb-1">Mã lịch trình</div>
            <div className="font-semibold mb-2">{schedule.code}</div>
            <div className="flex flex-wrap gap-4 mb-2">
              <div>
                <span className="text-xs text-gray-500">Bắt đầu:</span> <span>{new Date(schedule.startTime).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500">Kết thúc:</span> <span>{new Date(schedule.endTime).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500">Loại rác:</span> <span>{schedule.wasteType}</span>
              </div>
              <div>
                <span className={`text-xs text-gray-500 `}>Trạng thái:</span> <span className={`font-semibold rounded-full px-2 py-1 ${statusColor(schedule.status)}`}>{statusLabel(schedule.status)}</span>
              </div>
            </div>
            {schedule.note && <div className="text-xs text-orange-600 mb-1">{schedule.note}</div>}
            {schedule.attachments && schedule.attachments.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">Tệp đính kèm:</div>
                <ul className="list-disc pl-5">
                  {schedule.attachments.map(f => (
                    <li key={f.id}><a href={f.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{f.name}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Nhân viên phụ trách */}
          <div className="border rounded p-3 flex items-center gap-4 bg-gray-50">
            <img src={schedule.collector.avatarUrl} alt={schedule.collector.name} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1">
              <div className="font-semibold">{schedule.collector.name}</div>
              <div className="text-xs text-gray-500">SĐT: {schedule.collector.phone}</div>
              <div className="flex items-center gap-1 text-yellow-500 text-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < Math.round(schedule.collector.rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                ))}
                <span className="ml-1 text-xs text-gray-500">({schedule.collector.reviewCount})</span>
                <button className="ml-2 text-xs text-blue-600 underline" onClick={() => { /* TODO: open review modal */ }}>Xem đánh giá</button>
              </div>
            </div>
            <button className="text-xs bg-primary text-white rounded px-3 py-1 font-semibold shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50" onClick={() => { /* TODO: open profile */ }}>Hồ sơ</button>
          </div>
          {/* Bản đồ */}
          <div>
            <div className="font-semibold mb-2">Tuyến đường thu gom</div>
            <ScheduleMapView points={schedule.route.points} />
          </div>
        </div>
        <div className="border-t px-6 py-4 flex gap-2 justify-end bg-white">
          <button className="rounded px-4 py-2 font-semibold shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300" onClick={onClose}>Đóng</button>
          <button className="rounded px-4 py-2 font-semibold shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400" >Chỉnh sửa</button>
          <button className="rounded px-4 py-2 font-semibold shadow-sm bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400" >Gửi thông báo</button>
          <button className="rounded px-4 py-2 font-semibold shadow-sm bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300" >Chuyển trạng thái</button>
          <button className="rounded px-4 py-2 font-semibold shadow-sm bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400" >Xóa lịch</button>
        </div>
      </aside>
    </>
  );
}

export default ScheduleSidebar; 