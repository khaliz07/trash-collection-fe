import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Collector, CollectorPerformance, CollectorHistory } from './types';

export interface CollectorDetailDialogProps {
  open: boolean;
  onClose: () => void;
  collector: Collector | null;
  performance?: CollectorPerformance;
  history?: CollectorHistory[];
}

export function CollectorDetailDialog({ open, onClose, collector, performance, history }: CollectorDetailDialogProps) {
  if (!collector) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết nhân viên</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="font-semibold text-lg mb-1">{collector.name}</div>
            <div className="text-sm text-gray-500 mb-1">SĐT: {collector.phone || 'N/A'}</div>
            <div className="text-sm text-gray-500 mb-1">CCCD: {collector.cccd || 'Chưa cập nhật'}</div>
            <div className="text-sm text-gray-500 mb-1">Biển số xe: {collector.licensePlate || 'Chưa cập nhật'}</div>
            <div className="text-sm text-gray-500 mb-1">Ngày bắt đầu: {collector.startDate ? new Date(collector.startDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
            {collector.email && <div className="text-sm text-gray-500 mb-1">Email: {collector.email}</div>}
            <div className="mt-2">
              <Badge variant={
                collector.status === 'ACTIVE' ? 'success' : collector.status === 'INACTIVE' ? 'warning' : 'error'
              }>
                {collector.status === 'ACTIVE' ? 'Đang hoạt động' : collector.status === 'INACTIVE' ? 'Tạm nghỉ' : 'Tạm ngưng'}
              </Badge>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Hiệu suất</div>
            {performance ? (
              <ul className="text-sm space-y-1">
                <li>Số lượt thu gom: <span className="font-medium">{performance.totalCollections}</span></li>
                <li>Tỉ lệ đúng giờ: <span className="font-medium">{performance.onTimeRate}%</span></li>
                <li>Số lần được đánh giá: <span className="font-medium">{collector.reviewCount}</span></li>
                <li>Đánh giá TB: <span className="font-medium">{collector.rating} ★</span></li>
              </ul>
            ) : (
              <ul className="text-sm space-y-1">
                <li>Số lần được đánh giá: <span className="font-medium">{collector.reviewCount}</span></li>
                <li>Đánh giá TB: <span className="font-medium">{collector.rating} ★</span></li>
              </ul>
            )}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Lịch sử làm việc</div>
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded bg-white">
              <thead>
                <tr className="bg-gray-50 text-xs">
                  <th className="px-3 py-2 text-left">Ngày</th>
                  <th className="px-3 py-2 text-left">Sự kiện</th>
                  <th className="px-3 py-2 text-left">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {history && history.length > 0 ? history.map((h, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{h.event}</td>
                    <td className="px-3 py-2">{h.detail || '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="text-center text-gray-400 py-2">Chưa có lịch sử</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter>
          <button className="bg-primary text-white rounded px-4 py-2" onClick={onClose}>Đóng</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CollectorDetailDialog; 