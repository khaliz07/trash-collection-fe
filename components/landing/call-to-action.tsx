import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CallToAction() {
  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-4 lg:col-span-1">
            <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm font-medium">
              <span className="text-primary mr-1">💰</span>
              <span>Pricing Plans</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground">
              Choose the plan that works best for your household. All plans include access to our core features.
            </p>
          </div>
          
          <div className="grid gap-6 lg:col-span-2 lg:grid-cols-2">
            <div className="flex flex-col justify-between rounded-xl bg-background border shadow-sm p-6">
              <div>
                <div className="text-lg font-medium">Monthly</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$19</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Billed monthly</div>
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
                    <span>Weekly waste collection</span>
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
                    <span>Real-time tracking</span>
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
                    <span>In-app support</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <Link href="/register">
                  <Button className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col justify-between rounded-xl bg-background border border-primary shadow-sm p-6 relative overflow-hidden">
              <div className="absolute -right-12 -top-3 bg-primary text-white px-8 py-1 rotate-45 text-xs font-medium">
                Popular
              </div>
              <div>
                <div className="text-lg font-medium">Yearly</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$180</span>
                  <span className="text-muted-foreground">/year</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Billed annually (Save $48)
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
                    <span>Everything in Monthly</span>
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
                    <span>1 free urgent collection</span>
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
                    <span>Priority support</span>
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
                    <span>Detailed waste analytics</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <Link href="/register">
                  <Button className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 md:mt-24 rounded-xl border bg-background/50 backdrop-blur-sm p-6 md:p-10 text-center">
          <div className="mx-auto max-w-[600px] space-y-4">
            <h3 className="text-2xl font-bold tracking-tight">
              Ready to transform your waste management experience?
            </h3>
            <p className="text-muted-foreground">
              Join thousands of households already using EcoCollect for efficient, stress-free waste management.
            </p>
            <div className="pt-4">
              <Link href="/register">
                <Button size="lg" className="group">
                  Get Started Now
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