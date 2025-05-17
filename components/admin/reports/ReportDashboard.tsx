import { useState } from 'react';
import { PerformanceWidget } from './widgets/PerformanceWidget';
import { RatingWidget } from './widgets/RatingWidget';
import { UserPaymentWidget } from './widgets/UserPaymentWidget';
import { CollectorPaymentWidget } from './widgets/CollectorPaymentWidget';
import { AttendanceWidget } from './widgets/AttendanceWidget';
import { UrgentRequestWidget } from './widgets/UrgentRequestWidget';
import { HeatmapWidget } from './widgets/HeatmapWidget';
import { ReportSidebar } from './ReportSidebar';
import { mockLateShifts, mockNegativeFeedbacks, mockCollectorProfile, mockUrgentRequest, mockPerformance, mockRating, mockUserPayment, mockHouseholds } from './mockData';

const AREAS = Array.from(new Set([
  ...mockLateShifts.map(s => s.area),
  ...mockHouseholds.map((h: any) => h.address?.match(/Q\.? ?\d+/)?.[0] || ''),
  ...mockNegativeFeedbacks.map(fb => fb.area),
])).filter(Boolean);

// Giả lập mock chi tiết yêu cầu khẩn cấp
const mockUrgentRequestDetails = [
  { id: 'ur1', code: 'UR1001', area: 'Quận 1', date: '2024-06-10', time: '09:15', status: 'overdue', address: '12 Lê Lợi, Quận 1', household: 'Nguyễn Văn A', collector: 'Trần Văn Bình', note: 'Rác ùn ứ, cần xử lý gấp' },
  { id: 'ur2', code: 'UR1002', area: 'Quận 3', date: '2024-06-10', time: '10:20', status: 'handled', address: '45 Pasteur, Quận 3', household: 'Trần Thị B', collector: 'Nguyễn Thị Hoa', note: 'Có mùi hôi, đã xử lý' },
  { id: 'ur3', code: 'UR1003', area: 'Quận 7', date: '2024-06-10', time: '11:00', status: 'pending', address: '88 Nguyễn Văn Linh, Quận 7', household: 'Lê Văn C', collector: 'Phạm Thị Mai', note: 'Chưa thu gom' },
  { id: 'ur4', code: 'UR1004', area: 'Quận 1', date: '2024-06-09', time: '14:30', status: 'handled', address: '99 Trần Hưng Đạo, Quận 1', household: 'Phạm Văn D', collector: 'Đỗ Văn Hùng', note: 'Đã xử lý xong' },
];

