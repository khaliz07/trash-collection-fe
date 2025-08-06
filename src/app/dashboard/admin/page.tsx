'use client'

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { 
  Users, 
  Truck, 
  CreditCard, 
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ChevronUp,
  ChevronDown,
  CalendarDays,
  Activity
} from "lucide-react"
import Link from "next/link"
import { useTranslation } from 'react-i18next'

// Mock data for charts
const collectionData = [
  { name: "Thứ 2", collections: 180 },
  { name: "Thứ 3", collections: 220 },
  { name: "Thứ 4", collections: 192 },
  { name: "Thứ 4", collections: 235 },
  { name: "Thứ 5", collections: 245 },
  { name: "Thứ 6", collections: 118 },
  { name: "Thứ 7", collections: 95 },
]

const revenueData = [
  { name: "Tháng 1", revenue: 12000 },
  { name: "Tháng 2", revenue: 14000 },
  { name: "Tháng 3", revenue: 16500 },
  { name: "Tháng 4", revenue: 18200 },
  { name: "Tháng 5", revenue: 19800 },
  { name: "Tháng 6", revenue: 21500 },
]

export default function AdminDashboard() {
  const { t } = useTranslation('common')
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('admin_dashboard.title', 'Bảng điều khiển quản trị')}</h2>
          <p className="text-muted-foreground">
            {t('admin_dashboard.desc', 'Tổng quan hiệu suất hệ thống thu gom rác')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/reports">
            <Button>
              {t('admin_dashboard.generate_reports', 'Tạo báo cáo')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin_dashboard.total_users', 'Tổng số người dùng')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,834</div>
            <div className="flex items-center pt-1 text-xs text-emerald-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              <span>+12.5%</span>
              <span className="text-muted-foreground ml-1">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin_dashboard.active_collectors', 'Người thu gom hoạt động')}
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <div className="flex items-center pt-1 text-xs text-emerald-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              <span>+3</span>
              <span className="text-muted-foreground ml-1">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin_dashboard.total_revenue', 'Tổng doanh thu')}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,280</div>
            <div className="flex items-center pt-1 text-xs text-emerald-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              <span>+8.2%</span>
              <span className="text-muted-foreground ml-1">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin_dashboard.collections_today', 'Thu gom hôm nay')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <div className="flex items-center pt-1 text-xs text-destructive">
              <ArrowDownRight className="mr-1 h-4 w-4" />
              <span>-4.5%</span>
              <span className="text-muted-foreground ml-1">so với hôm qua</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="collectors">Nhân viên thu gom</TabsTrigger>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>{t('admin_dashboard.weekly_collections', 'Thu gom tuần')}</CardTitle>
                <CardDescription>{t('admin_dashboard.collections_per_day', 'Số lần thu gom mỗi ngày trong tuần')}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={collectionData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                      formatter={(value) => [ "Điểm thu gom",`${value}`]}
                    />
                    <Bar 
                      dataKey="collections" 
                      fill="hsl(var(--chart-1))" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t('admin_dashboard.system_status', 'Trạng thái hệ thống')}</CardTitle>
                <CardDescription>{t('admin_dashboard.current_system_performance', 'Hiệu suất hệ thống hiện tại')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="mr-2 h-3 w-3 rounded-full bg-emerald-500"></div>
                        <span>{t('admin_dashboard.server_uptime', 'Thời gian hoạt động server')}</span>
                      </div>
                      <div className="font-medium">99.9%</div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div className="h-full w-[99.9%] rounded-full bg-emerald-500"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="mr-2 h-3 w-3 rounded-full bg-amber-500"></div>
                        <span>{t('admin_dashboard.database_load', 'Tải database')}</span>
                      </div>
                      <div className="font-medium">68%</div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div className="h-full w-[68%] rounded-full bg-amber-500"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="mr-2 h-3 w-3 rounded-full bg-primary"></div>
                        <span>{t('admin_dashboard.api_response_time', 'Thời gian phản hồi API')}</span>
                      </div>
                      <div className="font-medium">230ms</div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div className="h-full w-[23%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                        <span>{t('admin_dashboard.notifications_delivered', 'Thông báo đã gửi')}</span>
                      </div>
                      <div className="font-medium">95.2%</div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div className="h-full w-[95.2%] rounded-full bg-blue-500"></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    {t('admin_dashboard.view_detailed_status', 'Xem trạng thái chi tiết')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>{t('admin_dashboard.monthly_revenue', 'Doanh thu hàng tháng')}</CardTitle>
                <CardDescription>{t('admin_dashboard.revenue_trends', 'Xu hướng doanh thu trong 6 tháng qua')}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                      formatter={(value) => [`${value}`, "Doanh thu"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t('admin_dashboard.recent_activities', 'Hoạt động gần đây')}</CardTitle>
                <CardDescription>{t('admin_dashboard.latest_system_events', 'Sự kiện hệ thống gần đây')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Đăng ký người dùng mới",
                      time: "10 phút trước",
                      icon: Users,
                    },
                    {
                      title: "Cập nhật lịch thu gom",
                      time: "1 giờ trước",
                      icon: CalendarDays,
                    },
                    {
                      title: "Nhận thanh toán",
                      time: "2 giờ trước",
                      icon: CreditCard,
                    },
                    {
                      title: "Giao nhân viên thu gom",
                      time: "3 giờ trước",
                      icon: Truck,
                    },
                  ].map((activity, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                        <activity.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    {t('admin_dashboard.view_all_activities', 'Xem tất cả hoạt động')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <h2 className="text-xl font-semibold">User Management</h2>
        </TabsContent>
        
        <TabsContent value="collectors" className="space-y-4">
          <h2 className="text-xl font-semibold">Collector Management</h2>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <h2 className="text-xl font-semibold">Revenue Reports</h2>
        </TabsContent>
      </Tabs>
    </div>
  )
}