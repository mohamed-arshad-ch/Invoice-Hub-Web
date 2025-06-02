"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/redux/store"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, User, Users, DollarSign, PlusCircle, Settings, FileText } from "lucide-react"
import AdminHeader from "@/components/admin/header"

interface Activity {
  id: string
  description: string
  amount?: number
  user: string
  timestamp: Date
  status: "completed" | "pending" | "failed"
}

const mockActivities: Activity[] = [
  {
    id: "1",
    description: "Invoice #INV001 paid",
    amount: 250.0,
    user: "Client A",
    timestamp: new Date(Date.now() - 3600000 * 2),
    status: "completed",
  },
  {
    id: "2",
    description: "New staff member added",
    user: "Admin",
    timestamp: new Date(Date.now() - 3600000 * 5),
    status: "completed",
  },
  {
    id: "3",
    description: "Product 'XYZ Widget' updated",
    user: "Admin",
    timestamp: new Date(Date.now() - 3600000 * 8),
    status: "pending",
  },
  {
    id: "4",
    description: "Client B onboarding initiated",
    user: "Staff Member 1",
    timestamp: new Date(Date.now() - 3600000 * 12),
    status: "completed",
  },
  {
    id: "5",
    description: "Monthly report generated",
    user: "System",
    timestamp: new Date(Date.now() - 3600000 * 24),
    status: "failed",
  },
]

const getStatusBadgeVariant = (status: Activity["status"]): "success" | "warning" | "destructive" | "default" => {
  switch (status) {
    case "completed":
      return "success"
    case "pending":
      return "warning"
    case "failed":
      return "destructive"
    default:
      return "default"
  }
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useSelector((state: RootState) => state.auth)

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const statsCards = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      trend: "+20.1%",
      Icon: DollarSign,
      iconColor: "text-green-400",
      trendColor: "text-green-400",
    },
    { title: "Active Clients", value: "1,250", Icon: User, iconColor: "text-blue-400" },
    { title: "Total Staff", value: "78", Icon: Users, iconColor: "text-purple-400" },
  ]

  const quickActions = [
    { label: "New Invoice", Icon: PlusCircle, action: () => console.log("New Invoice") },
    { label: "Add Client", Icon: User, action: () => console.log("Add Client") },
    { label: "Manage Staff", Icon: Users, action: () => console.log("Manage Staff") },
    { label: "View Reports", Icon: FileText, action: () => console.log("View Reports") },
    { label: "Settings", Icon: Settings, action: () => console.log("Settings") },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AdminHeader />
      
      <main className="p-6 space-y-8 animate-fade-in">
        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card
                    key={index}
                    className="bg-slate-800/60 backdrop-blur-md border-slate-700 shadow-custom rounded-lg"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-5 w-3/5" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-4/5 mb-1" />
                      <Skeleton className="h-4 w-2/5" />
                    </CardContent>
                  </Card>
                ))
            : statsCards.map((stat) => (
                <Card
                  key={stat.title}
                  className="bg-slate-800/60 backdrop-blur-md border-slate-700 shadow-custom rounded-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300 font-poppins">{stat.title}</CardTitle>
                    <stat.Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-50 font-poppins">{stat.value}</div>
                    {stat.trend && (
                      <p className={`text-xs ${stat.trendColor} flex items-center font-poppins`}>
                        {stat.trend}
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <section className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-200 mb-4 font-poppins">Recent Activity</h2>
            <Card className="bg-slate-800/60 backdrop-blur-md border-slate-700 shadow-custom rounded-lg">
              <CardContent className="p-0">
                <ul className="divide-y divide-slate-700">
                  {isLoading
                    ? Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <li key={index} className="p-4">
                            <div className="flex justify-between items-center">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-5 w-1/4" />
                            </div>
                            <Skeleton className="h-4 w-1/2 mt-1" />
                          </li>
                        ))
                    : mockActivities.slice(0, 5).map((activity) => (
                        <li key={activity.id} className="p-4 hover:bg-slate-700/50 transition-colors duration-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-slate-200 font-poppins">{activity.description}</p>
                              <p className="text-xs text-slate-400 font-poppins">
                                By {activity.user} - {format(activity.timestamp, "MMM d, h:mm a")}
                              </p>
                            </div>
                            <Badge
                              variant={getStatusBadgeVariant(activity.status)}
                              className="text-xs capitalize font-poppins"
                            >
                              {activity.status}
                            </Badge>
                          </div>
                          {activity.amount && (
                            <p className="text-sm text-green-400 font-semibold mt-1 font-poppins">
                              ${activity.amount.toFixed(2)}
                            </p>
                          )}
                        </li>
                      ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-semibold text-slate-200 mb-4 font-poppins">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-start bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-700/60 hover:text-slate-100 font-poppins"
                  onClick={action.action}
                >
                  <action.Icon className="mr-3 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
