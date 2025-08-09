'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { format, parseISO, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Calendar, 
  Download, 
  Filter, 
  RefreshCw, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Search,
  CreditCard
} from 'lucide-react';
import { UserSwitcher, fetchWithUser } from '@/components/user-switcher';

interface ServicePackage {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring' | 'expired';
  fee: number;
  area: string;
  description: string;
  features: string[];
  collectionsUsed: number;
  collectionsTotal: number;
  nextCollection: string;
  autoRenewal: boolean;
  daysLeft: number;
  isExpiringSoon: boolean;
  canRenew: boolean;
  renewalPrice: number;
}

interface PaymentRecord {
  id: string;
  invoiceId: string;
  packageName: string;
  duration: string;
  amount: number;
  paidAt: string;
  method: string;
  status: 'success' | 'failed' | 'pending';
  description: string;
  paymentGateway: string;
  transactionId: string;
  downloadUrl?: string;
  failureReason?: string;
}

interface PaymentHistoryResponse {
  success: boolean;
  payments: PaymentRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  statistics: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    totalAmount: number;
    thisMonth: number;
  };
}

function getPackageStatusVariant(status: string) {
  switch (status) {
    case 'active': return 'default';
    case 'expiring': return 'warning';
    case 'expired': return 'error';
    default: return 'primary';
  }
}

function getInvoiceStatusVariant(status: string) {
  switch (status) {
    case 'success': return 'default';
    case 'failed': return 'error';
    case 'pending': return 'info';
    default: return 'default';
  }
}

