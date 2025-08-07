'use client'

import * as React from 'react';
import CollectorsTable from '@/components/admin/collectors/CollectorsTable';
import type { Collector } from '@/components/admin/collectors/types';
import CollectorDetailDialog from '@/components/admin/collectors/CollectorDetailDialog';
import CollectorReviewDialog from '@/components/admin/collectors/CollectorReviewDialog';
import CollectorFormDialog from '@/components/admin/collectors/CollectorFormDialog';
import ConfirmDeleteDialog from '@/components/admin/collectors/ConfirmDeleteDialog';
import { useTranslation } from 'react-i18next'
import { useCollectors } from '@/hooks/use-collectors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Users, UserCheck, UserX, UserMinus } from 'lucide-react'

export default function AdminCollectorsPage() {
  const { t } = useTranslation('common')
  
  // State filter/search
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const limit = 10;

  // State dialog
  const [selected, setSelected] = React.useState<Collector | null>(null);
  const [openDetail, setOpenDetail] = React.useState(false);
  const [openReview, setOpenReview] = React.useState(false);
  const [openForm, setOpenForm] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);

  // Fetch collectors data
  const { data: collectorsData, isLoading, error } = useCollectors({
    page,
    limit,
    search: search.trim() || undefined,
    status: status !== 'all' ? status : undefined,
  });

  const collectors = collectorsData?.collectors || [];
  const pagination = collectorsData?.pagination;

  // Stats based on actual data
  const total = pagination?.total || 0;
  const active = collectors.filter((c: Collector) => c.status === 'ACTIVE').length;
  const inactive = collectors.filter((c: Collector) => c.status === 'INACTIVE').length;
  const suspended = collectors.filter((c: Collector) => c.status === 'SUSPENDED').length;

  // Status options from enum
  const statusOptions = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

  // Handler functions
  const handleDetail = (c: Collector) => { setSelected(c); setOpenDetail(true); };
  const handleSuspend = (c: Collector) => { 
    // TODO: Implement suspend functionality
    console.log('Suspend collector:', c.id); 
  };
  const handleEdit = (c: Collector) => { setSelected(c); setOpenForm(true); };
  const handleReview = (c: Collector) => { setSelected(c); setOpenReview(true); };
  const handleCreate = () => { setSelected(null); setOpenForm(true); };
  const handleDelete = (c: Collector) => { setSelected(c); setOpenDelete(true); };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading collectors: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('Quản lý nhân viên thu gom')}</h1>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('Thêm nhân viên')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Tổng số')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Đang hoạt động')}</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Tạm dừng')}</CardTitle>
            <UserX className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Bị đình chỉ')}</CardTitle>
            <UserMinus className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder={t('Tìm kiếm theo tên, số điện thoại...')} 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('Tất cả trạng thái')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('Tất cả trạng thái')}</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === 'ACTIVE' ? t('Hoạt động') : 
                     s === 'INACTIVE' ? t('Tạm dừng') : 
                     s === 'SUSPENDED' ? t('Đình chỉ') : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <>
              <CollectorsTable
                collectors={collectors}
                onViewDetail={handleDetail}
                onSuspend={handleSuspend}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewReviews={handleReview}
              />
              
              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total} kết quả
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      Trước
                    </Button>
                    <span className="px-3 py-1 text-sm">
                      Trang {pagination.page} / {pagination.totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs - Note: These will need to be updated to use real data later */}
      <CollectorDetailDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        collector={selected}
        performance={undefined} // TODO: Implement performance API
        history={[]} // TODO: Implement history API
      />

      <CollectorReviewDialog
        open={openReview}
        onClose={() => setOpenReview(false)}
        collector={selected}
        reviews={[]} // TODO: Implement reviews API
      />

      <CollectorFormDialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelected(null); // Clear selected collector when closing
        }}
        collector={selected}
      />

      <ConfirmDeleteDialog
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelected(null);
        }}
        collector={selected}
      />
    </div>
  );
}