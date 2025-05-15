'use client';
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { mockNotifications, NotificationItem } from './mockData';
import { Download } from 'lucide-react';

const typeMap = {
  policy: { label: 'Chính sách', color: 'primary' },
  schedule: { label: 'Lịch thu gom', color: 'warning' },
  system: { label: 'Hệ thống', color: 'info' },
  environment: { label: 'Môi trường', color: 'success' },
};

export default function UserNotificationsPage() {
  const [localNoti, setLocalNoti] = React.useState<NotificationItem[]>([...mockNotifications]);
  const [openId, setOpenId] = React.useState<string|null>(null);

  // Đánh dấu đã đọc khi mở dialog
  React.useEffect(() => {
    if (openId) {
      setLocalNoti(prev => prev.map(n => n.id === openId ? { ...n, read: true } : n));
    }
  }, [openId]);

  function markAllRead() {
    setLocalNoti(prev => prev.map(n => ({ ...n, read: true })));
  }

  // Sắp xếp mới nhất lên đầu
  const sortedNoti = [...localNoti].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  return (
    <div className="container py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Thông báo</h1>
        <Button variant="secondary" onClick={markAllRead}>Đánh dấu tất cả đã đọc</Button>
      </div>
      <Card>
        <CardContent className="divide-y p-[0]">
          {sortedNoti.map(noti => (
            <div
              key={noti.id}
              className={`flex flex-col md:flex-row md:items-center gap-2 py-4 px-4 cursor-pointer transition-colors rounded-lg ${!noti.read ? 'bg-primary/5' : ''} hover:bg-accent/40`}
              onClick={() => setOpenId(noti.id)}
            >
              <div className="flex items-center gap-2 min-w-[120px]">
                <Badge variant={typeMap[noti.type].color as any}>{typeMap[noti.type].label}</Badge>
                {!noti.read && <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Chưa đọc" />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-base">{noti.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{noti.summary}</div>
              </div>
              <div className="text-xs text-muted-foreground min-w-[100px] text-right">{new Date(noti.sentAt).toLocaleString()}</div>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* Dialog chi tiết thông báo */}
      <Dialog open={!!openId} onOpenChange={v => setOpenId(v ? openId : null)}>
        <DialogContent className="max-w-3xl">
          {openId && (() => {
            const noti = localNoti.find(n => n.id === openId)!;
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{noti.title}</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={typeMap[noti.type].color as any}>{typeMap[noti.type].label}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(noti.sentAt).toLocaleString()}</span>
                </div>
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                  <div className="mb-2 text-base font-medium">{noti.summary}</div>
                  <div className="mb-4 whitespace-pre-line text-sm">{noti.content}</div>
                  {noti.attachmentUrl && (
                    <a href={noti.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary underline">
                      <Download className="w-4 h-4" /> Tải tài liệu đính kèm
                    </a>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setOpenId(null)}>Đóng</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
} 