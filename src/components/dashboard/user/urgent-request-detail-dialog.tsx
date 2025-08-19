"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  MapPin,
  User,
  Phone,
  Clock,
  AlertTriangle,
  Edit,
  X,
} from "lucide-react";
import { UrgentRequestResponse } from "@/apis/urgent-requests.api";
import LocationPicker from "@/components/ui/location-picker";

const formSchema = z.object({
  requested_date: z.date({
    required_error: "Vui lòng chọn ngày thu gom",
  }),
  waste_description: z
    .string()
    .min(10, {
      message: "Mô tả phải có ít nhất 10 ký tự",
    })
    .max(500, {
      message: "Mô tả không được vượt quá 500 ký tự",
    }),
  pickup_address: z.string().min(5, {
    message: "Địa chỉ phải có ít nhất 5 ký tự",
  }),
  pickup_lat: z.number(),
  pickup_lng: z.number(),
});

interface UrgentRequestDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: UrgentRequestResponse | null;
  onUpdate?: (requestId: string, data: any) => void;
  onCancel?: (requestId: string) => void;
}

// Helper functions for display
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "PENDING":
      return "info";
    case "ASSIGNED":
      return "default";
    case "IN_PROGRESS":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Chờ xử lý";
    case "ASSIGNED":
      return "Đã phân công";
    case "IN_PROGRESS":
      return "Đang thu gom";
    case "COMPLETED":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
};

const getUrgencyBadgeVariant = (urgencyLevel: string) => {
  switch (urgencyLevel) {
    case "MEDIUM":
      return "info";
    case "HIGH":
      return "warning";
    case "CRITICAL":
      return "error";
    default:
      return "default";
  }
};

const getUrgencyText = (urgencyLevel: string) => {
  switch (urgencyLevel) {
    case "MEDIUM":
      return "Bình thường";
    case "HIGH":
      return "Khẩn cấp";
    case "CRITICAL":
      return "Rất khẩn cấp";
    default:
      return urgencyLevel;
  }
};

export default function UrgentRequestDetailDialog({
  isOpen,
  onClose,
  request,
  onUpdate,
  onCancel,
}: UrgentRequestDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: request
      ? {
          requested_date: new Date(request.requested_date),
          waste_description: request.waste_description,
          pickup_address: request.pickup_address,
          pickup_lat: request.pickup_lat || 0,
          pickup_lng: request.pickup_lng || 0,
        }
      : undefined,
  });

  // Reset form when request changes
  React.useEffect(() => {
    if (request) {
      form.reset({
        requested_date: new Date(request.requested_date),
        waste_description: request.waste_description,
        pickup_address: request.pickup_address,
        pickup_lat: request.pickup_lat || 0,
        pickup_lng: request.pickup_lng || 0,
      });
    }
  }, [request, form]);

  if (!request) return null;

  const canEdit = request.status === "PENDING";

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!onUpdate) return;

    setIsUpdating(true);
    try {
      await onUpdate(request.id, {
        requested_date: values.requested_date.toISOString(),
        waste_description: values.waste_description,
        pickup_address: values.pickup_address,
        pickup_lat: values.pickup_lat,
        pickup_lng: values.pickup_lng,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle cancel request
  const handleCancel = async () => {
    if (!onCancel) return;

    setIsCancelling(true);
    try {
      await onCancel(request.id);
      onClose();
    } catch (error) {
      console.error("Error cancelling request:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle location selection from picker
  const handleLocationSelect = (location: {
    address: string;
    lat: number;
    lng: number;
  }) => {
    form.setValue("pickup_address", location.address);
    form.setValue("pickup_lat", location.lat);
    form.setValue("pickup_lng", location.lng);
    setIsLocationPickerOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Yêu cầu thu gom #{request.id.slice(-8)}
              </span>
              <div className="flex gap-2">
                <Badge variant={getStatusBadgeVariant(request.status)}>
                  {getStatusText(request.status)}
                </Badge>
              </div>
            </DialogTitle>
            <DialogDescription>
              Xem chi tiết và chỉnh sửa yêu cầu thu gom khẩn cấp
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {!isEditing ? (
              // View Mode
              <div className="space-y-4">
                {/* Request Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Ngày tạo:</span>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Ngày mong muốn:</span>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(request.requested_date), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Địa chỉ thu gom</div>
                    <div className="text-sm text-muted-foreground">
                      {request.pickup_address}
                    </div>
                    {request.pickup_lat && request.pickup_lng && (
                      <div className="text-xs text-muted-foreground">
                        {request.pickup_lat.toFixed(6)},{" "}
                        {request.pickup_lng.toFixed(6)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Waste Description */}
                <div>
                  <div className="font-medium mb-1">Mô tả rác thải</div>
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {request.waste_description}
                  </div>
                </div>

                {/* Collector Info */}
                {request.collector && (
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Nhân viên thu gom</div>
                      <div className="text-sm text-muted-foreground">
                        {request.collector.name}
                      </div>
                      {request.collector.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {request.collector.phone}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Completion Date */}
                {request.completed_at && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Ngày hoàn thành</div>
                      <div className="text-sm text-muted-foreground">
                        {format(
                          new Date(request.completed_at),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Edit Mode
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="requested_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Ngày thu gom mong muốn</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Chọn ngày</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location Section */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pickup_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Địa chỉ thu gom</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Nhập địa chỉ chi tiết..."
                                {...field}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsLocationPickerOpen(true)}
                                className="flex items-center gap-2"
                              >
                                <MapPin className="h-4 w-4" />
                                Chọn trên bản đồ
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Display coordinates if available */}
                    {form.watch("pickup_lat") &&
                      form.watch("pickup_lng") &&
                      typeof form.watch("pickup_lat") === "number" &&
                      typeof form.watch("pickup_lng") === "number" && (
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Vĩ độ:</span>{" "}
                            {form.watch("pickup_lat").toFixed(6)}
                          </div>
                          <div>
                            <span className="font-medium">Kinh độ:</span>{" "}
                            {form.watch("pickup_lng").toFixed(6)}
                          </div>
                        </div>
                      )}
                  </div>

                  <FormField
                    control={form.control}
                    name="waste_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả rác thải</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Mô tả loại rác thải, số lượng ước tính, và các yêu cầu đặc biệt..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
          </div>

          <DialogFooter>
            {!isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Đóng
                </Button>
                {canEdit && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={isCancelling}
                    >
                      {isCancelling ? "Đang hủy..." : "Hủy yêu cầu"}
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Picker Dialog */}
      <LocationPicker
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={{
          address: form.watch("pickup_address"),
          lat: form.watch("pickup_lat"),
          lng: form.watch("pickup_lng"),
        }}
      />
    </>
  );
}
