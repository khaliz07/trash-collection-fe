'use client';

import { useState } from 'react';
import { CollectionStatus } from '@/types/collection';
import { CollectionPointList } from '../../../../components/dashboard/collection/CollectionPointList';
import { mockTodayCollectionPoints, mockCollector } from '../../../../components/dashboard/collection/mock-data';
import { useToast } from '@/components/ui/use-toast';
import { Truck } from 'lucide-react';

export default function CollectorTodayPage() {
  const { toast } = useToast();
  const [points, setPoints] = useState(mockTodayCollectionPoints);

  // In a real app, these handlers would interact with the backend
  const handleCheckIn = (pointId: string) => {
    setPoints(points.map(point => {
      if (point.id === pointId) {
        return {
          ...point,
          status: CollectionStatus.IN_PROGRESS,
          checkInTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          checkInLocation: {
            // In a real app, we would get this from the browser's geolocation API
            lat: point.location.lat + 0.000002,
            lng: point.location.lng + 0.000002
          }
        };
      }
      return point;
    }));

    toast({
      title: 'Check-in thành công',
      description: `Đã check-in tại điểm thu gom #${pointId}`,
    });
  };

  const handleUpdateStatus = (pointId: string, status: CollectionStatus) => {
    setPoints(points.map(point => {
      if (point.id === pointId) {
        return {
          ...point,
          status
        };
      }
      return point;
    }));

    toast({
      title: 'Cập nhật trạng thái',
      description: `Đã cập nhật trạng thái điểm thu gom #${pointId}`,
    });
  };

  const handleOpenMap = (pointId: string) => {
    const point = points.find(p => p.id === pointId);
    if (point) {
      // In a real app, we would integrate with a mapping service
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${point.location.lat},${point.location.lng}`,
        '_blank'
      );
    }
  };

  const handleUploadPhoto = (pointId: string) => {
    // In a real app, we would open a file picker and upload the photo
    toast({
      title: 'Chức năng đang phát triển',
      description: 'Tính năng upload ảnh sẽ sớm được cập nhật',
    });
  };

  const handleAddNote = (pointId: string) => {
    // In a real app, we would open a dialog to add notes
    toast({
      title: 'Chức năng đang phát triển',
      description: 'Tính năng thêm ghi chú sẽ sớm được cập nhật',
    });
  };

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Thu gom hôm nay
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Truck className="h-5 w-5" />
          <span>
            {mockCollector.zone} | {mockCollector.vehicle}
          </span>
        </div>
      </div>

      {/* Collection Points List */}
      <CollectionPointList
        points={points}
        onCheckIn={handleCheckIn}
        onUpdateStatus={handleUpdateStatus}
        onOpenMap={handleOpenMap}
        onUploadPhoto={handleUploadPhoto}
        onAddNote={handleAddNote}
      />
    </main>
  );
} 