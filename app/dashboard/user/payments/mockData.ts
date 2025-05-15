// Mock data for user payments page

export interface ServicePackage {
  id: string;
  name: string; // Gói tháng/quý/năm
  startDate: string; // ISO
  endDate: string; // ISO
  status: 'active' | 'expiring' | 'expired';
  fee: number;
  area: string;
}

export interface PaymentInvoice {
  id: string;
  packageName: string;
  paidAt: string; // ISO
  amount: number;
  method: 'VNPay' | 'Momo' | 'Other';
  status: 'success' | 'failed';
  downloadUrl?: string;
}

export const mockCurrentPackage: ServicePackage = {
  id: 'pkg-1',
  name: 'Gói tháng',
  startDate: '2024-06-01',
  endDate: '2024-06-30',
  status: 'active',
  fee: 120000,
  area: 'Phường B, Quận C',
};

export const mockInvoices: PaymentInvoice[] = [
  {
    id: 'INV001',
    packageName: 'Gói tháng',
    paidAt: '2024-06-01',
    amount: 120000,
    method: 'VNPay',
    status: 'success',
    downloadUrl: '/invoices/INV001.pdf',
  },
  {
    id: 'INV002',
    packageName: 'Gói tháng',
    paidAt: '2024-05-01',
    amount: 120000,
    method: 'Momo',
    status: 'success',
    downloadUrl: '/invoices/INV002.pdf',
  },
  {
    id: 'INV003',
    packageName: 'Gói tháng',
    paidAt: '2024-04-01',
    amount: 120000,
    method: 'VNPay',
    status: 'failed',
  },
]; 