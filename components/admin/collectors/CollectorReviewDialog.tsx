import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { Collector, CollectorReview } from './types';

export interface CollectorReviewDialogProps {
  open: boolean;
  onClose: () => void;
  collector: Collector | null;
  reviews: CollectorReview[];
}

export function CollectorReviewDialog({ open, onClose, collector, reviews }: CollectorReviewDialogProps) {
  const [star, setStar] = React.useState<number | 'all'>('all');
  if (!collector) return null;
  const filtered = star === 'all' ? reviews : reviews.filter(r => r.rating === star);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Đánh giá nhân viên: {collector.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-3 flex gap-2 items-center">
          <span>Lọc theo số sao:</span>
          <button className={`px-2 py-1 rounded ${star==='all'?'bg-primary text-white':'bg-gray-100'}`} onClick={()=>setStar('all')}>Tất cả</button>
          {[5,4,3,2,1].map(s => (
            <button key={s} className={`px-2 py-1 rounded ${star===s?'bg-yellow-400 text-white':'bg-gray-100'}`} onClick={()=>setStar(s)}>{s}★</button>
          ))}
        </div>
        <div className="max-h-80 overflow-y-auto">
          <table className="min-w-full border rounded bg-white">
            <thead>
              <tr className="bg-gray-50 text-xs">
                <th className="px-3 py-2 text-left">Người đánh giá</th>
                <th className="px-3 py-2 text-left">Số sao</th>
                <th className="px-3 py-2 text-left">Bình luận</th>
                <th className="px-3 py-2 text-left">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">Ẩn</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx} className={idx < r.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                      ))}
                    </span>
                  </td>
                  <td className="px-3 py-2">{r.comment || '-'}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center text-gray-400 py-2">Không có đánh giá</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <DialogFooter>
          <button className="bg-primary text-white rounded px-4 py-2" onClick={onClose}>Đóng</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CollectorReviewDialog; 