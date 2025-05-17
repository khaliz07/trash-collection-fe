import type {
  CollectorPayment,
  CollectorPaymentDetail,
  UserPayment,
  UserPaymentDetail,
  PaymentPeriod,
  PaymentMethod,
  CollectorPaymentStatus,
  UserPaymentStatus,
} from './types';

export const mockPeriods: PaymentPeriod[] = [
  { id: 'p1', label: 'Tháng 5/2024', start: '2024-05-01', end: '2024-05-31' },
  { id: 'p2', label: 'Tháng 6/2024', start: '2024-06-01', end: '2024-06-30' },
  { id: 'p3', label: 'Tháng 7/2024', start: '2024-07-01', end: '2024-07-31' },
];

export const mockCollectorPayments: CollectorPayment[] = [
  { id: 'cp1', collectorId: 'col1', collectorName: 'Trần Văn Bình', collectorCode: 'NV001', area: 'Quận 1', period: mockPeriods[1], totalShifts: 22, totalWeight: 3200, amount: 6400000, status: 'pending' },
  { id: 'cp2', collectorId: 'col2', collectorName: 'Nguyễn Thị Hoa', collectorCode: 'NV002', area: 'Quận 3', period: mockPeriods[1], totalShifts: 20, totalWeight: 2950, amount: 5900000, status: 'approved' },
  { id: 'cp3', collectorId: 'col3', collectorName: 'Lê Văn Cường', collectorCode: 'NV003', area: 'Quận 7', period: mockPeriods[1], totalShifts: 18, totalWeight: 2500, amount: 5000000, status: 'rejected' },
  { id: 'cp4', collectorId: 'col4', collectorName: 'Phạm Thị Mai', collectorCode: 'NV004', area: 'Quận 5', period: mockPeriods[2], totalShifts: 21, totalWeight: 3100, amount: 6200000, status: 'approved' },
  { id: 'cp5', collectorId: 'col5', collectorName: 'Đỗ Văn Hùng', collectorCode: 'NV005', area: 'Quận 2', period: mockPeriods[0], totalShifts: 19, totalWeight: 2700, amount: 5400000, status: 'pending' },
  { id: 'cp6', collectorId: 'col6', collectorName: 'Ngô Thị Hạnh', collectorCode: 'NV006', area: 'Quận 4', period: mockPeriods[2], totalShifts: 23, totalWeight: 3300, amount: 6600000, status: 'approved' },
  { id: 'cp7', collectorId: 'col7', collectorName: 'Vũ Minh Tuấn', collectorCode: 'NV007', area: 'Quận 6', period: mockPeriods[1], totalShifts: 20, totalWeight: 2900, amount: 5800000, status: 'pending' },
  { id: 'cp8', collectorId: 'col8', collectorName: 'Bùi Thị Lan', collectorCode: 'NV008', area: 'Quận 8', period: mockPeriods[0], totalShifts: 18, totalWeight: 2500, amount: 5000000, status: 'approved' },
  { id: 'cp9', collectorId: 'col9', collectorName: 'Lý Văn Sơn', collectorCode: 'NV009', area: 'Quận 9', period: mockPeriods[2], totalShifts: 22, totalWeight: 3200, amount: 6400000, status: 'rejected' },
  { id: 'cp10', collectorId: 'col10', collectorName: 'Trịnh Thị Thu', collectorCode: 'NV010', area: 'Quận 10', period: mockPeriods[1], totalShifts: 21, totalWeight: 3100, amount: 6200000, status: 'approved' },
  { id: 'cp11', collectorId: 'col11', collectorName: 'Phan Văn Dũng', collectorCode: 'NV011', area: 'Quận 11', period: mockPeriods[0], totalShifts: 19, totalWeight: 2700, amount: 5400000, status: 'pending' },
  { id: 'cp12', collectorId: 'col12', collectorName: 'Trương Thị Hòa', collectorCode: 'NV012', area: 'Quận 12', period: mockPeriods[2], totalShifts: 23, totalWeight: 3300, amount: 6600000, status: 'approved' },
  { id: 'cp13', collectorId: 'col13', collectorName: 'Đặng Minh Quân', collectorCode: 'NV013', area: 'Bình Thạnh', period: mockPeriods[1], totalShifts: 20, totalWeight: 2900, amount: 5800000, status: 'pending' },
  { id: 'cp14', collectorId: 'col14', collectorName: 'Lê Thị Kim', collectorCode: 'NV014', area: 'Tân Bình', period: mockPeriods[0], totalShifts: 18, totalWeight: 2500, amount: 5000000, status: 'approved' },
  { id: 'cp15', collectorId: 'col15', collectorName: 'Nguyễn Văn Hòa', collectorCode: 'NV015', area: 'Tân Phú', period: mockPeriods[2], totalShifts: 22, totalWeight: 3200, amount: 6400000, status: 'rejected' },
  { id: 'cp16', collectorId: 'col16', collectorName: 'Phạm Thị Hương', collectorCode: 'NV016', area: 'Bình Tân', period: mockPeriods[1], totalShifts: 21, totalWeight: 3100, amount: 6200000, status: 'approved' },
  { id: 'cp17', collectorId: 'col17', collectorName: 'Võ Văn Lâm', collectorCode: 'NV017', area: 'Gò Vấp', period: mockPeriods[0], totalShifts: 19, totalWeight: 2700, amount: 5400000, status: 'pending' },
  { id: 'cp18', collectorId: 'col18', collectorName: 'Trần Thị Hạnh', collectorCode: 'NV018', area: 'Phú Nhuận', period: mockPeriods[2], totalShifts: 23, totalWeight: 3300, amount: 6600000, status: 'approved' },
  { id: 'cp19', collectorId: 'col19', collectorName: 'Nguyễn Minh Tâm', collectorCode: 'NV019', area: 'Thủ Đức', period: mockPeriods[1], totalShifts: 20, totalWeight: 2900, amount: 5800000, status: 'pending' },
  { id: 'cp20', collectorId: 'col20', collectorName: 'Lê Văn Hùng', collectorCode: 'NV020', area: 'Nhà Bè', period: mockPeriods[0], totalShifts: 18, totalWeight: 2500, amount: 5000000, status: 'approved' },
];

