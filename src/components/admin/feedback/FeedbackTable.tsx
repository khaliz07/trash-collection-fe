'use client';
import { useTranslation } from 'react-i18next';
import type { Feedback } from './types';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface Props {
  feedbacks: Feedback[];
  onRowClick: (fb: Feedback) => void;
  emptyText: string;
}

export default function FeedbackTable({ feedbacks, onRowClick, emptyText }: Props) {
  const { t } = useTranslation('common');
  if (!feedbacks.length) {
    return <div className="p-8 text-center text-gray-400">{emptyText}</div>;
  }
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>{t('feedback_dashboard.table.code')}</TableHead>
            <TableHead>{t('feedback_dashboard.table.createdAt')}</TableHead>
            <TableHead>{t('feedback_dashboard.table.sender')}</TableHead>
            <TableHead className="text-center">{t('feedback_dashboard.table.type')}</TableHead>
            <TableHead>{t('feedback_dashboard.table.content')}</TableHead>
            <TableHead className="text-center">{t('feedback_dashboard.table.status')}</TableHead>
            <TableHead className="text-center">{t('feedback_dashboard.table.priority')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbacks.map(fb => (
            <TableRow key={fb.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onRowClick(fb)}>
              <TableCell>{fb.code}</TableCell>
              <TableCell>{new Date(fb.createdAt).toLocaleString()}</TableCell>
              <TableCell>{fb.sender.name}</TableCell>
              <TableCell className="text-center">
              <Badge
                      variant={
                        fb.type === 'complaint' ? 'error' :
                        fb.type === 'suggestion' ? 'info' :
                        fb.type === 'proposal' ? 'primary' : 'default'
                      }
                      className="ml-2 align-middle"
                    >
                      {t(`feedback_dashboard.type.${fb.type}`)}
                    </Badge>

              </TableCell>
              <TableCell className="max-w-xs truncate" title={fb.content}>{fb.content}</TableCell>
              <TableCell className="text-center">
                <Badge variant={
                  fb.status === 'pending' ? 'default' :
                  fb.status === 'in_progress' ? 'warning' :
                  fb.status === 'resolved' ? 'success' : 'default'
                }>
                  {t(`feedback_dashboard.status.${fb.status}`)}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {fb.priority ? (
                  <Badge variant={fb.priority === 'urgent' ? 'error' : 'primary'}>
                    {t(`feedback_dashboard.priority.${fb.priority}`)}
                  </Badge>
                ) : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
