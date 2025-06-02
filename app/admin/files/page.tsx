"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link" // Make sure Link is imported
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, UserCheck, Package, ArrowRight, RefreshCw } from "lucide-react"

// Helper function to format numbers with commas
const formatCount = (count: number): string => {
  return count.toLocaleString()
}

interface ManagementCardProps {
  title: string
  description: string
  count: number | string
  Icon: React.ElementType
  iconColor: string
  buttonText: string
  href: string
  accentColor: string // For gradient or border
  isLoading: boolean
}

const ManagementCard: React.FC<ManagementCardProps> = ({
  title,
  description,
  count,
  Icon,
  iconColor,
  buttonText,
  href,
  accentColor,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-800/60 backdrop-blur-md border-slate-700 shadow-custom rounded-lg p-6 flex flex-col items-center text-center">
        <Skeleton className="h-16 w-16 rounded-full mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-1" />
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-10 w-full rounded-md" />
      </Card>
    )
  }

  return (
    <Card
      className="bg-slate-800/60 backdrop-blur-md border-slate-700 shadow-custom rounded-lg p-6 flex flex-col items-center text-center hover:scale-105 hover:shadow-xl transition-all duration-300 group"
      style={{ "--accent-color": accentColor } as React.CSSProperties}
    >
      <div className="relative mb-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-color)] to-transparent opacity-20 group-hover:opacity-50 blur-lg rounded-full transition-opacity duration-300"></div>
        <Icon className={`h-16 w-16 mb-0 p-3 rounded-full bg-slate-700/50 relative z-10 ${iconColor}`} />
      </div>
      <CardTitle className="text-xl font-semibold text-slate-100 mb-1 font-poppins">{title}</CardTitle>
      <CardDescription className="text-sm text-slate-400 mb-1 font-poppins">{description}</CardDescription>
      <p className="text-3xl font-bold text-slate-50 mb-4 font-poppins">{formatCount(Number(count))}</p>
      <Button
        asChild // This is important for Link to work correctly with Button
        className="w-full mt-auto font-poppins text-white transition-all duration-300"
        style={{ backgroundColor: accentColor }}
        onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
        onMouseOut={(e) => (e.currentTarget.style.filter = "brightness(1)")}
      >
        <Link href={href}>
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </Card>
  )
}

interface StatsData {
  clients: number
  staff: number
  products: number
}

export default function FilesManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [counts, setCounts] = useState<StatsData>({
    clients: 0,
    staff: 0,
    products: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      
      const data = await response.json()
      setCounts(data.stats)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Failed to load statistics')
      // Set fallback counts on error
      setCounts({
        clients: 0,
        staff: 0,
        products: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    fetchStats()
  }

  const managementSections = [
    {
      title: "Clients Management",
      description: "Oversee all client accounts and details.",
      count: counts.clients,
      Icon: Users,
      iconColor: "text-blue-400",
      buttonText: "Manage Clients",
      href: "/admin/files/clients",
      accentColor: "#3A86FF", // Blue
    },
    {
      title: "Staff Management",
      description: "Administer staff profiles and permissions.",
      count: counts.staff,
      Icon: UserCheck,
      iconColor: "text-green-400",
      buttonText: "Manage Staff",
      href: "/admin/files/staff",
      accentColor: "#10B981", // Green
    },
    {
      title: "Products Management",
      description: "Manage your product catalog and inventory.",
      count: counts.products,
      Icon: Package,
      iconColor: "text-purple-400",
      buttonText: "Manage Products",
      href: "/admin/files/products", // Corrected href
      accentColor: "#8338EC", // Purple
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 font-poppins">Files Management</h1>
          <p className="text-slate-400 font-poppins">Select a category to manage its files and data.</p>
          {lastUpdated && !isLoading && (
            <p className="text-slate-500 text-xs mt-1 font-poppins">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          {error && (
            <p className="text-red-400 text-sm mt-2 font-poppins">⚠️ {error}</p>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700 self-start"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managementSections.map((section) => (
          <ManagementCard key={section.title} {...section} isLoading={isLoading} />
        ))}
      </section>
    </div>
  )
}
