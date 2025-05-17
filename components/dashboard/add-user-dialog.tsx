"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Please enter a full address" }),
  plan: z.enum(["Monthly", "Quarterly", "Yearly"]),
})

export function AddUserDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation('common')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      plan: "Monthly",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Here we'll add the Supabase integration later
      console.log(values)
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('admin_users.add_dialog.open', 'Thêm người dùng mới')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('admin_users.add_dialog.title', 'Thêm người dùng mới')}</DialogTitle>
          <DialogDescription>
            {t('admin_users.add_dialog.desc', 'Tạo tài khoản hộ dân mới. Người dùng sẽ nhận email hướng dẫn đăng nhập.')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin_users.add_dialog.full_name', 'Họ và tên')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin_users.add_dialog.full_name_placeholder', 'Nguyễn Văn A')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin_users.add_dialog.email', 'Email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t('admin_users.add_dialog.email_placeholder', 'an.nguyen@example.com')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin_users.add_dialog.phone', 'Số điện thoại')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin_users.add_dialog.phone_placeholder', '+84 912 345 678')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin_users.add_dialog.address', 'Địa chỉ')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin_users.add_dialog.address_placeholder', '12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin_users.add_dialog.plan', 'Gói đăng ký')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin_users.add_dialog.plan_placeholder', 'Chọn gói')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Monthly">{t('user_plan.monthly', 'Hàng tháng')}</SelectItem>
                      <SelectItem value="Quarterly">{t('user_plan.quarterly', 'Hàng quý')}</SelectItem>
                      <SelectItem value="Yearly">{t('user_plan.yearly', 'Hàng năm')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('admin_users.add_dialog.creating', 'Đang tạo...') : t('admin_users.add_dialog.create', 'Tạo người dùng')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}