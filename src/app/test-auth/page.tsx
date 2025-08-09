'use client'

import { useAuth } from '@/hooks/use-auth'
import { useMe } from '@/hooks/use-auth-mutations'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

export default function TestAuthPage() {
  const { user, token, isAuthenticated, login, logout, initializeAuth } = useAuth()
  const { data: meData, isError, isLoading } = useMe()
  const [cookieToken, setCookieToken] = useState<string | undefined>()

  useEffect(() => {
    // Check cookie token
    const tokenFromCookie = Cookies.get('auth-token')
    setCookieToken(tokenFromCookie)
    console.log('Cookie token:', tokenFromCookie)
  }, [])

  const handleLoginTest = () => {
    // Use the token from our test registration
    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWU0NHZmNDQwMDAwcXF4N2RzM3M2Mm10IiwiZW1haWwiOiJ0ZXN0dXNlcjEyM0BleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzU0NzM2NjExLCJleHAiOjE3NTQ4MjMwMTF9.shIotw4HOr5EAZ4x2JYv0eQdltdVW7X0sGc-rfl8KBU"
    const testUser = {
      id: "cme44vf440000qqx7ds3s62mt",
      email: "testuser123@example.com",
      name: "Test User",
      role: "USER" as const,
      phone: "0123456789"
    }
    
    login(testToken, testUser)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Auth State</h2>
          <div>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
          <div>Has Token: {token ? 'Yes' : 'No'}</div>
          <div>Has User: {user ? 'Yes' : 'No'}</div>
          {user && (
            <div className="mt-2">
              <div>User ID: {user.id}</div>
              <div>Email: {user.email}</div>
              <div>Name: {user.name}</div>
              <div>Role: {user.role}</div>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Cookie Token</h2>
          <div>Cookie Token: {cookieToken ? 'Exists' : 'Missing'}</div>
          {cookieToken && (
            <div className="text-xs mt-1 break-all">
              {cookieToken.substring(0, 50)}...
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Me API Data</h2>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Error: {isError ? 'Yes' : 'No'}</div>
          <div>Has Data: {meData ? 'Yes' : 'No'}</div>
          {meData && (
            <div className="mt-2">
              <pre className="text-xs">{JSON.stringify(meData, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="space-x-4">
          <button 
            onClick={initializeAuth}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Initialize Auth
          </button>
          
          <button 
            onClick={handleLoginTest}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Test Login
          </button>
          
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
