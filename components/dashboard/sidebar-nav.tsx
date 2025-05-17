"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DivideIcon as LucideIcon, Home, Calendar, CreditCard, Bell, Clock, Settings, LogOut, Users, BarChart, Map, FileText, Star, MessageSquare, Truck, CheckSquare } from "lucide-react"
import '../../i18n'
import { useTranslation } from 'react-i18next'

interface NavItem {
  title: string
  href: string
  icon: any
}

interface UserNavItems {
  user: NavItem[]
  collector: NavItem[]
  admin: NavItem[]
}

const navItems: UserNavItems = {
  user: [
    {
      title: "Dashboard",
      href: "/dashboard/user",
      icon: Home,
    },
    {
      title: "Collection Schedule",
      href: "/dashboard/user/schedule",
      icon: Calendar,
    },
    {
      title: "Request Collection",
      href: "/dashboard/user/request",
      icon: Clock,
    },
    {
      title: "Payments",
      href: "/dashboard/user/payments",
      icon: CreditCard,
    },
    {
      title: "Notifications",
      href: "/dashboard/user/notifications",
      icon: Bell,
    },
    {
      title: "Support",
      href: "/dashboard/user/support",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      href: "/dashboard/user/settings",
      icon: Settings,
    },
  ],
  collector: [
    {
      title: "Dashboard",
      href: "/dashboard/collector",
      icon: Home,
    },
    {
      title: "Today's Collections",
      href: "/dashboard/collector/today",
      icon: Truck,
    },
    {
      title: "Collection Map",
      href: "/dashboard/collector/map",
      icon: Map,
    },
    {
      title: "Check-in",
      href: "/dashboard/collector/checkin",
      icon: CheckSquare,
    },
    {
      title: "Urgent Requests",
      href: "/dashboard/collector/urgent",
      icon: Clock,
    },
    {
      title: "Performance",
      href: "/dashboard/collector/performance",
      icon: BarChart,
    },
    {
      title: "Notifications",
      href: "/dashboard/collector/notifications",
      icon: Bell,
    },
    {
      title: "Settings",
      href: "/dashboard/collector/settings",
      icon: Settings,
    },
  ],
  admin: [
    {
      title: "Dashboard",
      href: "/dashboard/admin",
      icon: Home,
    },
    {
      title: "Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Collectors",
      href: "/dashboard/admin/collectors",
      icon: Truck,
    },
    {
      title: "Schedules",
      href: "/dashboard/admin/schedules",
      icon: Calendar,
    },
    {
      title: "Payments",
      href: "/dashboard/admin/payments",
      icon: CreditCard,
    },
    {
      title: "Reports",
      href: "/dashboard/admin/reports",
      icon: BarChart,
    },
    {
      title: "Feedback",
      href: "/dashboard/admin/feedback",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
    },
  ],
}

interface SidebarNavProps {
  role: "user" | "collector" | "admin"
}

export function SidebarNav({ role }: SidebarNavProps) {
  const { t } = useTranslation('common')
  const pathname = usePathname()
  const items = navItems[role]

  return (
    <ScrollArea className="h-full py-6">
      <div className="flex flex-col h-full justify-between">
        <div className="px-3 py-2">

          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors",
                  pathname === item.href ? "bg-accent" : "transparent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {t(item.title)}
              </Link>
            ))}
          </div>
        </div>
        <div className="px-3 py-2 mt-auto">
          <Link href="/login">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              {t('logout')}
            </Button>
          </Link>
        </div>
      </div>
    </ScrollArea>
  )
}