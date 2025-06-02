"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserData } from '@/lib/storage'
import { getDashboardRoute } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      try {
        const userData = getUserData()
        
        if (userData && userData.role) {
          // User is logged in, redirect to appropriate dashboard
          const dashboardRoute = getDashboardRoute(userData.role)
          router.replace(dashboardRoute)
        } else {
          // User is not logged in, redirect to login
          router.replace('/login')
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        // On error, redirect to login for safety
        router.replace('/login')
      }
    }

    checkAuthAndRedirect()
  }, [router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-slate-300">Loading...</p>
      </div>
    </div>
  )
} 