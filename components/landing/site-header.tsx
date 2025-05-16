"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Recycle, Menu, X } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import '../../i18n'
import { useTranslation } from 'react-i18next'

export function SiteHeader() {
  const { t } = useTranslation('common')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 font-bold">
          <Recycle className="h-6 w-6 text-primary" />
          <span>{t('ecocollect')}</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('features')}
          </Link>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('how_it_works.menu_heading')}
          </Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('pricing')}
          </Link>
          <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('contact')}
          </Link>
        </nav>
        
        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          <Link href="/login">
            <Button variant="outline">{t('login.button')}</Button>
          </Link>
          <Link href="/register">
            <Button>{t('signup.button')}</Button>
          </Link>
        </div>
        
        <div className="md:hidden flex items-center gap-4">
          <ModeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="container py-4 grid gap-4">
            <Link 
              href="#features" 
              className="px-4 py-2 text-sm hover:bg-accent rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('features')}
            </Link>
            <Link 
              href="#how-it-works" 
              className="px-4 py-2 text-sm hover:bg-accent rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('how_it_works.menu_heading')}
            </Link>
            <Link 
              href="#pricing" 
              className="px-4 py-2 text-sm hover:bg-accent rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('pricing')}
            </Link>
            <Link 
              href="#contact" 
              className="px-4 py-2 text-sm hover:bg-accent rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('contact')}
            </Link>
            <div className="grid gap-2 pt-2 border-t">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">{t('login')}</Button>
              </Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">{t('signup')}</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}