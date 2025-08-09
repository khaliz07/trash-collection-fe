import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCreateCollector, useUpdateCollector } from '@/hooks/use-collectors';
import type { Collector, CollectorStatus } from './types';

export interface CollectorFormDialogProps {
  open: boolean;
  onClose: () => void;
  collector?: Collector | null;
  areas?: any[]; // Keep for backward compatibility but won't use
}

const statusOptions: { value: CollectorStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Tạm nghỉ' },
  { value: 'SUSPENDED', label: 'Tạm ngưng' },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  cccd: string;
  licensePlate: string;
  startDate: string;
  status: CollectorStatus;
  address: string;
  password: string; // For new collectors only
}

export function CollectorFormDialog({ open, onClose, collector, areas }: CollectorFormDialogProps) {
  const isEdit = !!collector;
  const createCollectorMutation = useCreateCollector(onClose);
  const updateCollectorMutation = useUpdateCollector(onClose);
  
  const [form, setForm] = React.useState<FormData>({
    name: collector?.name || '',
    email: collector?.email || '',
    phone: collector?.phone || '',
    cccd: collector?.cccd || '',
    licensePlate: collector?.licensePlate || '',
    startDate: collector?.startDate ? collector.startDate.split('T')[0] : '', // Convert ISO to YYYY-MM-DD
    status: collector?.status || 'ACTIVE',
    address: '',
    password: '', // Only for new collectors
  });
  const [error, setError] = React.useState('');
  
  React.useEffect(() => {
    if (collector) {
      setForm({
        name: collector.name || '',
        email: collector.email || '',
        phone: collector.phone || '',
        cccd: collector.cccd || '',
        licensePlate: collector.licensePlate || '',
        startDate: collector.startDate ? collector.startDate.split('T')[0] : '',
        status: collector.status || 'ACTIVE',
        address: '',
        password: '',
      });
    } else {
      setForm({
        name: '', 
        email: '', 
        phone: '', 
        cccd: '', 
        licensePlate: '', 
        startDate: '', 
        status: 'ACTIVE',
        address: '',
        password: '',
      });
    }
    setError('');
  }, [collector, open]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!form.name || !form.phone) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc (Tên, SĐT).');
      return;
    }
    
    if (!isEdit && !form.password) {
      setError('Vui lòng nhập mật khẩu cho nhân viên mới.');
      return;
    }
    
    if (!isEdit && !form.email) {
      setError('Vui lòng nhập email cho nhân viên mới.');
      return;
    }
    
    setError('');
    
    const submitData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      cccd: form.cccd,
      licensePlate: form.licensePlate,
      startDate: form.startDate,
      status: form.status,
      address: form.address,
      ...(form.password && { password: form.password }),
    };
    
    console.log('Submitting data:', { isEdit, submitData }); // Debug log
    
    if (isEdit && collector) {
      // For update, pass individual fields directly (not nested in data object)
      updateCollectorMutation.mutate({
        id: collector.id,
        data: submitData
      });
    } else {
      createCollectorMutation.mutate(submitData);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Họ tên *</label>
            <input className="border rounded px-3 py-2 w-full" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
            <input className="border rounded px-3 py-2 w-full" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CCCD</label>
            <input className="border rounded px-3 py-2 w-full" name="cccd" value={form.cccd} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Biển số xe</label>
            <input className="border rounded px-3 py-2 w-full" name="licensePlate" value={form.licensePlate} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
            <input type="date" className="border rounded px-3 py-2 w-full" name="startDate" value={form.startDate} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email {!isEdit && '*'}</label>
            <input 
              type="email" 
              className="border rounded px-3 py-2 w-full" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              required={!isEdit}
            />
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu *</label>
              <input 
                type="password" 
                className="border rounded px-3 py-2 w-full" 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                required
                placeholder="Mật khẩu cho nhân viên mới"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Địa chỉ</label>
            <input 
              className="border rounded px-3 py-2 w-full" 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              placeholder="Địa chỉ cư trú"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái *</label>
            <select className="border rounded px-3 py-2 w-full" name="status" value={form.status} onChange={handleChange} required>
              {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <button 
              type="button" 
              className="bg-gray-200 rounded px-4 py-2 mr-2" 
              onClick={onClose}
              disabled={createCollectorMutation.isPending || updateCollectorMutation.isPending}
            >
              Đóng
            </button>
            <button 
              type="submit" 
              className="bg-primary text-white rounded px-4 py-2 disabled:opacity-50" 
              disabled={createCollectorMutation.isPending || updateCollectorMutation.isPending}
            >
              {createCollectorMutation.isPending || updateCollectorMutation.isPending 
                ? 'Đang xử lý...' 
                : (isEdit ? 'Cập nhật' : 'Thêm mới')
              }
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CollectorFormDialog; 