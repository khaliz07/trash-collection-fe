import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '../../i18n'

export function CallToAction() {
  const { t } = useTranslation()
  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-4 lg:col-span-1">
            <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm font-medium">
              <span className="text-primary mr-1">💰</span>
              <span>{t('cta.pricingPlans')}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('cta.simplePricing')}
            </h2>
            <p className="text-muted-foreground">
              {t('cta.choosePlan')}
            </p>
          </div>
          
          <div className="grid gap-6 lg:col-span-2 lg:grid-cols-2">
            <div className="flex flex-col justify-between rounded-xl bg-background border shadow-sm p-6">
              <div>
                <div className="text-lg font-medium">{t('cta.monthly')}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$19</span>
                  <span className="text-muted-foreground">{t('cta.perMonth')}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{t('cta.billedMonthly')}</div>
                <ul className="mt-6 space-y-3 px-2">
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{t('cta.weeklyCollection')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{t('cta.realTimeTracking')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{t('cta.inAppSupport')}</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <Link href="/register">
                  <Button className="w-full">
                    {t('cta.getStarted')}
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col justify-between rounded-xl bg-background border border-primary shadow-sm p-6 relative overflow-hidden">
              <div className="absolute -right-12 -top-3 bg-primary text-white px-8 py-1 rotate-45 text-xs font-medium">
                {t('cta.popular')}
              </div>
              <div>
                <div className="text-lg font-medium">{t('cta.yearly')}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$180</span>
                  <span className="text-muted-foreground">{t('cta.perYear')}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t('cta.billedAnnually')}
                </div>
                <ul className="mt-6 space-y-3 px-2">
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{t('cta.everythingInMonthly')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{t('cta.freeUrgentCollection')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{t('cta.prioritySupport')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{t('cta.detailedAnalytics')}</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <Link href="/register">
                  <Button className="w-full">
                    {t('cta.getStarted')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 md:mt-24 rounded-xl border bg-background/50 backdrop-blur-sm p-6 md:p-10 text-center">
          <div className="mx-auto max-w-[600px] space-y-4">
            <h3 className="text-2xl font-bold tracking-tight">
              {t('cta.readyToTransform')}
            </h3>
            <p className="text-muted-foreground">
              {t('cta.joinThousands')}
            </p>
            <div className="pt-4">
              <Link href="/register">
                <Button size="lg" className="group">
                  {t('cta.getStartedNow')}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}