"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/hooks/use-toast"
import { CreateRouteAssignmentRequest, AssignmentStatus } from "@/types/route-assignment"

const formSchema = z.object({
  route_id: z.string().min(1, "Vui lòng chọn tuyến đường"),
  collector_id: z.string().min(1, "Vui lòng chọn nhân viên thu gom"),
  assigned_date: z.string().min(1, "Vui lòng chọn ngày"),
  time_window_start: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
  time_window_end: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
  status: z.nativeEnum(AssignmentStatus).optional(),
  notes: z.string().optional()
})

interface Route {
  id: string
  name: string
  description?: string
  estimated_duration: number
  total_distance_km?: string | number
}

interface Collector {
  id: string
  name: string
  email: string
  phone?: string
  licensePlate?: string
  rating: number
}

interface CreateAssignmentDialogProps {
  routes: Route[]
  collectors: Collector[]
  onAssignmentCreated: () => void
}

export function CreateAssignmentDialog({ 
  routes, 
  collectors, 
  onAssignmentCreated 
}: CreateAssignmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      route_id: "",
      collector_id: "",
      assigned_date: "",
      time_window_start: "",
      time_window_end: "",
      status: AssignmentStatus.PENDING,
      notes: ""
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Không thể tạo phân công')
      }

      toast({
        title: "Thành công",
        description: "Phân công tuyến đường đã được tạo thành công",
      })

      form.reset()
      setOpen(false)
      onAssignmentCreated()
    } catch (error) {
      console.error('Failed to create assignment:', error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo phân công",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedRoute = routes.find(route => route.id === form.watch("route_id"))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Tạo phân công mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo phân công tuyến đường</DialogTitle>
          <DialogDescription>
            Phân công nhân viên thu gom cho tuyến đường cụ thể
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="route_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tuyến đường</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tuyến đường" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {routes.map((route) => (
                          <SelectItem key={route.id} value={route.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{route.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {route.estimated_duration} phút • {route.total_distance_km} km
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collector_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhân viên thu gom</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhân viên" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {collectors.map((collector) => (
                          <SelectItem key={collector.id} value={collector.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{collector.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {collector.phone} • {collector.licensePlate || 'Chưa có biển số'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="assigned_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày thực hiện</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_window_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_window_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ kết thúc</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={AssignmentStatus.PENDING}>Chuẩn bị</SelectItem>
                      <SelectItem value={AssignmentStatus.IN_PROGRESS}>Đang thực hiện</SelectItem>
                      <SelectItem value={AssignmentStatus.COMPLETED}>Hoàn thành</SelectItem>
                      <SelectItem value={AssignmentStatus.CANCELLED}>Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Thêm ghi chú cho phân công này..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRoute && (
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Thông tin tuyến đường</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tên tuyến:</span>
                    <p className="font-medium">{selectedRoute.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thời gian dự kiến:</span>
                    <p className="font-medium">{selectedRoute.estimated_duration} phút</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Khoảng cách:</span>
                    <p className="font-medium">{selectedRoute.total_distance_km} km</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mô tả:</span>
                    <p className="font-medium">{selectedRoute.description || 'Không có mô tả'}</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang tạo..." : "Tạo phân công"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
