import { MapPin, Clock, Camera, MessageSquare, Map, ImageIcon } from 'lucide-react';
import { CollectionPoint, CollectionStatus } from '@/types/collection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ImagePreview } from '@/components/ui/image-preview';

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
} as const;

interface CollectionPointCardProps {
  point: CollectionPoint;
  onCheckIn?: () => void;
  onUpdateStatus?: (status: CollectionStatus) => void;
  onOpenMap?: () => void;
  onUploadPhoto?: () => void;
  onAddNote?: () => void;
}

export function CollectionPointCard({
  point,
  onCheckIn,
  onUpdateStatus,
  onOpenMap,
  onUploadPhoto,
  onAddNote
}: CollectionPointCardProps) {
  const statusConfig = STATUS_CONFIG[point.status];
  const isCheckedIn = !!point.checkInTime;

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with status */}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">
              Điểm thu gom #{point.id}
            </h3>
            <Badge variant={statusConfig.variant}>
              {statusConfig.label}
            </Badge>
          </div>

          {/* Address and scheduled time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{point.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Thời gian dự kiến: {point.scheduledTime}
                {point.checkInTime && ` (Check-in: ${point.checkInTime})`}
              </span>
            </div>
          </div>

          {/* Waste type and special notes */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Loại rác: {point.wasteType}
            </p>
            {point.specialNotes && (
              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                Lưu ý: {point.specialNotes}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 justify-end">
            {!isCheckedIn && (
              <Button onClick={onCheckIn}>
                Check-in
              </Button>
            )}

            <Button variant="outline" size="icon" onClick={onOpenMap}>
              <Map className="h-4 w-4" />
            </Button>

            {isCheckedIn && (
              <>
                {point.requiresPhoto && (
                  <Button variant="outline" size="icon" onClick={onUploadPhoto}>
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="icon" onClick={onAddNote}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Notes and photos */}
          {(point.note || point.photo) && (
            <div className="space-y-2 pt-2 border-t">
              {point.note && (
                <p className="text-sm text-muted-foreground">
                  Ghi chú: {point.note}
                </p>
              )}
              {point.photo ? (
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <ImagePreview
                src={point.photo}
                alt={`Collection point at ${point.address}`}
                previewSize="md"
                aspectRatio="video"
              />
            </div>
          ) : (
            <div /> /* Empty div for spacing */
          )}
              {/* {point.photo && (
                <div className="relative h-48 rounded-md overflow-hidden">
                  <img 
                    src={point.photo} 
                    alt="Collection proof" 
                    className="object-cover w-full h-full"
                  />
                </div>
              )} */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 