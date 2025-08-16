"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateUrgentRequest } from "@/hooks/use-urgent-requests";
import { useAuth } from "@/hooks/use-auth";
import LocationPicker from "@/components/ui/location-picker";

const formSchema = z.object({
  urgency_level: z.enum(["MEDIUM", "HIGH", "CRITICAL"]),
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

interface CreateUrgentRequestFormProps {
  onSuccess?: () => void;
}

export default function CreateUrgentRequestForm({
  onSuccess,
}: CreateUrgentRequestFormProps) {
  const { user } = useAuth();
  const createUrgentRequestMutation = useCreateUrgentRequest();
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      urgency_level: "MEDIUM",
      waste_description: "",
      pickup_address: user?.address || "",
      pickup_lat: user?.latitude || 10.8231, // Default to Ho Chi Minh City
      pickup_lng: user?.longitude || 106.6297,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createUrgentRequestMutation.mutate(
      {
        urgency_level: values.urgency_level,
        requested_date: values.requested_date.toISOString(),
        waste_description: values.waste_description,
        pickup_address: values.pickup_address,
        pickup_lat: values.pickup_lat,
        pickup_lng: values.pickup_lng,
      },
      {
        onSuccess: () => {
          // Reset form
          form.reset({
            urgency_level: "MEDIUM",
            waste_description: "",
            pickup_address: user?.address || "",
            pickup_lat: user?.latitude || 10.8231,
            pickup_lng: user?.longitude || 106.6297,
          });

          // Call parent onSuccess callback
          onSuccess?.();
        },
      }
    );
  }

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
      <Card>
        <CardHeader>
          <CardTitle>Biểu mẫu yêu cầu thu gom</CardTitle>
          <CardDescription>
            Điền thông tin chi tiết về yêu cầu thu gom khẩn cấp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="urgency_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mức độ khẩn cấp</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mức độ khẩn cấp" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MEDIUM">Bình thường</SelectItem>
                        <SelectItem value="HIGH">Khẩn cấp</SelectItem>
                        <SelectItem value="CRITICAL">Rất khẩn cấp</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Chọn mức độ ưu tiên cho yêu cầu thu gom
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Chọn ngày mong muốn được thu gom
                    </FormDescription>
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
                      <FormDescription>
                        Nhập địa chỉ hoặc chọn vị trí chính xác trên bản đồ
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Display coordinates if available */}
                {form.watch("pickup_lat") && form.watch("pickup_lng") && (
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
                    <FormDescription>
                      Cung cấp thông tin chi tiết về rác thải cần thu gom (loại,
                      số lượng, ghi chú đặc biệt)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={createUrgentRequestMutation.isPending}
              >
                {createUrgentRequestMutation.isPending
                  ? "Đang gửi yêu cầu..."
                  : "Gửi yêu cầu thu gom"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

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
