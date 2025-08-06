import { CollectionPoint, CollectionStatus } from '@/types/collection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_CONFIG = {
  [CollectionStatus.PENDING]: {
    label: 'Chưa thu',
    variant: 'warning' as const
  },
  [CollectionStatus.IN_PROGRESS]: {
    label: 'Đang thu',
    variant: 'info' as const
  },
  [CollectionStatus.COMPLETED]: {
    label: 'Đã thu',
    variant: 'success' as const
  },
  [CollectionStatus.CANNOT_COLLECT]: {
    label: 'Không thể thu',
    variant: 'error' as const
  }
};

interface CollectionPointMapPopupProps {
  point: CollectionPoint;
  onCheckIn?: () => void;
  onNavigate?: () => void;
}

export function CollectionPointMapPopup({ point, onCheckIn, onNavigate }: CollectionPointMapPopupProps) {
  const statusConfig = STATUS_CONFIG[point.status];
  const isCheckedIn = !!point.checkInTime;

  return (
    <div className="min-w-[220px] max-w-[320px] space-y-2">
      <div className="flex justify-between items-center">
        <div className="font-semibold">#{point.id}</div>
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
      </div>
      <div className="text-sm text-muted-foreground">{point.address}</div>
      <div className="text-xs text-muted-foreground">Thời gian: {point.scheduledTime}</div>
      <div className="text-xs">Loại rác: {point.wasteType}</div>
      {point.specialNotes && (
        <div className="text-xs text-yellow-600 dark:text-yellow-500">Lưu ý: {point.specialNotes}</div>
      )}
      <div className="flex gap-2 mt-2">
        {!isCheckedIn && (
          <Button size="sm" onClick={onCheckIn}>Check-in</Button>
        )}
        <Button size="sm" variant="outline" onClick={onNavigate}>Chỉ đường</Button>
      </div>
    </div>
  );
} 