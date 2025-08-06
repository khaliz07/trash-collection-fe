import * as Tabs from '@radix-ui/react-tabs';
import { PaymentsTable } from './PaymentsTable';
import type { CollectorPayment, UserPayment, CollectorPaymentDetail, UserPaymentDetail, PaymentPeriod } from './types';
import { useTranslation } from 'react-i18next';

interface PaymentsTabsProps {
  collectorPayments: CollectorPayment[];
  userPayments: UserPayment[];
  collectorPaymentDetails: CollectorPaymentDetail[];
  userPaymentDetails: UserPaymentDetail[];
  periods: PaymentPeriod[];
}

export function PaymentsTabs({
  collectorPayments,
  userPayments,
  collectorPaymentDetails,
  userPaymentDetails,
  periods,
}: PaymentsTabsProps) {
  const { t } = useTranslation();

  return (
    <Tabs.Root defaultValue="collector" className="w-full">
      <Tabs.List className="flex gap-2 border-b border-gray-200 mb-4">
        <Tabs.Trigger value="collector" className="px-4 py-2 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary focus:outline-none">
          {t('admin.payments.collectorTab', 'Thanh toán nhân viên')}
        </Tabs.Trigger>
        <Tabs.Trigger value="user" className="px-4 py-2 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary focus:outline-none">
          {t('admin.payments.userTab', 'Thanh toán hộ dân')}
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="collector">
        <PaymentsTable
          type="collector"
          payments={collectorPayments}
          paymentDetails={collectorPaymentDetails}
          periods={periods}
        />
      </Tabs.Content>
      <Tabs.Content value="user">
        <PaymentsTable
          type="user"
          payments={userPayments}
          paymentDetails={userPaymentDetails}
          periods={periods}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
