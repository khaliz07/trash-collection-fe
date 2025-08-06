import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { Collector, CollectorArea, CollectorStatus } from './types';

export interface CollectorFormDialogProps {
  open: boolean;
  onClose: () => void;
  collector?: Collector | null;
  areas: CollectorArea[];
  onSubmit: (data: Omit<Collector, 'id'|'rating'|'reviewCount'>) => void;
}

const statusOptions: { value: CollectorStatus; label: string }[] = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Tạm nghỉ' },
  { value: 'terminated', label: 'Nghỉ việc' },
];

export function CollectorFormDialog({ open, onClose, collector, areas, onSubmit }: CollectorFormDialogProps) {
  const isEdit = !!collector;
  const [form, setForm] = React.useState<Omit<Collector, 'id'|'rating'|'reviewCount'>>({
    name: collector?.name || '',
    phone: collector?.phone || '',
    area: collector?.area || areas[0],
    status: collector?.status || 'active',
    startDate: collector?.startDate || '',
    cccd: collector?.cccd || '',
    email: collector?.email || '',
  });
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    if (collector) {
      setForm({
        name: collector.name,
        phone: collector.phone,
        area: collector.area,
        status: collector.status,
        startDate: collector.startDate,
        cccd: collector.cccd,
        email: collector.email || '',
      });
    } else {
      setForm({
        name: '', phone: '', area: areas[0], status: 'active', startDate: '', cccd: '', email: ''
      });
    }
    setError('');
  }, [collector, open, areas]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  function handleAreaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const area = areas.find(a => a.id === e.target.value);
    if (area) setForm(f => ({ ...f, area }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.cccd || !form.startDate) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }
    setError('');
    onSubmit(form);
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
            <label className="block text-sm font-medium mb-1">CCCD *</label>
            <input className="border rounded px-3 py-2 w-full" name="cccd" value={form.cccd} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input className="border rounded px-3 py-2 w-full" name="email" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Khu vực *</label>
            <select className="border rounded px-3 py-2 w-full" name="area" value={form.area.id} onChange={handleAreaChange} required>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái *</label>
            <select className="border rounded px-3 py-2 w-full" name="status" value={form.status} onChange={handleChange} required>
              {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày bắt đầu *</label>
            <input className="border rounded px-3 py-2 w-full" name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <button type="button" className="bg-gray-200 rounded px-4 py-2 mr-2" onClick={onClose}>Đóng</button>
            <button type="submit" className="bg-primary text-white rounded px-4 py-2">{isEdit ? 'Lưu' : 'Thêm'}</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CollectorFormDialog; 