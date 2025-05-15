import { Bell, Search } from "lucide-react"
import { UserNav } from "@/components/dashboard/user-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"

interface DashboardHeaderProps {
  title: string
  userInfo: {
    name: string
    email: string
  }
}

export function DashboardHeader({ title, userInfo }: DashboardHeaderProps) {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="hidden md:block font-semibold text-lg">{title}</div>
        <div className="ml-auto flex items-center space-x-4">
          <div className="hidden md:flex relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8" />
          </div>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              3
            </span>
          </Button>
          <ModeToggle />
          <UserNav name={userInfo.name} email={userInfo.email} />
        </div>
      </div>
    </div>
  )
}