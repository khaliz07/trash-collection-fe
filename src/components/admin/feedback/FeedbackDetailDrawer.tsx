'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Feedback } from './types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetOverlay,
} from '@/components/ui/sheet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Props {
  feedback: Feedback | null;
  onClose: () => void;
}

export default function FeedbackDetailDrawer({ feedback, onClose }: Props) {
  const { t } = useTranslation('common');
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState(feedback?.status);
  // Simulate sending reply and updating status
  const handleSendReply = () => {
    setShowReply(false);
    setReply('');
    setStatus('resolved'); // Simulate status update
    // TODO: Call API or update parent state
  };
  return (
    <Sheet open={!!feedback} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent side="right" className="max-w-lg w-full overflow-y-auto p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-2 border-b">
            <SheetTitle>{t('feedback_dashboard.detail.title')}</SheetTitle>

          </SheetHeader>
          {feedback && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-primary font-semibold">
                    {feedback.code} • 
                    <Badge
                      variant={
                        feedback.type === 'complaint' ? 'error' :
                        feedback.type === 'suggestion' ? 'info' :
                        feedback.type === 'proposal' ? 'primary' : 'default'
                      }
                      className="ml-2 align-middle"
                    >
                      {t(`feedback_dashboard.type.${feedback.type}`)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    {t('feedback_dashboard.status.' + (status || feedback.status))}
                    <Badge variant={
                      (status || feedback.status) === 'pending' ? 'default' :
                      (status || feedback.status) === 'in_progress' ? 'warning' :
                      (status || feedback.status) === 'resolved' ? 'success' : 'default'
                    }>
                      {t(`feedback_dashboard.status.${status || feedback.status}`)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <b>{t('feedback_dashboard.table.priority')}:</b>
                    {feedback.priority ? (
                      <Badge variant={feedback.priority === 'urgent' ? 'error' : 'primary'}>
                        {t(`feedback_dashboard.priority.${feedback.priority}`)}
                      </Badge>
                    ) : '-'}
                  </div>
                  <div><b>{t('feedback_dashboard.table.sender')}:</b> {feedback.sender.name} ({t(`feedback_dashboard.senderType.${feedback.sender.role}`)})</div>
                  <div><b>{t('feedback_dashboard.table.content')}:</b> {feedback.content}</div>
                  <div><b>{t('feedback_dashboard.table.createdAt')}:</b> {new Date(feedback.createdAt).toLocaleString()}</div>
                  {feedback.relatedScheduleId && (
                    <div><b>{t('feedback_dashboard.detail.related_schedule')}:</b> {feedback.relatedScheduleId}</div>
                  )}
                  {feedback.handler && (
                    <div><b>{t('feedback_dashboard.table.handler')}:</b> {feedback.handler.name}</div>
                  )}
                  {feedback.handledAt && (
                    <div><b>{t('feedback_dashboard.table.handledAt')}:</b> {new Date(feedback.handledAt).toLocaleString()}</div>
                  )}
                  <div><b>{t('feedback_dashboard.detail.attachments')}:</b> {feedback.attachments && feedback.attachments.length > 0 ? (
                    <ul className="list-disc ml-6">
                      {feedback.attachments.map(att => (
                        <li key={att.id}>
                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{att.name || att.url}</a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400">{t('feedback_dashboard.detail.no_attachments')}</span>
                  )}</div>
                  {feedback.notes && (
                    <div><b>{t('feedback_dashboard.detail.notes')}:</b> {feedback.notes}</div>
                  )}
                </CardContent>
              </Card>
              {/* Add Response Section */}
              <div className="pt-2">
                {!showReply ? (
                  <Button className="w-full" variant="default" onClick={() => setShowReply(true)}>
                    {t('feedback_dashboard.detail.add_reply') || 'Thêm phản hồi'}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      placeholder={t('feedback_dashboard.detail.reply_placeholder') || 'Nhập phản hồi...'}
                      rows={4}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="default"
                        onClick={handleSendReply}
                        disabled={!reply.trim()}
                      >
                        {t('feedback_dashboard.detail.send') || 'Gửi'}
                      </Button>
                      <Button variant="ghost" onClick={() => setShowReply(false)}>
                        {t('cancel') || 'Hủy'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
