'use client';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FeedbackAddDialog({ open, onClose }: Props) {
  const { t } = useTranslation('common');
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <Card className="min-w-[320px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">{t('feedback_dashboard.actions.add')}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng">×</Button>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500">(Form thêm phản hồi sẽ đặt ở đây)</div>
        </CardContent>
      </Card>
    </div>
  );
}
