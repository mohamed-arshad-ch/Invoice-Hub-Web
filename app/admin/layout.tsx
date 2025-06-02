"use client"

import type React from "react"
import BottomNavigation from "@/components/admin/bottom-navigation"
import { usePathname } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/redux/store"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, router, isClient])

  // Show loading during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white font-poppins">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white font-poppins">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Hide bottom navigation on login page if it's somehow rendered within this layout
  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 font-poppins text-slate-50">
      <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">{children}</main>
      <BottomNavigation />
    </div>
  )
}
