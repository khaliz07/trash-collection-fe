import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-70"></div>
      </div>
      
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
                <span>Sustainable Waste Management</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Smart Waste Collection for Modern Communities
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Schedule, track, and manage waste collection efficiently. Join thousands of households for a cleaner environment.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" className="group">
                  Get Started 
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted overflow-hidden"
                  >
                    <span className="font-medium">U{i}</span>
                  </div>
                ))}
              </div>
              <div>
                Trusted by <span className="font-medium text-foreground">2,000+</span> households
              </div>
            </div>
          </div>
          
          <div className="relative bg-gradient-to-b from-primary/20 to-muted p-4 rounded-2xl">
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-background/40 backdrop-blur-sm border shadow-xl">
              <div className="p-4 md:p-6 h-full flex flex-col">
                <div className="font-medium mb-2">Collection Schedule</div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {['Mon', 'Wed', 'Fri'].map((day) => (
                    <div key={day} className="p-2 rounded-md bg-accent/80 text-center text-sm">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-card p-3 mb-3 flex items-center">
                  <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Next Collection</div>
                    <div className="text-xs text-muted-foreground">Tomorrow, 9:00 AM</div>
                  </div>
                </div>
                <div className="rounded-lg bg-card p-3 flex items-center">
                  <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <div className="h-6 w-6 rounded-full bg-amber-500"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Special Collection</div>
                    <div className="text-xs text-muted-foreground">Requested for Saturday</div>
                  </div>
                </div>
                <div className="mt-auto pt-4 flex justify-end">
                  <div className="inline-flex h-8 items-center rounded-full border px-3 text-xs">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></div>
                    <span>Collection Status: Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}