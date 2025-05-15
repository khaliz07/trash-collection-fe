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

// Mock data for charts
const collectionData = [
  { name: "Mon", collections: 180 },
  { name: "Tue", collections: 220 },
  { name: "Wed", collections: 192 },
  { name: "Thu", collections: 235 },
  { name: "Fri", collections: 245 },
  { name: "Sat", collections: 118 },
  { name: "Sun", collections: 95 },
]

const revenueData = [
  { name: "Jan", revenue: 12000 },
  { name: "Feb", revenue: 14000 },
  { name: "Mar", revenue: 16500 },
  { name: "Apr", revenue: 18200 },
  { name: "May", revenue: 19800 },
  { name: "Jun", revenue: 21500 },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of waste collection system performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/reports">
            <Button>
              Generate Reports
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,834</div>
            <div className="flex items-center pt-1 text-xs text-emerald-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              <span>+12.5%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Collectors
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <div className="flex items-center pt-1 text-xs text-emerald-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              <span>+3</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,280</div>
            <div className="flex items-center pt-1 text-xs text-emerald-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              <span>+8.2%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collections Today
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <div className="flex items-center pt-1 text-xs text-destructive">
              <ArrowDownRight className="mr-1 h-4 w-4" />
              <span>-4.5%</span>
              <span className="text-muted-foreground ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="collectors">Collectors</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Weekly Collections</CardTitle>
                <CardDescription>Number of collections per day this week</CardDescription>
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
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="mr-2 h-3 w-3 rounded-full bg-emerald-500"></div>
                        <span>Server Uptime</span>
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
                        <span>Database Load</span>
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
                        <span>API Response Time</span>
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
                        <span>Notifications Delivered</span>
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
                    View Detailed Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue trends over the past 6 months</CardDescription>
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
                      formatter={(value) => [`$${value}`, "Revenue"]}
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
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "New user registration",
                      time: "10 minutes ago",
                      icon: Users,
                    },
                    {
                      title: "Collection schedule updated",
                      time: "1 hour ago",
                      icon: CalendarDays,
                    },
                    {
                      title: "Payment received",
                      time: "2 hours ago",
                      icon: CreditCard,
                    },
                    {
                      title: "Collector assigned to route",
                      time: "3 hours ago",
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
                    View All Activities
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