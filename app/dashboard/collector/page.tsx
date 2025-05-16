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
import { CollectionPointList } from "@/components/dashboard/collection/today/CollectionPointList"
import { mockCollectionPoints } from "./mockData"

export default function CollectorDashboard() {
  // Mock data
  const todaysCollections = {
    total: mockCollectionPoints.length,
    completed: mockCollectionPoints.filter(cp => cp.status === "completed").length,
    pending: mockCollectionPoints.filter(cp => cp.status === "pending").length
  }
  
  const handleCheckIn = (id: string) => {
    // In a real app, this would update the collection point status
    console.log("Checking in to collection point:", id);
  };
  
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
          
          <Card>
            <CardHeader>
              <CardTitle>Collection Points</CardTitle>
              <CardDescription>Manage your assigned collection points for today</CardDescription>
            </CardHeader>
            <CardContent>
              <CollectionPointList
                collectionPoints={mockCollectionPoints}
                onCheckIn={handleCheckIn}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Your collection performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Performance analytics content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="urgent">
          <Card>
            <CardHeader>
              <CardTitle>Urgent Requests</CardTitle>
              <CardDescription>High priority collection requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Urgent requests content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}