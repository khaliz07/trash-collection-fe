'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard
      if (user.role === 'user') {
        router.push('/dashboard/user')
      } else if (user.role === 'collector') {
        router.push('/dashboard/collector')
      } else if (user.role === 'admin') {
        router.push('/dashboard/admin')
      }
    }
  }, [isAuthenticated, user, router])

  if (isAuthenticated) {
    return null // Don't render auth forms if user is already authenticated
  }

  return <>{children}</>
}
