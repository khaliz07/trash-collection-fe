"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Recycle as Recycling, Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTranslation } from 'react-i18next'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation('common')
  const pathname = usePathname()
  const [role, setRole] = useState<"user" | "collector" | "admin">("user")
  const [title, setTitle] = useState(t('dashboard'))
  const [mounted, setMounted] = useState(false)
  
  // Set role based on URL path
  useEffect(() => {
    if (pathname.includes("/dashboard/user")) {
      setRole("user")
    } else if (pathname.includes("/dashboard/collector")) {
      setRole("collector")
    } else if (pathname.includes("/dashboard/admin")) {
      setRole("admin")
    }
    
    // Set title based on the current path
    const path = pathname.split("/").pop()
    if (path && path !== role) {
      setTitle(t(path))
    } else {
      setTitle(t('dashboard'))
    }
    
    setMounted(true)
  }, [pathname, t, role])
  
  // Get user info based on role
  const getUserInfo = () => {
    switch (role) {
      case "user":
        return { name: "John Doe", email: "john@example.com" }
      case "collector":
        return { name: "Michael Torres", email: "michael@ecocollect.com" }
      case "admin":
        return { name: "Admin User", email: "admin@ecocollect.com" }
    }
  }
  
  if (!mounted) return null
  
  return (
    <div className="flex min-h-screen flex-col">
      <div className="md:hidden border-b">
        <div className="flex h-16 items-center px-4 justify-between">
          <Link href="/" className="flex items-center space-x-2 font-bold">
            <Recycling className="h-6 w-6 text-primary" />
            <span>{t('ecocollect')}</span>
          </Link>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="border-b px-4 py-3">
                <Link href="/" className="flex items-center space-x-2 font-bold">
                  <Recycling className="h-6 w-6 text-primary" />
                  <span>{t('ecocollect')}</span>
                </Link>
              </div>
              <SidebarNav role={role} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <div className="flex-1 md:grid md:grid-cols-[240px_1fr]">
        <div className="hidden md:block border-r bg-muted/40">
          <div className="flex h-16 items-center px-4 border-b">
            <Link href="/" className="flex items-center space-x-2 font-bold">
              <Recycling className="h-6 w-6 text-primary" />
              <span>{t('ecocollect')}</span>
            </Link>
          </div>
          <SidebarNav role={role} />
        </div>
        
        <div className="flex flex-col">
          <DashboardHeader title={title} userInfo={getUserInfo()} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}