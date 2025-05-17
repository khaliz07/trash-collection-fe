'use client';
import { useTranslation } from 'react-i18next';
import type { FeedbackFilter, FeedbackStatus, FeedbackType } from './types';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface Props {
  filter: FeedbackFilter;
  onChange: (f: FeedbackFilter) => void;
}

const STATUS_OPTIONS = ['pending', 'in_progress', 'resolved'];
const TYPE_OPTIONS = ['complaint', 'suggestion', 'proposal'];
const PRIORITY_OPTIONS = ['urgent', 'normal'];

export default function FeedbackFilter({ filter, onChange }: Props) {
  const { t } = useTranslation('common');
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Trạng thái */}
      <Select
        value={filter.status || 'all'}
        onValueChange={v => onChange({ ...filter, status: v === 'all' ? undefined : (v as FeedbackStatus) })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t('feedback_dashboard.filters.status')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('feedback_dashboard.filters.status')}</SelectItem>
          {STATUS_OPTIONS.map(opt => (
            <SelectItem key={opt} value={opt}>
              {t(`feedback_dashboard.status.${opt}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Loại */}
      <Select
        value={filter.type || 'all'}
        onValueChange={v => onChange({ ...filter, type: v === 'all' ? undefined : (v as FeedbackType) })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t('feedback_dashboard.filters.type')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('feedback_dashboard.filters.type')}</SelectItem>
          {TYPE_OPTIONS.map(opt => (
            <SelectItem key={opt} value={opt}>
              {t(`feedback_dashboard.type.${opt}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Ưu tiên */}
      <Select
        value={filter.priority || 'all'}
        onValueChange={v => onChange({ ...filter, priority: v === 'all' ? undefined : (v as 'urgent' | 'normal') })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t('feedback_dashboard.filters.priority')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('feedback_dashboard.filters.priority')}</SelectItem>
          {PRIORITY_OPTIONS.map(opt => (
            <SelectItem key={opt} value={opt}>
              {t(`feedback_dashboard.priority.${opt}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
