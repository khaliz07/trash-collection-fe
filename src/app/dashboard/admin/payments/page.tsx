"use client";

import { PaymentsTabs } from "@/components/admin/payments/PaymentsTabs";
import { UserPaymentsTable } from "@/components/admin/payments/UserPaymentsTable";
import {
  mockCollectorPayments,
  mockCollectorPaymentDetails,
  mockPeriods,
} from "@/components/admin/payments/mockData";
import { useTranslation } from "react-i18next";
import * as Tabs from "@radix-ui/react-tabs";

export default function AdminPaymentsPage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col h-full w-full p-6">
      <h1 className="text-2xl font-bold mb-6">
        {t("admin_payments.title", "Quản lý thanh toán")}
      </h1>

      <Tabs.Root defaultValue="user" className="w-full">
        <Tabs.List className="flex gap-2 border-b border-gray-200 mb-4">
          <Tabs.Trigger
            value="collector"
            className="px-4 py-2 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary focus:outline-none"
          >
            {t("admin.payments.collectorTab", "Thanh toán nhân viên")}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="user"
            className="px-4 py-2 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary focus:outline-none"
          >
            {t("admin.payments.userTab", "Thanh toán hộ dân")}
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="collector">
          <PaymentsTabs
            collectorPayments={mockCollectorPayments}
            userPayments={[]}
            collectorPaymentDetails={mockCollectorPaymentDetails}
            userPaymentDetails={[]}
            periods={mockPeriods}
          />
        </Tabs.Content>
        <Tabs.Content value="user">
          <UserPaymentsTable />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
