import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  CalendarIcon, 
  Clock, 
  Truck, 
  ArrowRight, 
  CheckCircle, 
  MapPin,
  BarChart
} from "lucide-react"
import Link from "next/link"

export default function CollectorDashboard() {
  // Mock data
  const todaysCollections = {
    total: 15,
    completed: 8,
    pending: 7
  }
  
  const upcomingCollections = [
    {
      address: "123 Main St, Apt 4B",
      time: "10:30 AM",
      status: "Next",
      distance: "0.5 miles"
    },
    {
      address: "456 Oak Ave",
      time: "11:15 AM",
      status: "Upcoming",
      distance: "0.8 miles"
    },
    {
      address: "789 Pine St",
      time: "12:00 PM",
      status: "Upcoming",
      distance: "1.2 miles"
    }
  ]
  
  const completedCollections = [
    {
      address: "321 Maple Rd",
      time: "9:45 AM",
      status: "Completed",
    },
    {
      address: "654 Cedar Ln",
      time: "9:15 AM",
      status: "Completed",
    },
    {
      address: "987 Birch Blvd",
      time: "8:30 AM",
      status: "Completed",
    }
  ]
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground">
            Here's an overview of your collection tasks for today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/collector/map">
            <Button>
              View Route Map
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's Tasks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="urgent">Urgent Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Collections
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todaysCollections.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total collections assigned today
                </p>
                <div className="mt-4">
                  <Progress value={(todaysCollections.completed / todaysCollections.total) * 100} className="h-2" />
                </div>
                <div className="mt-1 text-xs flex justify-between">
                  <div>{todaysCollections.completed} completed</div>
                  <div>{todaysCollections.pending} remaining</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Route Progress
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">53%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Of today's route completed
                </p>
                <div className="mt-4">
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-[53%]"></div>
                  </div>
                </div>
                <div className="mt-2 text-xs">
                  Est. completion: 2:30 PM
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Efficiency Rate
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg. time per collection: 11 min
                </p>
                <div className="mt-4">
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[94%]"></div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  +5% from last week
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Urgent Requests
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground mt-1">
                  New urgent collection requests
                </p>
                <Link href="/dashboard/collector/urgent" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">
                    View Requests
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Collections</CardTitle>
                <CardDescription>Your next scheduled pickups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingCollections.map((collection, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                          collection.status === "Next" 
                            ? "bg-primary/20" 
                            : "bg-muted"
                        }`}>
                          <MapPin className={`h-5 w-5 ${
                            collection.status === "Next" 
                              ? "text-primary" 
                              : "text-muted-foreground"
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium">{collection.address}</div>
                          <div className="text-sm text-muted-foreground">
                            {collection.time} · {collection.distance}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-medium ${
                          collection.status === "Next" 
                            ? "border border-primary/30 bg-primary/10 text-primary" 
                            : "border bg-muted text-muted-foreground"
                        }`}>
                          {collection.status}
                        </div>
                        <Link href="/dashboard/collector/checkin">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            disabled={collection.status !== "Next"}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/dashboard/collector/today">
                    <Button variant="outline" className="w-full">
                      View All Collections
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Completed Collections</CardTitle>
                <CardDescription>Collections completed today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedCollections.map((collection, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <div className="font-medium">{collection.address}</div>
                          <div className="text-sm text-muted-foreground">
                            Completed at {collection.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex h-6 items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          {collection.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    View All Completed
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <h2 className="text-xl font-semibold">Performance Analytics</h2>
        </TabsContent>
        
        <TabsContent value="urgent" className="space-y-4">
          <h2 className="text-xl font-semibold">Urgent Collection Requests</h2>
        </TabsContent>
      </Tabs>
    </div>
  )
}