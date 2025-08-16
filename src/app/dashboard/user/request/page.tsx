"use client"

import { useState } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { AlertTriangle, List } from "lucide-react"
import CreateUrgentRequestForm from '@/components/dashboard/user/create-urgent-request-form'
import UrgentRequestsList from '@/components/dashboard/user/urgent-requests-list'

export default function RequestPage() {
  const [activeTab, setActiveTab] = useState("create")

  // Handle successful request creation
  const handleRequestCreated = () => {
    // Switch to list tab to show the new request
    setActiveTab("list")
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Yêu cầu thu gom khẩn cấp</h2>
        <p className="text-muted-foreground">Gửi yêu cầu thu gom rác thải khẩn cấp ngoài lịch định kỳ</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Tạo yêu cầu
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Danh sách yêu cầu
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-6">
          <CreateUrgentRequestForm onSuccess={handleRequestCreated} />
        </TabsContent>
        
        <TabsContent value="list" className="mt-6">
          <UrgentRequestsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}