"use client"

import Link from 'next/link'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Recycle as Recycling, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRegister } from '@/hooks/use-auth-mutations'
import { RedirectIfAuthenticated } from '@/components/auth/redirect-if-authenticated'

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Please enter your full address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

export default function RegisterPage() {
  const { t } = useTranslation('common')
  const registerMutation = useRegister()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
      terms: false
    },
  })
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Remove confirmPassword before sending to API
    const { confirmPassword, terms, ...registerData } = values
    registerMutation.mutate(registerData)
  }
  
  return (
    <RedirectIfAuthenticated>
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('register.back_to_home', 'Quay lại trang chủ')}
          </Link>
        </div>
        
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Recycling className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">{t('register.title', 'Tạo tài khoản mới')}</CardTitle>
            <CardDescription className="text-center">
              {t('register.description', 'Nhập thông tin để tạo tài khoản hộ gia đình')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('register.full_name', 'Họ và tên')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('register.full_name_placeholder', 'Nguyễn Văn A')} 
                          {...field} 
                        />
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
                      <FormLabel>{t('register.email', 'Email')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('register.email_placeholder', 'an.nguyen@example.com')} 
                          type="email" 
                          {...field} 
                        />
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
                      <FormLabel>{t('register.phone', 'Số điện thoại')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('register.phone_placeholder', '+84 912 345 678')} 
                          type="tel" 
                          {...field} 
                        />
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
                      <FormLabel>{t('register.address', 'Địa chỉ')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('register.address_placeholder', '12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh')} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('register.password', 'Mật khẩu')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('register.password_placeholder', 'Tạo mật khẩu')} 
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('register.confirm_password', 'Xác nhận mật khẩu')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('register.confirm_password_placeholder', 'Nhập lại mật khẩu')} 
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          {t('register.agree', 'Tôi đồng ý với ')}
                          <Link 
                            href="/terms" 
                            className="text-primary hover:underline"
                          >
                            {t('register.terms_of_service', 'điều khoản dịch vụ')}
                          </Link>
                          {t('register.and', ' và ')}
                          <Link 
                            href="/privacy" 
                            className="text-primary hover:underline"
                          >
                            {t('register.privacy_policy', 'chính sách bảo mật')}
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? t('register.creating', 'Đang tạo tài khoản...') : t('register.create', 'Tạo tài khoản')}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              {t('register.already_have_account', 'Đã có tài khoản?')}
              {" "}
              <Link 
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                {t('register.sign_in', 'Đăng nhập')}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
    </RedirectIfAuthenticated>
  )
}