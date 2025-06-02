"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ReceiptIcon as InvoiceIcon,
  QuoteIcon as QuotationIcon,
  CreditCardIcon as PaymentIcon,
  ArrowRight,
} from "lucide-react" // Renamed Receipt to ReceiptIcon
import { cn } from "@/lib/utils"

interface OperationCardProps {
  title: string
  description: string
  statusText: string
  count: number | string
  Icon: React.ElementType
  iconBgColor: string
  iconColor: string
  buttonText?: string
  href: string
  accentColor: string
  isLoading: boolean
}

const OperationCard: React.FC<OperationCardProps> = ({
  title,
  description,
  statusText,
  count,
  Icon,
  iconBgColor,
  iconColor,
  buttonText = "Manage",
  href,
  accentColor,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-800/60 backdrop-blur-md border-slate-700 shadow-custom rounded-lg p-6 flex flex-col text-center">
        <Skeleton className="h-16 w-16 rounded-lg mb-4 self-center" />
        <Skeleton className="h-6 w-3/4 mb-2 self-center" />
        <Skeleton className="h-4 w-1/2 mb-1 self-center" />
        <Skeleton className="h-8 w-1/3 mb-4 self-center" />
        <Skeleton className="h-10 w-full rounded-md" />
      </Card>
    )
  }

  return (
    <Card
      className="bg-slate-800/60 backdrop-blur-md border-slate-700 shadow-custom rounded-lg p-6 flex flex-col text-center hover:scale-105 hover:shadow-xl transition-all duration-300 group"
      style={{ "--accent-color": accentColor } as React.CSSProperties}
    >
      <div className={cn("p-3 rounded-lg self-center mb-4", iconBgColor)}>
        <Icon className={cn("h-10 w-10", iconColor)} />
      </div>
      <CardTitle className="text-xl font-semibold text-slate-100 mb-1 font-poppins">{title}</CardTitle>
      <CardDescription className="text-sm text-slate-400 mb-2 font-poppins h-10">{description}</CardDescription>
      <div className="my-3">
        <p className="text-3xl font-bold text-slate-50 font-poppins">{count}</p>
        <p className="text-xs text-slate-400 font-poppins">{statusText}</p>
      </div>
      <Button
        asChild
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

export default function TasksOperationsPage() {
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - counts can be fetched from Redux selectors later
  const operationsData = {
    salesInvoices: { pending: 12 },
    quotations: { drafts: 5 },
    payments: { scheduled: 7 }, // Changed to scheduled for outgoing
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const operationSections = [
    {
      title: "Sales Invoices",
      description: "Manage and track all sales invoices.",
      statusText: "Pending Invoices",
      count: operationsData.salesInvoices.pending,
      Icon: InvoiceIcon, // Using renamed icon
      iconBgColor: "bg-blue-500/20",
      iconColor: "text-blue-400",
      href: "/admin/tasks/invoices",
      accentColor: "#3A86FF", // Blue
    },
    {
      title: "Quotations",
      description: "Create, send, and manage client quotations.",
      statusText: "Draft Quotations",
      count: operationsData.quotations.drafts,
      Icon: QuotationIcon, // Using renamed icon
      iconBgColor: "bg-green-500/20",
      iconColor: "text-green-400",
      href: "/admin/tasks/quotations",
      accentColor: "#10B981", // Green
    },
    {
      title: "Outgoing Payments", // Updated title
      description: "Track outgoing payments and manage expenses.",
      statusText: "Scheduled Payments", // Changed status text
      count: operationsData.payments.scheduled,
      Icon: PaymentIcon, // Using renamed icon
      iconBgColor: "bg-pink-500/20", // Changed color for distinction
      iconColor: "text-pink-400",
      href: "/admin/tasks/payments",
      accentColor: "#FF006E", // Pink accent
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-slate-100 font-poppins">Tasks & Operations</h1>
        <p className="text-slate-400 font-poppins">Oversee key business operations and workflows.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {operationSections.map((section) => (
          <OperationCard key={section.title} {...section} isLoading={isLoading} />
        ))}
      </section>
    </div>
  )
}
