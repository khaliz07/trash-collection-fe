'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'USER' | 'COLLECTOR' | 'ADMIN'
  redirectTo?: string
}

export function AuthGuard({ children, requiredRole, redirectTo = '/login' }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requiredRole && user?.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user's actual role
      if (user?.role === 'USER') {
        router.push('/dashboard/user')
      } else if (user?.role === 'COLLECTOR') {
        router.push('/dashboard/collector')
      } else if (user?.role === 'ADMIN') {
        router.push('/dashboard/admin')
      }
      return
    }
  }, [isAuthenticated, user, requiredRole, router, redirectTo])

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null // or loading spinner
  }

  return <>{children}</>
}

// Higher order component version
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'USER' | 'COLLECTOR' | 'ADMIN'
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard requiredRole={requiredRole}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
