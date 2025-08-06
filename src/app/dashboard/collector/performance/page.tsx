import { PerformanceSummary } from '@/components/dashboard/collector/performance/PerformanceSummary';
import { PerformanceChart } from '@/components/dashboard/collector/performance/PerformanceChart';
import { PerformanceHistory } from '@/components/dashboard/collector/performance/PerformanceHistory';

export default function CollectorPerformancePage() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Hiệu suất cá nhân</h1>
      <PerformanceSummary />
      <PerformanceChart />
      <PerformanceHistory />
    </div>
  );
} 