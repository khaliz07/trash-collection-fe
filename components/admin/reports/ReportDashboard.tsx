import { useState } from 'react';
import { PerformanceWidget } from './widgets/PerformanceWidget';
import { RatingWidget } from './widgets/RatingWidget';
import { UserPaymentWidget } from './widgets/UserPaymentWidget';
import { CollectorPaymentWidget } from './widgets/CollectorPaymentWidget';
import { AttendanceWidget } from './widgets/AttendanceWidget';
import { UrgentRequestWidget } from './widgets/UrgentRequestWidget';
import { HeatmapWidget } from './widgets/HeatmapWidget';
import { ReportSidebar } from './ReportSidebar';
import { mockLowPaymentHouseholds, mockLateShifts, mockNegativeFeedbacks, mockCollectorProfile } from './mockData';

const AREAS = Array.from(new Set([
  ...mockLateShifts.map(s => s.area),
  ...mockLowPaymentHouseholds.map(h => h.address?.match(/Q\.? ?\d+/)?.[0] || ''),
  ...mockNegativeFeedbacks.map(fb => fb.area),
])).filter(Boolean);

export function ReportDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTitle, setSidebarTitle] = useState('');
  const [sidebarContent, setSidebarContent] = useState<React.ReactNode>(null);
  const [filterArea, setFilterArea] = useState<string>('Tất cả');

  function openSidebar(title: string, content: React.ReactNode) {
    setSidebarTitle(title);
    setSidebarContent(content);
    setSidebarOpen(true);
  }

  function renderAreaFilter(currentArea: string, onChange: (area: string) => void) {
    return (
      <div className="mb-2 flex gap-2 items-center">
        <span className="text-xs text-gray-500">Khu vực:</span>
        <select
          className="border rounded px-2 py-1 text-xs"
          value={currentArea}
          onChange={e => onChange(e.target.value)}
        >
          <option value="Tất cả">Tất cả</option>
          {AREAS.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>
    );
  }

  function handleHeatmapAreaClick(area: string) {
    setFilterArea(area);
    openSidebar(
      `Chi tiết khu vực: ${area}`,
      <div>
        {renderAreaFilter(area, (a) => handleHeatmapAreaClick(a))}
        <div className="font-semibold mb-2">Danh sách hộ dân thanh toán thấp</div>
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-1 text-left">Tên hộ</th>
              <th className="px-2 py-1 text-left">Địa chỉ</th>
              <th className="px-2 py-1 text-left">Tình trạng</th>
              <th className="px-2 py-1 text-left">Ngày thanh toán</th>
              <th className="px-2 py-1 text-left">Phương thức</th>
            </tr>
          </thead>
          <tbody>
            {mockLowPaymentHouseholds.filter(h => area === 'Tất cả' || h.address?.includes(area)).map(h => (
              <tr key={h.id} className="border-t">
                <td className="px-2 py-1 font-medium">{h.name}</td>
                <td className="px-2 py-1">{h.address}</td>
                <td className="px-2 py-1">{h.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                <td className="px-2 py-1">{h.lastPaidAt || '-'}</td>
                <td className="px-2 py-1">{h.method || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function handlePerformanceDrilldown(area: string = 'Tất cả') {
    setFilterArea(area);
    openSidebar(
      'Danh sách ca thu gom trễ',
      <div>
        {renderAreaFilter(area, (a) => handlePerformanceDrilldown(a))}
        <div className="font-semibold mb-2">Danh sách ca trễ</div>
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-1 text-left">Mã ca</th>
              <th className="px-2 py-1 text-left">Khu vực</th>
              <th className="px-2 py-1 text-left">Ngày</th>
              <th className="px-2 py-1 text-left">Bắt đầu</th>
              <th className="px-2 py-1 text-left">Kết thúc</th>
              <th className="px-2 py-1 text-left">Lý do</th>
              <th className="px-2 py-1 text-left">Nhân viên</th>
            </tr>
          </thead>
          <tbody>
            {mockLateShifts.filter(s => area === 'Tất cả' || s.area === area).map(s => (
              <tr key={s.id} className="border-t">
                <td className="px-2 py-1 font-medium">{s.code}</td>
                <td className="px-2 py-1">{s.area}</td>
                <td className="px-2 py-1">{s.date}</td>
                <td className="px-2 py-1">{s.start}</td>
                <td className="px-2 py-1">{s.end}</td>
                <td className="px-2 py-1">{s.reason}</td>
                <td className="px-2 py-1">{s.collector.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function handleRatingDrilldown(area: string = 'Tất cả') {
    setFilterArea(area);
    openSidebar(
      'Danh sách phản hồi tiêu cực',
      <div>
        {renderAreaFilter(area, (a) => handleRatingDrilldown(a))}
        <div className="font-semibold mb-2">Phản hồi tiêu cực</div>
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-1 text-left">Nội dung</th>
              <th className="px-2 py-1 text-left">Sao</th>
              <th className="px-2 py-1 text-left">Ngày</th>
              <th className="px-2 py-1 text-left">Khu vực</th>
            </tr>
          </thead>
          <tbody>
            {mockNegativeFeedbacks.filter(fb => area === 'Tất cả' || fb.area === area).map(fb => (
              <tr key={fb.id} className="border-t">
                <td className="px-2 py-1">{fb.content}</td>
                <td className="px-2 py-1">{fb.rating}</td>
                <td className="px-2 py-1">{fb.date}</td>
                <td className="px-2 py-1">{fb.area}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function handleAttendanceDrilldown() {
    handlePerformanceDrilldown(); // reuse ca trễ
  }

  function handleUserPaymentDrilldown() {
    handleHeatmapAreaClick('Tất cả');
  }

  function handleCollectorPaymentDrilldown() {
    openSidebar(
      'Lịch sử thanh toán nhân viên',
      <div>
        <div className="font-semibold mb-2">Lịch sử thanh toán</div>
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-1 text-left">Tên nhân viên</th>
              <th className="px-2 py-1 text-left">Kỳ</th>
              <th className="px-2 py-1 text-left">Số tiền</th>
              <th className="px-2 py-1 text-left">Ngày nhận</th>
            </tr>
          </thead>
          <tbody>
            {mockCollectorProfile.paymentHistory.map((ph: { period: string; amount: number; paidAt: string }) => (
              <tr key={ph.period} className="border-t">
                <td className="px-2 py-1">{mockCollectorProfile.name}</td>
                <td className="px-2 py-1">{ph.period}</td>
                <td className="px-2 py-1">{ph.amount.toLocaleString()}₫</td>
                <td className="px-2 py-1">{ph.paidAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function handleUrgentRequestDrilldown() {
    handlePerformanceDrilldown(); // reuse ca trễ
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <PerformanceWidget onDrilldown={() => handlePerformanceDrilldown()} />
      <RatingWidget onDrilldown={() => handleRatingDrilldown()} />
      <UserPaymentWidget onDrilldown={handleUserPaymentDrilldown} />
      <CollectorPaymentWidget onDrilldown={handleCollectorPaymentDrilldown} />
      <AttendanceWidget onDrilldown={handleAttendanceDrilldown} />
      <UrgentRequestWidget onDrilldown={handleUrgentRequestDrilldown} />
      <HeatmapWidget className="xl:col-span-3" onAreaClick={handleHeatmapAreaClick} />
      <ReportSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} title={sidebarTitle}>
        {sidebarContent}
      </ReportSidebar>
    </div>
  );
}
