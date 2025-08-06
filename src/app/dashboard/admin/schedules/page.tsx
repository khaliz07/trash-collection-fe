'use client'

import * as React from 'react';
import ScheduleTable from '@/components/admin/schedules/ScheduleTable';
import { mockSchedules } from '@/components/admin/schedules/mockData';
import type { Schedule } from '@/components/admin/schedules/types';
import ScheduleSidebar from '@/components/admin/schedules/ScheduleSidebar';
import { useTranslation } from 'react-i18next'

export default function AdminSchedulesPage() {
  const { t } = useTranslation('common')
  const [selected, setSelected] = React.useState<Schedule | null>(null);
  const [openSidebar, setOpenSidebar] = React.useState(false);

  const handleRowClick = (schedule: Schedule) => {
    setSelected(schedule);
    setOpenSidebar(true);
  };

  return (
    <div className="container py-8 max-w-6xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{t('admin_schedules.title', 'Lịch trình thu gom')}</h1>
      <ScheduleTable schedules={mockSchedules} onRowClick={handleRowClick} />
      <ScheduleSidebar open={openSidebar} schedule={selected} onClose={() => setOpenSidebar(false)} />
    </div>
  );
} 