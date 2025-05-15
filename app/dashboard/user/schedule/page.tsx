'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockSchedule } from '../mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { format, parseISO, isSameDay, isAfter, isBefore, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as React from 'react';
import { Button } from '@/components/ui/button';

export default function UserSchedulePage() {
  // Highlight days with scheduled collections
  const scheduledDates = mockSchedule.map((item) => item.date);
  const [selected, setSelected] = React.useState<Date | undefined>(undefined);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<string | null>(null);
  const [starValue, setStarValue] = useState(5);
  const [comment, setComment] = useState('');
  const [localSchedule, setLocalSchedule] = useState(mockSchedule);

  // Filter schedule for selected day
  const daySchedule = selected
    ? mockSchedule.filter((item) => isSameDay(parseISO(item.date), selected))
    : [];

  function getStatusVariant(status: string) {
    switch (status) {
      case 'collected':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  }

  // Xử lý mở form đánh giá (có thể là đánh giá mới hoặc cập nhật)
  function handleOpenFeedback(id: string, existingFeedback?: {stars: number, comment?: string}) {
    setFeedbackTarget(id);
    setFeedbackOpen(true);
    setStarValue(existingFeedback?.stars ?? 5);
    setComment(existingFeedback?.comment ?? '');
  }

  // Xử lý gửi đánh giá
  function handleSubmitFeedback() {
    setLocalSchedule((prev) =>
      prev.map((item) =>
        item.id === feedbackTarget
          ? {
              ...item,
              feedback: {
                stars: starValue,
                comment,
                date: new Date().toISOString(),
                collectorId: 'collector-1',
              },
            }
          : item
      )
    );
    setFeedbackOpen(false);
    setFeedbackTarget(null);
  }

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Lịch thu gom rác</h1>
      <div className="grid grid-cols-1 md:grid-cols-10 gap-8">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Lịch theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected}
              modifiers={{
                scheduled: scheduledDates.map((d) => parseISO(d)),
              }}
              modifiersClassNames={{
                scheduled: 'bg-primary/20',
              }}
              locale={vi}
            />
            {selected && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">
                  Lịch thu gom ngày {format(selected, 'dd/MM/yyyy')}
                </h2>
                {daySchedule.length === 0 ? (
                  <p className="text-muted-foreground">Không có lịch thu gom.</p>
                ) : (
                  <ul className="space-y-2">
                    {daySchedule.map((item) => (
                      <li key={item.id} className="flex items-center gap-3">
                        <Badge variant={getStatusVariant(item.status)}>
                          {item.status === 'collected' && 'Đã thu'}
                          {item.status === 'pending' && 'Chưa thu'}
                          {item.status === 'overdue' && 'Quá hạn'}
                        </Badge>
                        <span className="text-sm">{item.type === 'urgent' ? 'Thu gom gấp' : 'Thu gom định kỳ'}</span>
                        <span className="text-xs text-muted-foreground">{item.address}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-6">
          <CardHeader>
            <CardTitle>Lịch sử thu gom</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đánh giá</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSchedule.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(parseISO(item.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{item.type === 'urgent' ? 'Gấp' : 'Định kỳ'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(item.status)}>
                        {item.status === 'collected' && 'Đã thu'}
                        {item.status === 'pending' && 'Chưa thu'}
                        {item.status === 'overdue' && 'Quá hạn'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.status === 'collected' ? (
                        item.feedback ? (
                          <div className="flex items-center gap-2">
                            {[1,2,3,4,5].map((n) => (
                              <Star key={n} className={n <= item.feedback!.stars ? 'text-yellow-400 fill-yellow-400 w-4 h-4' : 'text-gray-300 w-4 h-4'} />
                            ))}
                            {isAfter(new Date(), parseISO(item.date)) && isBefore(new Date(), addDays(parseISO(item.date), 7)) && (
                              <Button size="sm" variant="secondary" onClick={() => handleOpenFeedback(item.id, item.feedback)}>Đánh giá lại</Button>
                            )}
                          </div>
                        ) : (isAfter(new Date(), parseISO(item.date)) && isBefore(new Date(), addDays(parseISO(item.date), 7)) ? (
                          <Button size="sm" variant="secondary" onClick={() => handleOpenFeedback(item.id)}>Đánh giá</Button>
                        ) : null)
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá lần thu gom</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {[1,2,3,4,5].map((n) => (
              <button key={n} type="button" onClick={() => setStarValue(n)}>
                <Star className={n <= starValue ? 'text-yellow-400 fill-yellow-400 w-6 h-6' : 'text-gray-300 w-6 h-6'} />
              </button>
            ))}
          </div>
          <textarea className="w-full border rounded p-2 text-sm" rows={3} placeholder="Nhận xét của bạn (không bắt buộc)" value={comment} onChange={e => setComment(e.target.value)} />
          <DialogFooter>
            <Button onClick={handleSubmitFeedback} disabled={starValue < 1}>Gửi đánh giá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 