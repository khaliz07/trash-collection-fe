'use client';
import '../../../i18n';
import { useTranslation } from 'react-i18next';
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
import { 
  CalendarIcon, 
  Clock, 
  CreditCard, 
  ArrowRight, 
  Truck,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

export default function UserDashboard() {
  const { t } = useTranslation('common');
  // Mapping cho status và ngày trong tuần
  const statusMap: Record<'Scheduled' | 'Completed', string> = {
    Scheduled: t('status_scheduled'),
    Completed: t('status_completed'),
  };
  const dayMap: Record<'Monday' | 'Wednesday' | 'Friday', string> = {
    Monday: t('monday'),
    Wednesday: t('wednesday'),
    Friday: t('friday'),
  };
  // Mock data
  const nextCollection = {
    date: "Ngày mai, 5:00 AM",
    status: "Scheduled"
  }
  
  const recentCollections = [
    {
      date: "April 10, 2025",
      status: "Completed",
      collector: "Michael T."
    },
    {
      date: "April 7, 2025",
      status: "Completed",
      collector: "David L."
    },
    {
      date: "April 3, 2025",
      status: "Completed",
      collector: "Michael T."
    }
  ]
  
  const paymentInfo = {
    plan: t('monthly'),
    nextPayment: "May 1, 2025",
    amount: "$19.00"
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('welcomeBack')}</h2>
          <p className="text-muted-foreground">
            {t('overviewDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/user/request">
            <Button>
              {t('requestCollection')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="collections">{t('collections')}</TabsTrigger>
          <TabsTrigger value="payments">{t('payments')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('nextCollection')}
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nextCollection.date}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('status')}: {statusMap[nextCollection.status as 'Scheduled' | 'Completed']}
                </p>
                <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[75%]"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('collectionHistory')}
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('collectionsThisMonth')}
                </p>
                <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[90%]"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('currentPlan')}
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paymentInfo.plan}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('nextPayment')}: {paymentInfo.nextPayment}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <div>{t('amountDue')}:</div>
                  <div className="font-medium">{paymentInfo.amount}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('specialRequests')}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('urgentCollectionsThisMonth')}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <div>{t('usageLimit')}:</div>
                  <div className="font-medium">2/5</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>{t('recentCollections')}</CardTitle>
                <CardDescription>{t('recentCollectionHistory')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCollections.map((collection, index) => {
                    const statusKey = collection.status as 'Scheduled' | 'Completed';
                    return (
                      <div 
                        key={index} 
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <div className="font-medium">{collection.date}</div>
                            <div className="text-sm text-muted-foreground">
                              {t('collector')}: {collection.collector}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="inline-flex h-6 items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            {statusMap[statusKey]}
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4">
                  <Link href="/dashboard/user/history">
                    <Button variant="outline" className="w-full">
                      {t('viewAllCollectionHistory')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t('collectionSchedule')}</CardTitle>
                <CardDescription>{t('upcomingCollectionDates')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Monday', 'Wednesday', 'Friday'].map((day, index) => {
                    const dayKey = day as 'Monday' | 'Wednesday' | 'Friday';
                    return (
                      <div
                        key={day}
                        className="flex items-center gap-2 pb-4 border-b last:border-0 last:pb-0"
                      >
                        {/* <div className="h-10  rounded-md bg-primary/10 flex items-center justify-center font-medium">
                          {dayMap[dayKey]}
                        </div> */}
                        <div className="flex-1">
                          <div className="font-medium">{dayMap[dayKey]}</div>
                          <div className="text-sm text-muted-foreground">9:00 AM - 11:00 AM</div>
                        </div>
                        <div className="inline-flex h-6 items-center rounded-full border border-primary/30 bg-primary/10 px-2 text-xs font-medium text-primary">
                          {t('regular')}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4">
                  <Link href="/dashboard/user/schedule">
                    <Button variant="outline" className="w-full">
                      {t('viewFullSchedule')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="collections" className="space-y-4">
          <h2 className="text-xl font-semibold">{t('collectionHistory')}</h2>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <h2 className="text-xl font-semibold">{t('paymentInformation')}</h2>
        </TabsContent>
      </Tabs>
    </div>
  )
}