// Hàm helper đổi phương thức sang tiếng Việt và màu
const paymentMethodLabel = (method: string) => {
  switch (method) {
    case 'momo':
      return { label: 'Momo', color: 'bg-pink-100 text-pink-700 border-pink-300' };
    case 'bank':
      return { label: 'Chuyển khoản', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    case 'cash':
      return { label: 'Tiền mặt', color: 'bg-green-100 text-green-700 border-green-300' };
    default:
      return { label: method, color: 'bg-gray-100 text-gray-700 border-gray-300' };
  }
};

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
            {mockHouseholds.filter(h => area === 'Tất cả' || h.address?.includes(area)).map(h => (
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
      'Danh sách ca thu gom',
      <div>
        {renderAreaFilter(area, (a) => handlePerformanceDrilldown(a))}
        <div className="font-semibold mb-2">Danh sách ca thu gom</div>
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-1 text-left">Mã ca</th>
              <th className="px-2 py-1 text-left">Khu vực</th>
              <th className="px-2 py-1 text-left">Ngày</th>
              <th className="px-2 py-1 text-left">Tổng điểm</th>
              <th className="px-2 py-1 text-left">Đã thu</th>
              <th className="px-2 py-1 text-left">Đúng giờ</th>
              <th className="px-2 py-1 text-left">Trễ</th>
              <th className="px-2 py-1 text-left">Huỷ</th>
              <th className="px-2 py-1 text-left">Thời gian TB</th>
            </tr>
          </thead>
          <tbody>
            {mockPerformance.filter(s => area === 'Tất cả' || s.area === area).map((s, idx) => (
              <tr key={s.date + s.area} className="border-t">
                <td className="px-2 py-1 font-medium">SCH{(idx + 1).toString().padStart(4, '0')}</td>
                <td className="px-2 py-1">{s.area}</td>
                <td className="px-2 py-1">{s.date}</td>
                <td className="px-2 py-1">{s.totalPoints}</td>
                <td className="px-2 py-1">{s.completedPoints}</td>
                <td className="px-2 py-1">{s.onTimePoints}</td>
                <td className="px-2 py-1">{s.latePoints}</td>
                <td className="px-2 py-1">{s.canceledPoints}</td>
                <td className="px-2 py-1">{s.avgCompletionTime} phút</td>
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
      'Danh sách đánh giá & phản hồi',
      <div>
        {renderAreaFilter(area, (a) => handleRatingDrilldown(a))}
        <div className="font-semibold mb-2">Tổng hợp đánh giá nhân viên</div>
        <table className="min-w-full text-sm border mb-6">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-1 text-left">Tên nhân viên</th>
              <th className="px-2 py-1 text-left">Điểm TB</th>
              <th className="px-2 py-1 text-left">Số đánh giá</th>
              <th className="px-2 py-1 text-left">Loại</th>
            </tr>
          </thead>
          <tbody>
            {[...(mockRating.topCollectors.map(c => ({ ...c, type: 'Top' }))), ...(mockRating.lowCollectors.map(c => ({ ...c, type: 'Thấp' })))]
              .filter(c => area === 'Tất cả' || mockRating.negativeHeatmap.some(a => a.area === area && c.name))
              .map((c, idx) => (
                <tr key={c.id + c.type} className="border-t">
                  <td className="px-2 py-1 font-medium">{c.name}</td>
                  <td className="px-2 py-1">{c.avgRating.toFixed(1)}</td>
                  <td className="px-2 py-1">{c.totalReviews}</td>
                  <td className="px-2 py-1">{c.type}</td>
                </tr>
              ))}
          </tbody>
        </table>
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

  function handleUserPaymentDrilldown(area: string = 'Tất cả') {
    setFilterArea(area);
    openSidebar(
      'Tổng hợp thanh toán từ người dân',
      <div>
        {renderAreaFilter(area, (a) => handleUserPaymentDrilldown(a))}
        <div className="font-semibold mb-2">Tổng hợp phương thức thanh toán</div>
        <table className="min-w-full text-sm border mb-6">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-1 text-left">Phương thức</th>
              <th className="px-2 py-1 text-left">Số hộ</th>
            </tr>
          </thead>
          <tbody>
            {mockUserPayment.methodStats.map(m => {
              const { label, color } = paymentMethodLabel(m.method);
              return (
                <tr key={m.method} className="border-t">
                  <td className="px-2 py-1 font-medium">
                    <span className={`inline-block px-2 py-0.5 rounded border text-xs ${color}`}>{label}</span>
                  </td>
                  <td className="px-2 py-1">{m.count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="font-semibold mb-2">Danh sách hộ dân thanh toán</div>
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
            {mockHouseholds.filter((h: any) => filterArea === 'Tất cả' || h.address?.includes(area)).map((h: any) => {
              const { label, color } = paymentMethodLabel(h.method);
              return (
                <tr key={h.id} className="border-t">
                  <td className="px-2 py-1 font-medium">{h.name}</td>
                  <td className="px-2 py-1">{h.address}</td>
                  <td className="px-2 py-1">{h.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                  <td className="px-2 py-1">{h.lastPaidAt || '-'}</td>
                  <td className="px-2 py-1">
                    <span className={`inline-block px-2 py-0.5 rounded border text-xs ${color}`}>{label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
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

  function handleUrgentRequestDrilldown(area: string = 'Tất cả') {
    setFilterArea(area);
    openSidebar(
      'Chi tiết yêu cầu khẩn cấp',
      <div>
        {renderAreaFilter(area, (a) => handleUrgentRequestDrilldown(a))}
        <div className="font-semibold mb-2">Danh sách yêu cầu khẩn cấp</div>
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-1 text-left">Mã YC</th>
              <th className="px-2 py-1 text-left">Khu vực</th>
              <th className="px-2 py-1 text-left">Ngày</th>
              <th className="px-2 py-1 text-left">Giờ</th>
              <th className="px-2 py-1 text-left">Địa chỉ</th>
              <th className="px-2 py-1 text-left">Hộ dân</th>
              <th className="px-2 py-1 text-left">Nhân viên</th>
              <th className="px-2 py-1 text-left">Trạng thái</th>
              <th className="px-2 py-1 text-left">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {mockUrgentRequestDetails.filter(r => filterArea === 'Tất cả' || r.area === area).map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-2 py-1 font-medium">{r.code}</td>
                <td className="px-2 py-1">{r.area}</td>
                <td className="px-2 py-1">{r.date}</td>
                <td className="px-2 py-1">{r.time}</td>
                <td className="px-2 py-1">{r.address}</td>
                <td className="px-2 py-1">{r.household}</td>
                <td className="px-2 py-1">{r.collector}</td>
                <td className="px-2 py-1">
                  {r.status === 'handled' && <span className="text-green-600 font-semibold">Đã xử lý</span>}
                  {r.status === 'pending' && <span className="text-yellow-600 font-semibold">Chờ xử lý</span>}
                  {r.status === 'overdue' && <span className="text-red-500 font-semibold">Quá hạn</span>}
                </td>
                <td className="px-2 py-1">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <PerformanceWidget onDrilldown={() => handlePerformanceDrilldown()} />
      <RatingWidget onDrilldown={() => handleRatingDrilldown()} />
      <UserPaymentWidget onDrilldown={handleUserPaymentDrilldown} />
      <CollectorPaymentWidget onDrilldown={handleCollectorPaymentDrilldown} />
      <AttendanceWidget onDrilldown={handleAttendanceDrilldown} />
      <UrgentRequestWidget onDrilldown={() => handleUrgentRequestDrilldown()} />
      <HeatmapWidget className="xl:col-span-3" onAreaClick={handleHeatmapAreaClick} />
      <ReportSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} title={sidebarTitle}>
        {sidebarContent}
      </ReportSidebar>
    </div>
  );
}
