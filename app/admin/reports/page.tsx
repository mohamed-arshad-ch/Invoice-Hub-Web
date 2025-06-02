"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardTitle, CardDescription, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  UserCheck,
  Package,
  TrendingUp,
  CreditCard,
  BarChart3,
  ArrowRight,
  FileIcon,
  FileSpreadsheet,
} from "lucide-react"
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, Tooltip } from "recharts"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface ReportCardProps {
  title: string
  description: string
  metric: string
  metricLabel: string
  Icon: React.ElementType
  iconBgColor: string
  iconColor: string
  href: string
  accentColor: string
  lastUpdated: Date
  chartData: any[]
  chartType: "line" | "bar"
  chartDataKey: string
  isLoading: boolean
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  description,
  metric,
  metricLabel,
  Icon,
  iconBgColor,
  iconColor,
  href,
  accentColor,
  lastUpdated,
  chartData,
  chartType,
  chartDataKey,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-800/60 backdrop-blur-md border-slate-700 shadow-custom rounded-lg p-6 flex flex-col">
        <div className="flex items-center mb-4">
          <Skeleton className="h-12 w-12 rounded-lg mr-4" />
          <div>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-20 w-full mb-4" /> {/* Placeholder for chart */}
        <div className="mb-4">
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-10 w-full rounded-md mb-2" />
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-700">
          <Skeleton className="h-4 w-28" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </Card>
    )
  }

  const chartColor = accentColor || "#8884d8"

  return (
    <Card
      className="bg-slate-800/60 backdrop-blur-md border-slate-700 shadow-custom rounded-lg p-6 flex flex-col hover:shadow-xl transition-shadow duration-300 group"
      style={{ "--accent-color": accentColor } as React.CSSProperties}
    >
      <CardHeader className="p-0 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className={cn("p-3 rounded-lg mr-4", iconBgColor)}>
              <Icon className={cn("h-8 w-8", iconColor)} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-100 font-poppins">{title}</CardTitle>
              <CardDescription className="text-xs text-slate-400 font-poppins">{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 mb-4 flex-grow">
        <div className="h-20 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <Line type="monotone" dataKey={chartDataKey} stroke={chartColor} strokeWidth={2} dot={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 41, 59, 0.8)", // slate-800 with opacity
                    borderColor: "rgba(51, 65, 85, 0.8)", // slate-700 with opacity
                    borderRadius: "0.375rem", // rounded-md
                  }}
                  itemStyle={{ color: "#e2e8f0" }} // slate-200
                  cursor={{ fill: "rgba(255,255,255,0.1)" }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <Bar dataKey={chartDataKey} fill={chartColor} radius={[4, 4, 0, 0]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 41, 59, 0.8)",
                    borderColor: "rgba(51, 65, 85, 0.8)",
                    borderRadius: "0.375rem",
                  }}
                  itemStyle={{ color: "#e2e8f0" }}
                  cursor={{ fill: "rgba(255,255,255,0.1)" }}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-50 font-poppins">{metric}</p>
          <p className="text-xs text-slate-400 font-poppins">{metricLabel}</p>
        </div>
      </CardContent>

      <CardFooter className="p-0 flex flex-col items-start">
        <Button
          asChild
          className="w-full font-poppins text-white transition-all duration-300 mb-3"
          style={{ backgroundColor: accentColor }}
          onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
          onMouseOut={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          <Link href={href}>
            View Report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <div className="flex justify-between items-center w-full pt-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 font-poppins">Last updated: {format(lastUpdated, "MMM d, yyyy")}</p>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            >
              <FileIcon className="h-4 w-4" />
              <span className="sr-only">Export PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="sr-only">Export Excel</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

// Mock chart data generator
const generateMockChartData = (points = 7, key = "value", min = 10, max = 100) =>
  Array.from({ length: points }, (_, i) => ({
    name: `P${i + 1}`,
    [key]: Math.floor(Math.random() * (max - min + 1)) + min,
  }))

export default function ReportsAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState("last_30_days")

  // Mock data - in a real app, this would change based on dateRange
  const reportSections = [
    {
      title: "Client Reports",
      description: "Insights on client activity and demographics.",
      metric: "1,250",
      metricLabel: "Total Clients",
      Icon: Users,
      iconBgColor: "bg-blue-500/20",
      iconColor: "text-blue-400",
      href: "/admin/reports/clients",
      accentColor: "#3A86FF", // Blue
      lastUpdated: new Date(Date.now() - 86400000 * 1), // 1 day ago
      chartData: generateMockChartData(7, "clients", 50, 200),
      chartType: "line",
      chartDataKey: "clients",
    },
    {
      title: "Staff Reports",
      description: "Performance and activity of staff members.",
      metric: "75",
      metricLabel: "Active Staff",
      Icon: UserCheck,
      iconBgColor: "bg-green-500/20",
      iconColor: "text-green-400",
      href: "/admin/reports/staff",
      accentColor: "#10B981", // Green
      lastUpdated: new Date(Date.now() - 86400000 * 2), // 2 days ago
      chartData: generateMockChartData(7, "tasks", 10, 50),
      chartType: "bar",
      chartDataKey: "tasks",
    },
    {
      title: "Product Reports",
      description: "Inventory status and product performance.",
      metric: "Low Stock",
      metricLabel: "Inventory Status",
      Icon: Package,
      iconBgColor: "bg-orange-500/20",
      iconColor: "text-orange-400",
      href: "/admin/reports/products",
      accentColor: "#FF8C00", // Orange
      lastUpdated: new Date(Date.now() - 86400000 * 0.5), // 12 hours ago
      chartData: generateMockChartData(7, "stock", 5, 30),
      chartType: "line",
      chartDataKey: "stock",
    },
    {
      title: "Sales Reports",
      description: "Track revenue, sales trends, and top products.",
      metric: "$45.2K",
      metricLabel: "Revenue (Last 30d)",
      Icon: TrendingUp,
      iconBgColor: "bg-pink-500/20",
      iconColor: "text-pink-400",
      href: "/admin/reports/sales",
      accentColor: "#FF006E", // Pink (InvoiceHub Accent)
      lastUpdated: new Date(Date.now() - 86400000 * 0.2), // Few hours ago
      chartData: generateMockChartData(7, "revenue", 1000, 5000),
      chartType: "line",
      chartDataKey: "revenue",
    },
    {
      title: "Payment Reports",
      description: "Overview of payment statuses and methods.",
      metric: "92.5%",
      metricLabel: "Successful Payments",
      Icon: CreditCard,
      iconBgColor: "bg-purple-500/20",
      iconColor: "text-purple-400",
      href: "/admin/reports/payments",
      accentColor: "#8338EC", // Purple (InvoiceHub Secondary)
      lastUpdated: new Date(Date.now() - 86400000 * 3), // 3 days ago
      chartData: generateMockChartData(7, "payments", 100, 1000),
      chartType: "bar",
      chartDataKey: "payments",
    },
    {
      title: "Financial Reports",
      description: "Summary of profit, loss, and expenses.",
      metric: "$12.8K",
      metricLabel: "Net Profit (YTD)",
      Icon: BarChart3,
      iconBgColor: "bg-teal-500/20",
      iconColor: "text-teal-400",
      href: "/admin/reports/financial",
      accentColor: "#14B8A6", // Teal
      lastUpdated: new Date(Date.now() - 86400000 * 5), // 5 days ago
      chartData: generateMockChartData(7, "profit", -500, 2000),
      chartType: "line",
      chartDataKey: "profit",
    },
  ]

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000) // Simulate loading
    return () => clearTimeout(timer)
  }, [])

  const handleDateRangeChange = (value: string) => {
    setDateRange(value)
    setIsLoading(true)
    // In a real app, you would refetch data based on the new date range
    setTimeout(() => setIsLoading(false), 500)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 font-poppins">Reports & Analytics</h1>
          <p className="text-slate-400 font-poppins">Visualize data and gain insights into your operations.</p>
        </div>
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-slate-800/50 border-slate-700 text-slate-200 focus:border-blue-500 font-poppins">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
            <SelectItem value="last_7_days" className="focus:bg-slate-700 focus:text-white font-poppins">
              Last 7 Days
            </SelectItem>
            <SelectItem value="last_30_days" className="focus:bg-slate-700 focus:text-white font-poppins">
              Last 30 Days
            </SelectItem>
            <SelectItem value="last_90_days" className="focus:bg-slate-700 focus:text-white font-poppins">
              Last 90 Days
            </SelectItem>
            <SelectItem value="year_to_date" className="focus:bg-slate-700 focus:text-white font-poppins">
              Year to Date
            </SelectItem>
          </SelectContent>
        </Select>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportSections.map((section) => (
          <ReportCard key={section.title} {...section} isLoading={isLoading} />
        ))}
      </section>
    </div>
  )
}
