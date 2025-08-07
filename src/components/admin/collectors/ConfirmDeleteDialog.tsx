import * as React from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useDeleteCollector } from '@/hooks/use-collectors';
import type { Collector } from './types';

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  collector: Collector | null;
}

export function ConfirmDeleteDialog({ open, onClose, collector }: ConfirmDeleteDialogProps) {
  const deleteCollectorMutation = useDeleteCollector(onClose);

  const handleDelete = () => {
    if (collector) {
      deleteCollectorMutation.mutate(collector.id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa nhân viên</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa nhân viên <strong>{collector?.name}</strong>?
            <br />
            <br />
            <strong>Lưu ý:</strong> Chỉ có thể xóa nhân viên có trạng thái "Tạm nghỉ" hoặc "Tạm ngưng". 
            Nhân viên đang hoạt động cần được tạm ngưng trước khi xóa.
            <br />
            <br />
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteCollectorMutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCollectorMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteCollectorMutation.isPending ? 'Đang xóa...' : 'Xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDeleteDialog;
