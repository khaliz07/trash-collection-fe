'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useMe } from '@/hooks/use-auth-mutations'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { token, user, login, logout } = useAuth()
  const { data: meData, isError } = useMe()

  useEffect(() => {
    if (token && !user && meData?.user) {
      // If we have token but no user data, update with fresh data from server
      login(token, meData.user)
    }
    
    if (isError && token) {
      // If token is invalid, logout
      logout()
    }
  }, [token, user, meData, isError, login, logout])

  return <>{children}</>
}