export const mockCollectorPaymentDetails: CollectorPaymentDetail[] = [
  {
    ...mockCollectorPayments[0],
    completedSchedules: 22,
    avgRating: 4.7,
    scheduleList: [
      { id: 'sch1', code: 'SCH1001', date: '2024-06-02', weight: 150, amount: 300000 },
      { id: 'sch2', code: 'SCH1002', date: '2024-06-04', weight: 160, amount: 320000 },
    ],
    note: 'Đề xuất tăng thưởng do hiệu suất tốt.',
    evidenceFiles: [
      { id: 'f1', name: 'bangchamcong.pdf', url: '/files/bangchamcong.pdf' },
    ],
  },
];

export const mockUserPayments: UserPayment[] = [
  { id: 'up1', userId: 'u1', userName: 'Nguyễn Văn A', householdCode: 'H001', address: '123 Nguyễn Văn Linh, Q.7', servicePackage: 'Gói tiêu chuẩn', period: mockPeriods[1], amount: 120000, method: 'momo', status: 'paid' },
  { id: 'up2', userId: 'u2', userName: 'Trần Thị B', householdCode: 'H002', address: '456 Lê Văn Lương, Q.7', servicePackage: 'Gói nâng cao', period: mockPeriods[1], amount: 180000, method: 'bank', status: 'unpaid' },
  { id: 'up3', userId: 'u3', userName: 'Lê Văn C', householdCode: 'H003', address: '789 Huỳnh Tấn Phát, Q.7', servicePackage: 'Gói tiêu chuẩn', period: mockPeriods[1], amount: 120000, method: 'cash', status: 'overdue' },
  { id: 'up4', userId: 'u4', userName: 'Phạm Văn D', householdCode: 'H004', address: '12 Nguyễn Trãi, Q.1', servicePackage: 'Gói nâng cao', period: mockPeriods[2], amount: 180000, method: 'momo', status: 'paid' },
  { id: 'up5', userId: 'u5', userName: 'Đỗ Thị E', householdCode: 'H005', address: '34 Lý Thường Kiệt, Q.5', servicePackage: 'Gói tiêu chuẩn', period: mockPeriods[0], amount: 120000, method: 'bank', status: 'unpaid' },
  { id: 'up6', userId: 'u6', userName: 'Ngô Văn F', householdCode: 'H006', address: '56 Trần Hưng Đạo, Q.1', servicePackage: 'Gói nâng cao', period: mockPeriods[2], amount: 180000, method: 'cash', status: 'overdue' },
  { id: 'up7', userId: 'u7', userName: 'Vũ Thị G', householdCode: 'H007', address: '78 Nguyễn Thị Minh Khai, Q.3', servicePackage: 'Gói tiêu chuẩn', period: mockPeriods[1], amount: 120000, method: 'momo', status: 'paid' },
  { id: 'up8', userId: 'u8', userName: 'Bùi Văn H', householdCode: 'H008', address: '90 Lê Lai, Q.1', servicePackage: 'Gói nâng cao', period: mockPeriods[0], amount: 180000, method: 'bank', status: 'unpaid' },
  { id: 'up9', userId: 'u9', userName: 'Lý Thị I', householdCode: 'H009', address: '101 Nguyễn Đình Chiểu, Q.3', servicePackage: 'Gói tiêu chuẩn', period: mockPeriods[2], amount: 120000, method: 'cash', status: 'overdue' },
  { id: 'up10', userId: 'u10', userName: 'Trịnh Văn K', householdCode: 'H010', address: '112 Cách Mạng Tháng 8, Q.10', servicePackage: 'Gói nâng cao', period: mockPeriods[1], amount: 180000, method: 'momo', status: 'paid' },
  { id: 'up11', userId: 'u11', userName: 'Phan Thị L', householdCode: 'H011', address: '123 Pasteur, Q.1', servicePackage: 'Gói tiêu chuẩn', period: mockPeriods[0], amount: 120000, method: 'bank', status: 'unpaid' },
  { id: 'up12', userId: 'u12', userName: 'Trương Văn M', householdCode: 'H012', address: '134 Nam Kỳ Khởi Nghĩa, Q.3', servicePackage: 'Gói nâng cao', period: mockPeriods[2], amount: 180000, method: 'cash', status: 'overdue' },
  { id: 'up13', userId: 'u13', userName: 'Đặng Thị N', householdCode: 'H013', address: '145 Hai Bà Trưng, Q.1', servicePackage: 'Gói tiêu chuẩn', period: mockPeriods[1], amount: 120000, method: 'momo', status: 'paid' },
  { id: 'up14', userId: 'u14', userName: 'Lê Văn O', householdCode: 'H014', address: '156 Nguyễn Thái Học, Q.1', servicePackage: 'Gói nâng cao', period: mockPeriods[0], amount: 180000, method: 'bank', status: 'unpaid' },
  { id: 'up15', userId: 'u15', userName: 'Nguyễn Thị P', householdCode: 'H015', address: '167 Nguyễn Trãi, Q.5', servicePackage: 'Gói tiêu chuẩn', period: mockPeriods[2], amount: 120000, method: 'cash', status: 'overdue' },
  { id: 'up16', userId: 'u16', userName: 'Phạm Văn Q', householdCode: 'H016', address: '178 Lê Lợi, Q.1', servicePackage: 'Gói nâng cao', period: mockPeriods[1], amount: 180000, method: 'momo', status: 'paid' },
  { id: 'up17', userId: 'u17', userName: 'Võ Thị R', householdCode: 'H017', address: '189 Nguyễn Huệ, Q.1', servicePackage: 'Gói tiêu chuẩn', period: mockPeriods[0], amount: 120000, method: 'bank', status: 'unpaid' },
  { id: 'up18', userId: 'u18', userName: 'Trần Văn S', householdCode: 'H018', address: '200 Lý Tự Trọng, Q.1', servicePackage: 'Gói nâng cao', period: mockPeriods[2], amount: 180000, method: 'cash', status: 'overdue' },
  { id: 'up19', userId: 'u19', userName: 'Nguyễn Thị T', householdCode: 'H019', address: '211 Nguyễn Văn Cừ, Q.5', servicePackage: 'Gói tiêu chuẩn', period: mockPeriods[1], amount: 120000, method: 'momo', status: 'paid' },
  { id: 'up20', userId: 'u20', userName: 'Lê Văn U', householdCode: 'H020', address: '222 Trần Hưng Đạo, Q.1', servicePackage: 'Gói nâng cao', period: mockPeriods[0], amount: 180000, method: 'bank', status: 'unpaid' },
];

export const mockUserPaymentDetails: UserPaymentDetail[] = [
  {
    ...mockUserPayments[0],
    paymentHistory: [
      { period: mockPeriods[0], amount: 120000, status: 'paid', paidAt: '2024-05-05', method: 'momo', receiptUrl: '/receipts/rcpt1.pdf' },
      { period: mockPeriods[1], amount: 120000, status: 'paid', paidAt: '2024-06-05', method: 'momo', receiptUrl: '/receipts/rcpt2.pdf' },
    ],
    note: 'Đã thanh toán đủ các kỳ.',
    receiptUrl: '/receipts/rcpt2.pdf',
  },
]; 