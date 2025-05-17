"use client";

import { PaymentsTabs } from '@/components/admin/payments/PaymentsTabs';
import { mockCollectorPayments, mockUserPayments, mockCollectorPaymentDetails, mockUserPaymentDetails, mockPeriods } from '@/components/admin/payments/mockData';
import { useTranslation } from 'react-i18next';

export default function AdminPaymentsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full w-full p-6">
      <h1 className="text-2xl font-bold mb-6">{t('admin.payments.title', 'Quản lý thanh toán')}</h1>
      <PaymentsTabs
        collectorPayments={mockCollectorPayments}
        userPayments={mockUserPayments}
        collectorPaymentDetails={mockCollectorPaymentDetails}
        userPaymentDetails={mockUserPaymentDetails}
        periods={mockPeriods}
      />
    </div>
  );
}
