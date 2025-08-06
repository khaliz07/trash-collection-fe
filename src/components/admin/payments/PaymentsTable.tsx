import type { CollectorPayment, UserPayment, CollectorPaymentDetail, UserPaymentDetail, PaymentPeriod } from './types';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PaymentsTableProps {
  type: 'collector' | 'user';
  payments: CollectorPayment[] | UserPayment[];
  paymentDetails: CollectorPaymentDetail[] | UserPaymentDetail[];
  periods: PaymentPeriod[];
}

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

function getStatusBadgeProps(type: 'collector' | 'user', status: string): { variant: BadgeVariant; label: string } {
  if (type === 'collector') {
    if (status === 'approved') return { variant: 'success', label: 'Đã duyệt' };
    if (status === 'pending') return { variant: 'warning', label: 'Chờ duyệt' };
    if (status === 'rejected') return { variant: 'error', label: 'Từ chối' };
  } else {
    if (status === 'paid') return { variant: 'success', label: 'Đã thanh toán' };
    if (status === 'unpaid') return { variant: 'warning', label: 'Chưa thanh toán' };
    if (status === 'overdue') return { variant: 'error', label: 'Quá hạn' };
  }
  return { variant: 'default', label: status };
}

export function PaymentsTable({ type, payments, paymentDetails, periods }: PaymentsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-50">
            {type === 'collector' ? (
              <>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.collector.name', { defaultValue: 'Tên nhân viên' })}</th>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.collector.phone', { defaultValue: 'Số hiệu' })}</th>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.collector.area', { defaultValue: 'Khu vực' })}</th>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.collector.period', { defaultValue: 'Kỳ' })}</th>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.collector.amount', { defaultValue: 'Số tiền' })}</th>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.collector.status', { defaultValue: 'Trạng thái' })}</th>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.collector.actions', { defaultValue: 'Thao tác' })}</th>
              </>
            ) : (
              <>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.user.name', { defaultValue: 'Tên hộ dân' })}</th>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.user.address', { defaultValue: 'Địa chỉ' })}</th>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.user.period', { defaultValue: 'Kỳ' })}</th>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.user.amount', { defaultValue: 'Số tiền' })}</th>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.user.status', { defaultValue: 'Trạng thái' })}</th>
                <th className="px-4 py-2 text-left font-medium">{t('admin.payments.user.actions', { defaultValue: 'Thao tác' })}</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {payments.map((payment: any) => {
            const statusProps = getStatusBadgeProps(type, payment.status);
            return (
              <tr key={payment.id} className="border-t hover:bg-gray-50">
                {type === 'collector' ? (
                  <>
                    <td className="px-4 py-2 font-medium">{payment.collectorName}</td>
                    <td className="px-4 py-2">{payment.collectorCode}</td>
                    <td className="px-4 py-2">{payment.area}</td>
                    <td className="px-4 py-2">{payment.period.label}</td>
                    <td className="px-4 py-2">{payment.amount.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <Badge variant={statusProps.variant as BadgeVariant}>{statusProps.label}</Badge>
                    </td>
                    <td className="px-4 py-2 space-x-1">
                      <Button size="sm" variant="outline">{t('admin.payments.actions.view', { defaultValue: 'Xem' })}</Button>
                      {payment.status === 'pending' && (
                        <Button size="sm" variant="secondary">{t('admin.payments.actions.approve', { defaultValue: 'Duyệt' })}</Button>
                      )}
                      <Button size="sm" variant="ghost">{t('admin.payments.actions.export', { defaultValue: 'Xuất' })}</Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 font-medium">{payment.userName}</td>
                    <td className="px-4 py-2">{payment.address}</td>
                    <td className="px-4 py-2">{payment.period.label}</td>
                    <td className="px-4 py-2">{payment.amount.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <Badge variant={statusProps.variant as BadgeVariant}>{statusProps.label}</Badge>
                    </td>
                    <td className="px-4 py-2 space-x-1">
                      <Button size="sm" variant="outline">{t('admin.payments.actions.view', { defaultValue: 'Xem' })}</Button>
                      <Button size="sm" variant="ghost">{t('admin.payments.actions.export', { defaultValue: 'Xuất' })}</Button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
