"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Package, Clock } from "lucide-react";
import AvailableUrgentRequestsList from "@/components/dashboard/collector/available-urgent-requests-list";
import AssignedUrgentRequestsList from "@/components/dashboard/collector/assigned-urgent-requests-list";

export default function CollectorUrgentRequestsPage() {
  return (
    <div className="container max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Yêu cầu thu gom khẩn cấp
        </h1>
        <p className="text-muted-foreground">
          Quản lý và xử lý các yêu cầu thu gom rác thải khẩn cấp
        </p>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Chưa nhận
          </TabsTrigger>
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Đã nhận
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Yêu cầu chưa nhận
              </CardTitle>
              <CardDescription>
                Danh sách các yêu cầu thu gom khẩn cấp đang chờ xử lý. Click vào
                từng yêu cầu để xem chi tiết và nhận công việc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvailableUrgentRequestsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Yêu cầu đã nhận
              </CardTitle>
              <CardDescription>
                Danh sách các yêu cầu thu gom mà bạn đã nhận. Click vào từng yêu
                cầu để xem chi tiết và cập nhật trạng thái.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssignedUrgentRequestsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
