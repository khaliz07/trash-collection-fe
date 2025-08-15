"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, User, FileText, Save, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
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
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/hooks/use-toast"
import { 
  RouteAssignment, 
  AssignmentStatus, 
  UpdateRouteAssignmentRequest,
  getAssignmentStatusText,
  getStatusProgress,
  getStatusBadgeVariant
} from "@/types/route-assignment"

const updateFormSchema = z.object({
  status: z.nativeEnum(AssignmentStatus),
  time_window_start: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
  time_window_end: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  actual_distance: z.number().optional(),
  actual_duration: z.number().optional(),
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

interface AssignmentDetailsDialogProps {
  assignment: RouteAssignment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  routes: Route[]
  collectors: Collector[]
  onAssignmentUpdated: () => void
  onAssignmentDeleted: () => void
}

export function AssignmentDetailsDialog({ 
  assignment,
  open, 
  onOpenChange,
  routes,
  collectors,
  onAssignmentUpdated,
  onAssignmentDeleted
}: AssignmentDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
  })

  // Reset form when assignment changes
  useEffect(() => {
    if (assignment) {
      form.reset({
        status: assignment.status,
        time_window_start: assignment.time_window_start,
        time_window_end: assignment.time_window_end,
        started_at: assignment.started_at || "",
        completed_at: assignment.completed_at || "",
        actual_distance: assignment.actual_distance || undefined,
        actual_duration: assignment.actual_duration || undefined,
        notes: assignment.notes || "",
      })
      setIsEditing(false)
    }
  }, [assignment, form])

  const onSubmit = async (values: z.infer<typeof updateFormSchema>) => {
    if (!assignment) return

    setIsSubmitting(true)
    try {
      const updateData: UpdateRouteAssignmentRequest & { id: string } = {
        id: assignment.id,
        ...values,
        // Convert empty strings to null for optional datetime fields
        started_at: values.started_at || undefined,
        completed_at: values.completed_at || undefined,
      }

      const response = await fetch('/api/admin/assignments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Không thể cập nhật phân công')
      }

      toast({
        title: "Thành công",
        description: "Phân công đã được cập nhật thành công",
      })

      setIsEditing(false)
      onAssignmentUpdated()
    } catch (error) {
      console.error('Failed to update assignment:', error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật phân công",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!assignment) return

    // Only allow deletion if status is PENDING
    if (assignment.status !== AssignmentStatus.PENDING) {
      toast({
        title: "Không thể xóa",
        description: "Chỉ có thể xóa lịch trình ở trạng thái CHUẨN BỊ",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/assignments?id=${assignment.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể xóa phân công')
      }

      toast({
        title: "Thành công",
        description: "Phân công đã được xóa thành công",
      })

      onOpenChange(false)
      onAssignmentDeleted()
    } catch (error) {
      console.error('Failed to delete assignment:', error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa phân công",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "Chưa có"
    return new Date(dateString).toLocaleString("vi-VN")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  if (!assignment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chi tiết phân công
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết và trạng thái thực hiện của phân công tuyến đường
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Overview */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">TUYẾN ĐƯỜNG</h4>
              <p className="font-medium">{assignment.route.name}</p>
              <p className="text-sm text-muted-foreground">
                {assignment.route.estimated_duration} phút • {assignment.route.total_distance_km} km
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">NHÂN VIÊN THU GOM</h4>
              <p className="font-medium">{assignment.collector.name}</p>
              <p className="text-sm text-muted-foreground">
                {assignment.collector.phone} • {assignment.collector.licensePlate || 'Chưa có biển số'}
              </p>
            </div>
          </div>

          {/* Status and Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Trạng thái hiện tại</h4>
              <Badge variant={getStatusBadgeVariant(assignment.status)}>
                {getAssignmentStatusText(assignment.status)}
              </Badge>
            </div>
            <Progress value={getStatusProgress(assignment.status)} className="w-full" />
          </div>

          {/* Schedule Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                NGÀY THỰC HIỆN
              </div>
              <p className="font-medium">{formatDate(assignment.assigned_date)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                GIỜ BẮT ĐẦU
              </div>
              <p className="font-medium">{assignment.time_window_start}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                GIỜ KẾT THÚC
              </div>
              <p className="font-medium">{assignment.time_window_end}</p>
            </div>
          </div>

          {/* Execution Details */}
          <div className="space-y-4">
            <h4 className="font-semibold">Thông tin thực hiện</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Thời gian bắt đầu:</span>
                <p className="font-medium">{formatDateTime(assignment.started_at)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Thời gian hoàn thành:</span>
                <p className="font-medium">{formatDateTime(assignment.completed_at)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Khoảng cách thực tế:</span>
                <p className="font-medium">
                  {assignment.actual_distance ? `${assignment.actual_distance} km` : "Chưa có"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Thời gian thực tế:</span>
                <p className="font-medium">
                  {assignment.actual_duration ? `${assignment.actual_duration} phút` : "Chưa có"}
                </p>
              </div>
            </div>
            {assignment.notes && (
              <div>
                <span className="text-sm text-muted-foreground">Ghi chú:</span>
                <p className="font-medium">{assignment.notes}</p>
              </div>
            )}
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-4">Cập nhật thông tin</h4>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
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

                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="started_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thời gian bắt đầu thực tế</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="completed_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thời gian hoàn thành</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="actual_distance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Khoảng cách thực tế (km)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="actual_duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thời gian thực tế (phút)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Thêm ghi chú cập nhật..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>

        <DialogFooter>
          {!isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={assignment.status !== AssignmentStatus.PENDING || isDeleting}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