export default function UserPaymentsPage() {
  const router = useRouter();
  
  // State management
  const [currentPackage, setCurrentPackage] = React.useState<ServicePackage | null>(null);
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [statistics, setStatistics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [paymentsLoading, setPaymentsLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [methodFilter, setMethodFilter] = React.useState<string>('all');
  const [fromDate, setFromDate] = React.useState<string>('');
  const [toDate, setToDate] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState(1);

  // Fetch current package
  const fetchCurrentPackage = React.useCallback(async () => {
    try {
      const response = await fetchWithUser('/api/user/current-package');
      const result = await response.json();
      
      if (result.success) {
        setCurrentPackage(result.package);
      } else {
        toast.error('Không thể tải thông tin gói dịch vụ');
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      toast.error('Lỗi kết nối khi tải gói dịch vụ');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch payment history
  const fetchPaymentHistory = React.useCallback(async () => {
    try {
      setPaymentsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (methodFilter && methodFilter !== 'all') params.append('method', methodFilter);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const response = await fetchWithUser(`/api/user/payment-history?${params}`);
      const result: PaymentHistoryResponse = await response.json();
      
      if (result.success) {
        setPayments(result.payments);
        setStatistics(result.statistics);
      } else {
        toast.error('Không thể tải lịch sử thanh toán');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Lỗi kết nối khi tải lịch sử thanh toán');
    } finally {
      setPaymentsLoading(false);
    }
  }, [currentPage, statusFilter, methodFilter, fromDate, toDate]);

  // Initial load
  React.useEffect(() => {
    fetchCurrentPackage();
    fetchPaymentHistory();
  }, [fetchCurrentPackage, fetchPaymentHistory]);

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCurrentPackage(),
      fetchPaymentHistory()
    ]);
    setRefreshing(false);
    toast.success('Đã cập nhật dữ liệu');
  };

  // Navigation handlers
  const handleRequestCollection = () => {
    router.push('/dashboard/user/request');
  };

  const handleExtend = () => {
    router.push('/dashboard/user/extend-subscription');
  };

  // Download invoice
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      window.open(`/api/invoices/${invoiceId}/download`, '_blank');
      toast.success('Đang tải hóa đơn...');
    } catch (error) {
      toast.error('Không thể tải hóa đơn');
    }
  };

  // Auto-renewal toggle
  const handleToggleAutoRenewal = async () => {
    if (!currentPackage) return;
    
    try {
      const response = await fetch('/api/user/current-package', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_auto_renewal'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setCurrentPackage(result.package);
        toast.success(result.package.autoRenewal ? 'Đã bật gia hạn tự động' : 'Đã tắt gia hạn tự động');
      }
    } catch (error) {
      toast.error('Không thể cập nhật cài đặt');
    }
  };

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* User Switcher for Demo */}
      <UserSwitcher onUserChange={() => {
        fetchCurrentPackage();
        fetchPaymentHistory();
      }} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Quản lý gói dịch vụ & thanh toán</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi gói dịch vụ hiện tại và lịch sử thanh toán của bạn
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Current Package & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Package */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gói dịch vụ hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : currentPackage ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-muted-foreground">Tên gói:</span>
                        <span className="font-semibold">{currentPackage.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-muted-foreground">Thời gian:</span>
                        <span className="text-sm">
                          {format(parseISO(currentPackage.startDate), 'dd/MM/yyyy', { locale: vi })} - {format(parseISO(currentPackage.endDate), 'dd/MM/yyyy', { locale: vi })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-muted-foreground">Trạng thái:</span>
                        <Badge variant={getPackageStatusVariant(currentPackage.status)}>
                          {currentPackage.status === 'active' && '✅ Đang hoạt động'}
                          {currentPackage.status === 'expiring' && '⚠️ Sắp hết hạn'}
                          {currentPackage.status === 'expired' && '❌ Hết hạn'}
                        </Badge>
                        {currentPackage.isExpiringSoon && (
                          <Badge variant="warning">
                            <Clock className="h-3 w-3 mr-1" />
                            {currentPackage.daysLeft} ngày
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-muted-foreground">Phí định kỳ:</span>
                        <span className="font-semibold text-green-600">
                          {currentPackage.fee.toLocaleString('vi-VN')}đ/{currentPackage.type === 'weekly' ? 'tuần' : 'tháng'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-muted-foreground">Khu vực:</span>
                        <span className="text-sm">{currentPackage.area}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <span className="font-medium text-sm text-muted-foreground">Tiến độ sử dụng:</span>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{currentPackage.collectionsUsed || 0}/{currentPackage.collectionsTotal || 0} lần thu gom</span>
                            <span>{currentPackage.collectionsTotal ? Math.round(((currentPackage.collectionsUsed || 0) / currentPackage.collectionsTotal) * 100) : 0}%</span>
                          </div>
                          <Progress 
                            value={currentPackage.collectionsTotal ? ((currentPackage.collectionsUsed || 0) / currentPackage.collectionsTotal) * 100 : 0} 
                            className="h-2"
                          />
                        </div>
                      </div>
                      
                      {currentPackage.nextCollection && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-muted-foreground">Thu gom tiếp theo:</span>
                          <span className="text-sm font-medium text-blue-600">
                            {format(parseISO(currentPackage.nextCollection), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Package Features */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">Quyền lợi gói dịch vụ:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentPackage.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Chưa có gói dịch vụ nào</p>
                </div>
              )}
            </CardContent>
            
            {currentPackage && (
              <CardFooter className="flex flex-wrap gap-3">
                {currentPackage.status === 'expired' ? (
                  <Button onClick={handleExtend} className="flex-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Mua gói mới
                  </Button>
                ) : (
                  <Button 
                    onClick={handleExtend} 
                    disabled={!currentPackage.canRenew}
                    variant={currentPackage.isExpiringSoon ? "default" : "secondary"}
                    className="flex-1"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Gia hạn ({(currentPackage.renewalPrice || 0).toLocaleString('vi-VN')}đ)
                  </Button>
                )}
                
                {currentPackage.status !== 'expired' && (
                  <Button variant="outline" onClick={handleRequestCollection}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Yêu cầu thu gom gấp
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleToggleAutoRenewal}
                  className="flex items-center gap-2"
                >
                  {currentPackage.autoRenewal ? '🔄 Tắt tự động gia hạn' : '⏸️ Bật tự động gia hạn'}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Thống kê
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ) : statistics ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {statistics.totalAmount.toLocaleString('vi-VN')}đ
                  </div>
                  <div className="text-sm text-green-700">Tổng đã thanh toán</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-semibold text-blue-600">{statistics.successful}</div>
                    <div className="text-xs text-blue-700">Thành công</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded">
                    <div className="text-lg font-semibold text-red-600">{statistics.failed}</div>
                    <div className="text-xs text-red-700">Thất bại</div>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="text-lg font-semibold text-orange-600">{statistics.thisMonth}</div>
                  <div className="text-xs text-orange-700">Thanh toán tháng này</div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Lịch sử thanh toán
            </CardTitle>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                  <SelectItem value="pending">Đang xử lý</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="QR">QR Code</SelectItem>
                  <SelectItem value="VNPay">VNPay</SelectItem>
                  <SelectItem value="Momo">Momo</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setMethodFilter('all');
                  setFromDate('');
                  setToDate('');
                  setCurrentPage(1);
                }}
              >
                <Filter className="h-4 w-4 mr-1" />
                Xóa bộ lọc
              </Button>
            </div>
          </div>
          
          {/* Date Range Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="fromDate" className="text-sm">Từ ngày:</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="toDate" className="text-sm">Đến ngày:</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => fetchPaymentHistory()}
              disabled={paymentsLoading}
            >
              <Search className="h-4 w-4 mr-1" />
              Tìm kiếm
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {paymentsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : payments.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã thanh toán</TableHead>
                      <TableHead>Gói dịch vụ</TableHead>
                      <TableHead>Ngày thanh toán</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Phương thức</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.invoiceId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.packageName}</div>
                            <div className="text-sm text-muted-foreground">{payment.duration}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(payment.paidAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {payment.amount.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell>
                          <Badge variant="info">{payment.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getInvoiceStatusVariant(payment.status)}>
                            {payment.status === 'success' && (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Thành công
                              </>
                            )}
                            {payment.status === 'failed' && (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Thất bại
                              </>
                            )}
                            {payment.status === 'pending' && (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Đang xử lý
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.downloadUrl && payment.status === 'success' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadInvoice(payment.invoiceId)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Tải
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {payments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium">{payment.packageName}</div>
                          <div className="text-sm text-muted-foreground font-mono">{payment.invoiceId}</div>
                        </div>
                        <Badge variant={getInvoiceStatusVariant(payment.status)}>
                          {payment.status === 'success' && 'Thành công'}
                          {payment.status === 'failed' && 'Thất bại'}
                          {payment.status === 'pending' && 'Đang xử lý'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Số tiền:</span>
                          <div className="font-semibold">{payment.amount.toLocaleString('vi-VN')}đ</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phương thức:</span>
                          <div>{payment.method}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ngày:</span>
                          <div>{format(parseISO(payment.paidAt), 'dd/MM/yyyy', { locale: vi })}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Thời gian:</span>
                          <div>{format(parseISO(payment.paidAt), 'HH:mm', { locale: vi })}</div>
                        </div>
                      </div>
                      
                      {payment.failureReason && (
                        <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
                          <strong>Lý do thất bại:</strong> {payment.failureReason}
                        </div>
                      )}
                      
                      {payment.downloadUrl && payment.status === 'success' && (
                        <div className="mt-3 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(payment.invoiceId)}
                            className="w-full"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Tải hóa đơn
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Chưa có lịch sử thanh toán nào</p>
              {(statusFilter !== 'all' || methodFilter !== 'all' || fromDate || toDate) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setStatusFilter('all');
                    setMethodFilter('all');
                    setFromDate('');
                    setToDate('');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 