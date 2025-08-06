'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockFeedbacks, mockFeedbackStats } from '@/components/admin/feedback/mockData';
import type { Feedback, FeedbackFilter as FeedbackFilterType } from '@/components/admin/feedback/types';
import FeedbackStats from '@/components/admin/feedback/FeedbackStats';
import FeedbackFilter from '@/components/admin/feedback/FeedbackFilter';
import FeedbackTable from '@/components/admin/feedback/FeedbackTable';
import FeedbackAddDialog from '@/components/admin/feedback/FeedbackAddDialog';
import FeedbackDetailDrawer from '@/components/admin/feedback/FeedbackDetailDrawer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Card, Button } from '@/components/common'; // Uncomment if you have these common components

export default function AdminFeedbackPage() {
  const { t } = useTranslation('common');
  const [filter, setFilter] = useState<FeedbackFilterType>({});
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Filter logic
  const filteredFeedbacks = mockFeedbacks.filter(fb => {
    // Status
    if (filter.status && fb.status !== filter.status) return false;
    // Type
    if (filter.type && fb.type !== filter.type) return false;
    // Priority
    if (filter.priority && fb.priority !== filter.priority) return false;
    // Keyword (search in content, sender name, code)
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase();
      if (
        !fb.content.toLowerCase().includes(kw) &&
        !fb.sender.name.toLowerCase().includes(kw) &&
        !fb.code.toLowerCase().includes(kw)
      ) return false;
    }
    return true;
  });

  return (
    <div className="container py-8 max-w-7xl">
      {/* Title & Description */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{t('feedback_dashboard.title')}</h1>
      <p className="text-gray-500 mb-6">{t('feedback_dashboard.description')}</p>
      {/* Summary Stats */}
      <FeedbackStats stats={mockFeedbackStats} />
      {/* Filter/Search Row */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 w-full md:w-64"
          placeholder={t('feedback_dashboard.filters.keyword')}
          value={filter.keyword || ''}
          onChange={e => setFilter(f => ({ ...f, keyword: e.target.value }))}
        />
        <FeedbackFilter filter={filter} onChange={setFilter} />
        
      </div>
      {/* Feedback Table */}
     
          <FeedbackTable
            feedbacks={filteredFeedbacks}
            onRowClick={setSelected}
            emptyText={t('feedback_dashboard.empty')}
          />
     
      {/* Add Feedback Dialog */}
      <FeedbackAddDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {/* Feedback Detail Drawer */}
      <FeedbackDetailDrawer feedback={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
