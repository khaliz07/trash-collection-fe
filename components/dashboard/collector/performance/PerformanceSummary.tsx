"use client";
import { mockPerformanceSummary } from './mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PerformanceSummary() {
  const data = mockPerformanceSummary;
  return (
    <Card className="p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-2xl font-bold">{data.totalCollections}</div>
          <div className="text-xs text-muted-foreground">Lượt thu gom</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{data.onTimeRate}%</div>
          <div className="text-xs text-muted-foreground">Tỷ lệ đúng giờ</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{data.urgentHandled}</div>
          <div className="text-xs text-muted-foreground">Yêu cầu khẩn đã xử lý</div>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-green-600">+{data.positiveFeedback}</span>
            <span className="text-2xl font-bold text-red-600">-{data.negativeFeedback}</span>
          </div>
          <div className="text-xs text-muted-foreground">Đánh giá (+/-)</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{data.absences}</div>
          <div className="text-xs text-muted-foreground">Vắng mặt</div>
        </div>
        {data.ranking && (
          <div>
            <div className="text-2xl font-bold">#{data.ranking}</div>
            <div className="text-xs text-muted-foreground">Xếp hạng nội bộ</div>
          </div>
        )}
        {data.avgSystemCollections && (
          <div>
            <div className="text-2xl font-bold">{data.avgSystemCollections}</div>
            <div className="text-xs text-muted-foreground">Trung bình hệ thống</div>
          </div>
        )}
      </div>
    </Card>
  );
} 