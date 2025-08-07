import axios from 'axios'
import { useAuthStore } from '@/hooks/use-auth'

// Create axios instance
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

// Auth API functions
export const authAPI = {
  login: async (data: { email: string; password: string; role: string }) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },
  
  register: async (data: { 
    name: string
    email: string
    phone: string
    address: string
    password: string
  }) => {
    // Split name into firstName and lastName for backend
    const nameParts = data.name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    const registerData = {
      ...data,
      firstName,
      lastName,
    }
    
    const response = await api.post('/auth/register', registerData)
    return response.data
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },
  
  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  }
}

export default api
