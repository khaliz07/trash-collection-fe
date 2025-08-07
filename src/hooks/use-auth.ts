import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'collector' | 'admin'
  phone?: string
  address?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token: string, user: User) => {
        Cookies.set('auth-token', token, { expires: 7, secure: true, sameSite: 'strict' })
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        Cookies.remove('auth-token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Hook to check if user is authenticated
export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout } = useAuthStore()
  
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  }
}
