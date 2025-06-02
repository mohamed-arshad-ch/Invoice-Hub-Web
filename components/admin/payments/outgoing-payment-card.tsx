"use client"

import type React from "react"
import { format } from "date-fns"
import { DollarSign, Calendar, CreditCard, User, Package, Building, FileText, Receipt } from "lucide-react"

import type { OutgoingPaymentType } from "@/lib/types/outgoing-payment"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OutgoingPaymentCardProps {
  payment: OutgoingPaymentType
  onSelect: (payment: OutgoingPaymentType) => void
}

const statusColors = {
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  processing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

const statusLabels = {
  paid: "Paid",
  scheduled: "Scheduled",
  processing: "Processing",
  failed: "Failed",
  cancelled: "Cancelled",
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Staff Salary":
      return <User className="h-6 w-6" />
    case "Cloud Subscription":
      return <Package className="h-6 w-6" />
    case "Expense Payment":
      return <Building className="h-6 w-6" />
    default:
      return <Receipt className="h-6 w-6" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Staff Salary":
      return "bg-purple-600/20 text-purple-400 border-2 border-purple-500/50"
    case "Cloud Subscription":
      return "bg-blue-600/20 text-blue-400 border-2 border-blue-500/50"
    case "Expense Payment":
      return "bg-orange-600/20 text-orange-400 border-2 border-orange-500/50"
    default:
      return "bg-gray-600/20 text-gray-400 border-2 border-gray-500/50"
  }
}

export default function OutgoingPaymentCard({ payment, onSelect }: OutgoingPaymentCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const colorClass = statusColors[status.toLowerCase() as keyof typeof statusColors] || statusColors.scheduled
    const label = statusLabels[status.toLowerCase() as keyof typeof statusLabels] || status
    
    return (
      <Badge className={cn("text-xs", colorClass)}>
        {label}
      </Badge>
    )
  }

  const getPayeeName = () => {
    if (payment.staff) return payment.staff.name
    if (payment.product) return payment.product.name
    if (payment.payeeName) return payment.payeeName
    if (payment.expenseCategory) return payment.expenseCategory.name
    return "Unknown Payee"
  }

  const getPayeeDetails = () => {
    if (payment.staff) return payment.staff.position
    if (payment.product) return payment.product.description || payment.product.category
    if (payment.expenseCategory) return payment.expenseCategory.description
    return payment.paymentCategory
  }

  return (
    <Card
      className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg shadow-custom hover:border-blue-500/70 transition-all duration-200 cursor-pointer flex flex-col font-poppins"
      onClick={() => onSelect(payment)}
    >
      <CardHeader className="p-4 flex flex-row items-center gap-4">
        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", getCategoryColor(payment.paymentCategory))}>
          {getCategoryIcon(payment.paymentCategory)}
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-semibold text-slate-100 truncate">
            {payment.paymentNumber}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(payment.status)}
            <Badge className="text-xs bg-slate-600/20 text-slate-400 border-slate-500/30">
              {payment.paymentCategory}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3 text-sm flex-grow">
        <div className="flex items-center text-slate-400">
          <User className="h-4 w-4 mr-2 text-blue-400" />
          <span className="truncate">{getPayeeName()}</span>
        </div>
        
        {getPayeeDetails() && (
          <div className="flex items-center text-slate-400">
            <FileText className="h-4 w-4 mr-2 text-blue-400" />
            <span className="truncate text-xs">{getPayeeDetails()}</span>
          </div>
        )}
        
        <div className="flex items-center text-slate-400">
          <Calendar className="h-4 w-4 mr-2 text-blue-400" />
          <span>Date: {format(new Date(payment.paymentDate), "MMM d, yyyy")}</span>
        </div>
        
        <div className="flex items-center text-slate-400">
          <CreditCard className="h-4 w-4 mr-2 text-blue-400" />
          <span>Method: {payment.paymentMethod}</span>
        </div>
        
        <div className="flex items-center text-slate-400">
          <DollarSign className="h-4 w-4 mr-2 text-blue-400" />
          <span className="font-semibold text-slate-200">{formatCurrency(payment.amount)}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-slate-700/50 flex justify-between items-center">
        <div className="text-xs text-slate-500">
          Created: {format(new Date(payment.createdAt), "MMM d, yyyy")}
        </div>
        {payment.referenceNumber && (
          <div className="text-xs text-slate-500 font-mono">
            Ref: {payment.referenceNumber}
          </div>
        )}
      </CardFooter>
    </Card>
  )
} 