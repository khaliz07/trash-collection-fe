'use client';
import { useTranslation } from 'react-i18next';
import type { FeedbackStats } from './types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, MessageCircle, Zap } from 'lucide-react';

interface Props {
  stats: FeedbackStats;
}

export default function FeedbackStats({ stats }: Props) {
  const { t } = useTranslation('common');
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Tổng số phản hồi */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('feedback_dashboard.stats.total')}</CardTitle>
          <MessageCircle className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
        </CardContent>
      </Card>
      {/* Tỷ lệ đã xử lý */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('feedback_dashboard.stats.resolved')}</CardTitle>
          <CheckCircle className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{((stats.resolved / stats.total) * 100).toFixed(0)}%</div>
          <div className="text-xs text-muted-foreground mt-1">{stats.resolved} / {stats.total}</div>
        </CardContent>
      </Card>
      {/* Tỷ lệ phân loại */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('feedback_dashboard.stats.byType')}</CardTitle>
          <AlertCircle className="h-5 w-5 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 text-sm">
                <span className="font-medium">{t(`feedback_dashboard.type.${type}`)}:</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Số phản hồi khẩn cấp */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('feedback_dashboard.stats.urgent')}</CardTitle>
          <Zap className="h-5 w-5 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{stats.urgent}</div>
        </CardContent>
      </Card>
    </div>
  );
}
