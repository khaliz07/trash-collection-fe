'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'user' | 'collector' | 'admin'
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
      if (user?.role === 'user') {
        router.push('/dashboard/user')
      } else if (user?.role === 'collector') {
        router.push('/dashboard/collector')
      } else if (user?.role === 'admin') {
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
  requiredRole?: 'user' | 'collector' | 'admin'
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard requiredRole={requiredRole}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
