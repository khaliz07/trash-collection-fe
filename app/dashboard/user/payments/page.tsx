'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockCurrentPackage, mockInvoices } from './mockData';
import { format, parseISO, differenceInDays } from 'date-fns';
import * as React from 'react';
import { useRouter } from 'next/navigation';

function getPackageStatusVariant(status: string) {
  switch (status) {
    case 'active': return 'success';
    case 'expiring': return 'warning';
    case 'expired': return 'error';
    default: return 'default';
  }
}

function getInvoiceStatusVariant(status: string) {
  switch (status) {
    case 'success': return 'success';
    case 'failed': return 'error';
    default: return 'default';
  }
}

export default function UserPaymentsPage() {
  const today = new Date();
  const router = useRouter();
  const endDate = parseISO(mockCurrentPackage.endDate);
  const daysLeft = differenceInDays(endDate, today);

  const handleRequestCollection = () => {
    router.push('/dashboard/user/request');
  }

  const handleExtend = () => {
    router.push('/dashboard/user/extend-subscription');
  }

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Quản lý gói dịch vụ & thanh toán</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Gói dịch vụ hiện tại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Tên gói:</span>
                <span>{mockCurrentPackage.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Thời gian:</span>
                <span>{format(parseISO(mockCurrentPackage.startDate), 'dd/MM/yyyy')} - {format(parseISO(mockCurrentPackage.endDate), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Trạng thái:</span>
                <Badge variant={getPackageStatusVariant(mockCurrentPackage.status)}>
                  {mockCurrentPackage.status === 'active' && 'Đang hoạt động'}
                  {mockCurrentPackage.status === 'expiring' && 'Sắp hết hạn'}
                  {mockCurrentPackage.status === 'expired' && 'Hết hạn'}
                </Badge>
                {mockCurrentPackage.status === 'expiring' && daysLeft <= 5 && (
                  <Badge variant="warning">Sắp hết hạn ({daysLeft} ngày)</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Phí định kỳ:</span>
                <span>{mockCurrentPackage.fee.toLocaleString()}đ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Khu vực áp dụng:</span>
                <span>{mockCurrentPackage.area}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            {(mockCurrentPackage.status === 'expired') ? (
              <Button variant="default" onClick={handleExtend}>Mua gói mới</Button>
            ) : (
              <Button variant="default" onClick={handleExtend} disabled={daysLeft > 10}>Gia hạn</Button>
            )}
            {mockCurrentPackage.status !== 'expired' && (
              <Button variant="secondary" onClick={handleRequestCollection}>Tạo yêu cầu thu gom gấp</Button>
            )}
          </CardFooter>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã hóa đơn</TableHead>
                <TableHead>Gói dịch vụ</TableHead>
                <TableHead>Ngày thanh toán</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tải hóa đơn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.id}</TableCell>
                  <TableCell>{inv.packageName}</TableCell>
                  <TableCell>{format(parseISO(inv.paidAt), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{inv.amount.toLocaleString()}đ</TableCell>
                  <TableCell>{inv.method}</TableCell>
                  <TableCell>
                    <Badge variant={getInvoiceStatusVariant(inv.status)}>
                      {inv.status === 'success' ? 'Thành công' : 'Thất bại'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {inv.downloadUrl ? (
                      <a href={inv.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">Tải hóa đơn</Button>
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 