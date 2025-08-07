"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  type: z.enum(["urgent", "special", "regular"]),
  date: z.date({
    required_error: "Please select a date for collection",
  }),
  notes: z.string().min(10, {
    message: "Notes must be at least 10 characters",
  }).max(500, {
    message: "Notes cannot exceed 500 characters",
  }),
})

export default function RequestPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "regular",
      notes: "",
    },
  })
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    // Simulating request submission
    setTimeout(() => {
      setIsLoading(false)
      router.push('/dashboard/user')
    }, 1500)
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('requestCollection')}</h2>
        <p className="text-muted-foreground">{t('submitRequestDescription')}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('collectionRequestForm')}</CardTitle>
          <CardDescription>{t('fillRequestDetails')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('requestType')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectRequestType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="regular">{t('regularCollection')}</SelectItem>
                        <SelectItem value="urgent">{t('urgentCollection')}</SelectItem>
                        <SelectItem value="special">{t('specialWaste')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>{t('chooseCollectionType')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('collectionDate')}</FormLabel>
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
                              <span>{t('pickADate')}</span>
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
                    <FormDescription>{t('selectPreferredDate')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('additionalNotes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('specialInstructionsPlaceholder')}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('provideDetails')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('submitting') : t('submitRequest')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}