"use client";

import { useState } from "react";
import { ReportDashboard } from "@/components/admin/reports/ReportDashboard";
import { TrashWeightReports } from "@/components/admin/reports/TrashWeightReports";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminReportsPage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col h-full w-full p-6">
      <h1 className="text-2xl font-bold mb-6">
        {t("admin_reports.title", "Báo cáo & Thống kê")}
      </h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="trash-weight">
            Thống kê khối lượng rác
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ReportDashboard />
        </TabsContent>

        <TabsContent value="trash-weight" className="mt-6">
          <TrashWeightReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
