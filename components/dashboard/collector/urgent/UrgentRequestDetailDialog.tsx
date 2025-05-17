"use client";
import { useState } from 'react';
import { UrgentRequest, UrgentRequestStatus } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePreview } from '@/components/ui/image-preview';

interface Props {
  request: UrgentRequest;
  onClose: () => void;
}

export function UrgentRequestDetailDialog({ request, onClose }: Props) {
  const [status, setStatus] = useState(request.status);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(request.completedPhotoUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = () => {
    setLoading(true);
    setTimeout(() => {
      setStatus(UrgentRequestStatus.ACCEPTED);
      setLoading(false);
    }, 800);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleComplete = () => {
    if (!photo && !photoUrl) {
      setError('Vui lòng tải lên ảnh xác nhận đã thu gom!');
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setStatus(UrgentRequestStatus.COMPLETED);
      setLoading(false);
    }, 1000);
  };

  const statusConfig = {
    [UrgentRequestStatus.PENDING]: { label: 'Chưa xử lý', variant: 'warning' },
    [UrgentRequestStatus.ACCEPTED]: { label: 'Đã nhận', variant: 'info' },
    [UrgentRequestStatus.COMPLETED]: { label: 'Đã hoàn tất', variant: 'success' },
  }[status];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết yêu cầu #{request.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant as any}>{statusConfig.label}</Badge>
            <span className="text-xs text-muted-foreground">{request.createdAt.replace('T', ' ')}</span>
          </div>
          <div className="font-semibold">{request.address}</div>
          <div className="text-sm">Loại rác: {request.wasteType} | Ước tính: {request.estimatedWeight}</div>
          {request.note && <div className="text-xs text-yellow-700">Ghi chú: {request.note}</div>}
          {request.fee && <div className="text-xs text-primary font-semibold">Phí: {request.fee.toLocaleString()}đ</div>}
          {request.userName && <div className="text-xs text-muted-foreground">Người gửi: {request.userName}</div>}
          {status === UrgentRequestStatus.ACCEPTED && request.collectorName && (
            <div className="text-xs text-muted-foreground">Collector: {request.collectorName}</div>
          )}
          {status === UrgentRequestStatus.COMPLETED && photoUrl && (
            <div>
              <span className="font-medium">Ảnh xác nhận:</span>
              <div className="mt-1">
                <ImagePreview src={photoUrl} alt="Ảnh xác nhận" previewSize="sm" />
              </div>
            </div>
          )}
        </div>
        {status === UrgentRequestStatus.PENDING && (
          <Button onClick={handleAccept} disabled={loading} className="w-full mt-4">
            {loading ? 'Đang nhận...' : 'Nhận yêu cầu'}
          </Button>
        )}
        {status === UrgentRequestStatus.ACCEPTED && (
          <div className="mt-4 space-y-2">
            <label className="block font-medium mb-1">Tải lên ảnh xác nhận đã thu gom:</label>
            <Input type="file" accept="image/*" onChange={handlePhotoChange} />
            {photoUrl && (
              <div className="mt-2">
                <ImagePreview src={photoUrl} alt="Ảnh xác nhận" previewSize="sm" />
              </div>
            )}
            {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
            <Button onClick={handleComplete} disabled={loading} className="w-full">
              {loading ? 'Đang hoàn tất...' : 'Hoàn tất yêu cầu'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 