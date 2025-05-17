"use client";

import { ReportDashboard } from '@/components/admin/reports/ReportDashboard';
import { useTranslation } from 'react-i18next';

export default function AdminReportsPage() {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col h-full w-full p-6">
      <h1 className="text-2xl font-bold mb-6">{t('admin_reports.title', 'Báo cáo & Thống kê')}</h1>
      <ReportDashboard />
    </div>
  );
}
