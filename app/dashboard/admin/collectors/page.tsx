'use client'

import * as React from 'react';
import CollectorsTable from '@/components/admin/collectors/CollectorsTable';
import { mockCollectors, mockCollectorPerformance, mockCollectorHistory, mockCollectorReviews, mockAreas } from '@/components/admin/collectors/mockData';
import type { Collector } from '@/components/admin/collectors/types';
import CollectorDetailDialog from '@/components/admin/collectors/CollectorDetailDialog';
import CollectorReviewDialog from '@/components/admin/collectors/CollectorReviewDialog';
import CollectorFormDialog from '@/components/admin/collectors/CollectorFormDialog';

export default function AdminCollectorsPage() {
  // State filter/search
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [area, setArea] = React.useState('all');

  // State dialog
  const [selected, setSelected] = React.useState<Collector | null>(null);
  const [openDetail, setOpenDetail] = React.useState(false);
  const [openReview, setOpenReview] = React.useState(false);
  const [openForm, setOpenForm] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState<'delete'|'area'|null>(null);

  // Thống kê
  const total = mockCollectors.length;
  const active = mockCollectors.filter(c => c.status === 'active').length;
  const inactive = mockCollectors.filter(c => c.status === 'inactive').length;
  const terminated = mockCollectors.filter(c => c.status === 'terminated').length;

  // Lấy danh sách filter động từ mockCollectors
  const areaOptions = Array.from(new Set(mockCollectors.map(c => c.area.id)))
    .map(id => {
      const area = mockCollectors.find(c => c.area.id === id)?.area;
      return area ? { id: area.id, name: area.name } : undefined;
    })
    .filter((a): a is { id: string; name: string } => !!a);
  const statusOptions = Array.from(new Set(mockCollectors.map(c => c.status)));

  // Lọc dữ liệu theo search, status, area
  const filteredCollectors = mockCollectors.filter(c => {
    const matchSearch = search.trim() === '' ||
      c.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      c.phone.includes(search.trim());
    const matchStatus = status === 'all' || c.status === status;
    const matchArea = area === 'all' || c.area.id === area;
    return matchSearch && matchStatus && matchArea;
  });

  // Handler
  const handleViewDetail = (c: Collector) => { setSelected(c); setOpenDetail(true); };
  const handleEdit = (c: Collector) => { setSelected(c); setOpenForm(true); };
  const handleSuspend = (c: Collector) => { setSelected(c); setConfirmType('area'); setOpenConfirm(true); };
  const handleDelete = (c: Collector) => { setSelected(c); setConfirmType('delete'); setOpenConfirm(true); };
  const handleViewReviews = (c: Collector) => { setSelected(c); setOpenReview(true); };

  return (
    <div className="container py-8 max-w-6xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Nhân viên thu gom</h1>
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-2xl font-bold text-primary">{total}</div>
          <div className="text-xs text-gray-500 mt-1">Tổng số nhân viên</div>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{active}</div>
          <div className="text-xs text-gray-500 mt-1">Đang hoạt động</div>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-2xl font-bold text-yellow-500">{inactive}</div>
          <div className="text-xs text-gray-500 mt-1">Tạm nghỉ</div>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{terminated}</div>
          <div className="text-xs text-gray-500 mt-1">Nghỉ việc</div>
        </div>
      </div>
      {/* Filter/Search UI */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 w-full md:w-64"
          placeholder="Tìm kiếm theo tên, SĐT..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="border rounded px-3 py-2" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{s === 'active' ? 'Đang hoạt động' : s === 'inactive' ? 'Tạm nghỉ' : 'Nghỉ việc'}</option>
          ))}
        </select>
        <select className="border rounded px-3 py-2" value={area} onChange={e => setArea(e.target.value)}>
          <option value="all">Tất cả khu vực</option>
          {areaOptions.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <button className="ml-auto bg-primary text-white rounded px-4 py-2" onClick={() => { setSelected(null); setOpenForm(true); }}>+ Thêm nhân viên</button>
      </div>
      <CollectorsTable
        collectors={filteredCollectors}
        onViewDetail={handleViewDetail}
        onEdit={handleEdit}
        onSuspend={handleSuspend}
        onDelete={handleDelete}
        onViewReviews={handleViewReviews}
      />
      {/* Dialogs (placeholder) */}
      {openDetail && (
        <CollectorDetailDialog
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          collector={selected}
          performance={selected ? mockCollectorPerformance.find(p => p.collectorId === selected.id) : undefined}
          history={selected ? mockCollectorHistory.filter(h => h.collectorId === selected.id) : []}
        />
      )}
      {openReview && (
        <CollectorReviewDialog
          open={openReview}
          onClose={() => setOpenReview(false)}
          collector={selected}
          reviews={selected ? mockCollectorReviews.filter(r => r.collectorId === selected.id) : []}
        />
      )}
      {openForm && (
        <CollectorFormDialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          collector={selected}
          areas={mockAreas}
          onSubmit={(data) => { setOpenForm(false); /* TODO: handle add/edit */ }}
        />
      )}
      {openConfirm && <div>{/* ConfirmDialog (TODO) */}</div>}
    </div>
  );
} 