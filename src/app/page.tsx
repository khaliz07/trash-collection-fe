"use client"

import { CallToAction } from '@/components/landing/call-to-action';
import { FeatureSection } from '@/components/landing/feature-section';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { SiteFooter } from '@/components/landing/site-footer';
import { SiteHeader } from '@/components/landing/site-header';
import { Testimonials } from '@/components/landing/testimonials';
import { ClientOnly } from '@/components/client-only';

export default function Home() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <HeroSection />
          <FeatureSection />
          <HowItWorks />
          <Testimonials />
          <CallToAction />
        </main>
        <SiteFooter />
      </div>
    </ClientOnly>
  );
}