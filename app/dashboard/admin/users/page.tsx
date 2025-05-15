"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Ban,
  UserX,
  CheckCircle
} from "lucide-react"
import { AddUserDialog } from "@/components/dashboard/add-user-dialog"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Mock user data
  const users = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+1 (555) 123-4567",
      address: "123 Oak Street, Springfield",
      joinDate: "Apr 15, 2025",
      status: "active",
      plan: "Monthly"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@example.com",
      phone: "+1 (555) 234-5678",
      address: "456 Maple Ave, Riverside",
      joinDate: "Apr 12, 2025",
      status: "active",
      plan: "Yearly"
    },
    {
      id: 3,
      name: "Emily Wilson",
      email: "emily.w@example.com",
      phone: "+1 (555) 345-6789",
      address: "789 Pine Road, Lakeside",
      joinDate: "Apr 10, 2025",
      status: "suspended",
      plan: "Monthly"
    },
    {
      id: 4,
      name: "James Martinez",
      email: "j.martinez@example.com",
      phone: "+1 (555) 456-7890",
      address: "321 Cedar Lane, Hillside",
      joinDate: "Apr 8, 2025",
      status: "active",
      plan: "Quarterly"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      email: "lisa.t@example.com",
      phone: "+1 (555) 567-8901",
      address: "654 Birch Street, Mountain View",
      joinDate: "Apr 5, 2025",
      status: "inactive",
      plan: "Monthly"
    }
  ]
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery) ||
    user.address.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-emerald-600 dark:text-emerald-400"
      case "suspended":
        return "text-amber-600 dark:text-amber-400"
      case "inactive":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-muted-foreground"
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage household user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddUserDialog />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all registered household users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              Filter
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {String(user.id).padStart(5, '0')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-1 h-3 w-3" />
                        {user.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {user.joinDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center text-sm capitalize ${getStatusColor(user.status)}`}>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {user.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.plan}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Account
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <UserX className="mr-2 h-4 w-4" />
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}