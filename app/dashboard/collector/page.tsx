'use client'

import { mockCollectionPoints } from "@/components/dashboard/collection/mockCollectionPoints"
import { CollectionPointList } from "@/components/dashboard/collection/today/CollectionPointList"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { CollectionStatus } from "@/types/collection"
import {
  ArrowRight,
  BarChart,
  Clock,
  MapPin,
  Truck
} from "lucide-react"
import Link from "next/link"
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function CollectorDashboard() {
  const { t } = useTranslation()
  // State quản lý collection points
  const [points, setPoints] = useState(mockCollectionPoints)

  const todaysCollections = {
    total: points.length,
    completed: points.filter(cp => cp.status === CollectionStatus.COMPLETED).length,
    pending: points.filter(cp => cp.status === CollectionStatus.PENDING).length
  }
  
  const handleCheckIn = (id: string) => {
    setPoints(prev => prev.map(cp =>
      cp.id === id ? { ...cp, status: CollectionStatus.IN_PROGRESS, checkInTime: new Date().toLocaleTimeString() } : cp
    ))
  }
  
  const handleUpdateStatus = (id: string, status: CollectionStatus) => {
    setPoints(prev => prev.map(cp =>
      cp.id === id ? { ...cp, status } : cp
    ))
  }
  
  const handleOpenMap = (id: string) => {
    const point = points.find(cp => cp.id === id)
    if (point) {
      const url = `https://www.google.com/maps/search/?api=1&query=${point.location.lat},${point.location.lng}`
      window.open(url, '_blank')
    }
  }
  
  const handleUploadPhoto = (id: string) => {
    alert(t('collector_dashboard.alerts.photo_upload', { id }))
  }
  
  const handleAddNote = (id: string) => {
    alert(t('collector_dashboard.alerts.add_note', { id }))
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('collector_dashboard.welcome_back')}</h2>
          <p className="text-muted-foreground">
            {t('collector_dashboard.overview_description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/collector/map">
            <Button>
              {t('collector_dashboard.view_route_map')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">{t('collector_dashboard.tabs.today')}</TabsTrigger>
          <TabsTrigger value="performance">{t('collector_dashboard.tabs.performance')}</TabsTrigger>
          <TabsTrigger value="urgent">{t('collector_dashboard.tabs.urgent')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('collector_dashboard.stats.todays_collections.title')}
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todaysCollections.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('collector_dashboard.stats.todays_collections.description')}
                </p>
                <div className="mt-4">
                  {/* <Progress value={(todaysCollections.completed / todaysCollections.total) * 100} className="h-2" /> */}
                </div>
                <div className="mt-1 text-xs flex justify-between">
                  <div>{todaysCollections.completed} {t('collector_dashboard.stats.todays_collections.completed')}</div>
                  <div>{todaysCollections.pending} {t('collector_dashboard.stats.todays_collections.remaining')}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('collector_dashboard.stats.route_progress.title')}
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">53%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('collector_dashboard.stats.route_progress.description')}
                </p>
                <div className="mt-4">
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-[53%]"></div>
                  </div>
                </div>
                <div className="mt-2 text-xs">
                  {t('collector_dashboard.stats.route_progress.est_completion')}: 2:30 PM
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('collector_dashboard.stats.efficiency_rate.title')}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('collector_dashboard.stats.efficiency_rate.description')}: 11 min
                </p>
                <div className="mt-4">
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[94%]"></div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  +5% {t('collector_dashboard.stats.efficiency_rate.from_last_week')}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('collector_dashboard.stats.urgent_requests.title')}
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('collector_dashboard.stats.urgent_requests.description')}
                </p>
                <Link href="/dashboard/collector/urgent" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">
                    {t('collector_dashboard.stats.urgent_requests.view_requests')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('collector_dashboard.collection_points.title')}</CardTitle>
              <CardDescription>{t('collector_dashboard.collection_points.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <CollectionPointList
                points={points}
                onCheckIn={handleCheckIn}
                onUpdateStatus={handleUpdateStatus}
                onOpenMap={handleOpenMap}
                onUploadPhoto={handleUploadPhoto}
                onAddNote={handleAddNote}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>{t('collector_dashboard.performance_analytics.title')}</CardTitle>
              <CardDescription>{t('collector_dashboard.performance_analytics.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t('collector_dashboard.performance_analytics.content')}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="urgent">
          <Card>
            <CardHeader>
              <CardTitle>{t('collector_dashboard.urgent_requests.title')}</CardTitle>
              <CardDescription>{t('collector_dashboard.urgent_requests.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t('collector_dashboard.urgent_requests.content')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}