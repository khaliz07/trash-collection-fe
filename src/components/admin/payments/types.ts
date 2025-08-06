export type CollectorPaymentStatus = 'pending' | 'approved' | 'rejected';
export type UserPaymentStatus = 'paid' | 'unpaid' | 'overdue';
export type PaymentMethod = 'cash' | 'bank' | 'momo' | 'zalopay';

export interface PaymentPeriod {
  id: string;
  label: string;
  start: string;
  end: string;
}

export interface CollectorPayment {
  id: string;
  collectorId: string;
  collectorName: string;
  collectorCode: string;
  area: string;
  period: PaymentPeriod;
  totalShifts: number;
  totalWeight: number;
  amount: number;
  status: CollectorPaymentStatus;
}

export interface CollectorPaymentDetail extends CollectorPayment {
  completedSchedules: number;
  totalWeight: number;
  avgRating: number;
  scheduleList: Array<{
    id: string;
    code: string;
    date: string;
    weight: number;
    amount: number;
    note?: string;
  }>;
  note?: string;
  evidenceFiles?: Array<{ id: string; name: string; url: string }>;
}

export interface UserPayment {
  id: string;
  userId: string;
  userName: string;
  householdCode: string;
  address: string;
  servicePackage: string;
  period: PaymentPeriod;
  amount: number;
  method: PaymentMethod;
  status: UserPaymentStatus;
}

export interface UserPaymentDetail extends UserPayment {
  paymentHistory: Array<{
    period: PaymentPeriod;
    amount: number;
    status: UserPaymentStatus;
    paidAt?: string;
    method?: PaymentMethod;
    receiptUrl?: string;
  }>;
  note?: string;
  receiptUrl?: string;
} 