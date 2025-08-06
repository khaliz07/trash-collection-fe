"use client";
import { mockPerformanceChart, mockPerformanceSummary } from './mockData';
import { Card } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';

export function PerformanceChart() {
  const data = mockPerformanceChart;
  const avg = mockPerformanceSummary.avgSystemCollections;
  return (
    <Card className="p-4 mb-4">
      <h3 className="font-semibold mb-2">Biểu đồ hiệu suất tuần</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <XAxis dataKey="date" fontSize={12} />
          <YAxis fontSize={12} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="onTime" stackId="a" fill="#22c55e" name="Đúng giờ" />
          <Bar dataKey="late" stackId="a" fill="#f59e42" name="Trễ" />
          <Bar dataKey="missed" stackId="a" fill="#ef4444" name="Bỏ sót" />
        </BarChart>
      </ResponsiveContainer>
      {avg && (
        <div className="text-xs text-muted-foreground mt-2">Trung bình hệ thống: <span className="font-semibold">{avg} lượt/tuần</span></div>
      )}
    </Card>
  );
} 