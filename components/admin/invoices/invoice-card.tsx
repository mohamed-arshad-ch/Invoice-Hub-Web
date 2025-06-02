"use client"

import type { Invoice } from "@/lib/types/invoice"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Calendar, DollarSign, FileText, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface InvoiceCardProps {
  invoice: Invoice
  onSelect: (invoice: Invoice) => void
}

const statusColors = {
  draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
  pending_payment: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-red-600/20 text-red-400 border-red-600/30",
}

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  pending_payment: "Pending Payment", 
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
}

export default function InvoiceCard({ invoice, onSelect }: InvoiceCardProps) {
  const getStatusBadge = (status: string) => {
    const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.draft
    const label = statusLabels[status as keyof typeof statusLabels] || status
    
    return (
      <Badge className={cn("text-xs", colorClass)}>
        {label}
      </Badge>
    )
  }

  return (
    <Card
      className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg shadow-custom hover:border-blue-500/70 transition-all duration-200 cursor-pointer flex flex-col font-poppins"
      onClick={() => onSelect(invoice)}
    >
      <CardHeader className="p-4 flex flex-row items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 border-2 border-blue-500/50">
          <FileText className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-semibold text-slate-100 truncate">
            {invoice.invoiceNumber}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(invoice.status)}
            <Badge className={cn(
              "text-xs",
              invoice.balanceDue > 0 
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                : "bg-green-500/20 text-green-400 border-green-500/30"
            )}>
              {invoice.balanceDue > 0 ? `$${invoice.balanceDue.toFixed(2)} Due` : "Paid"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3 text-sm flex-grow">
        <div className="flex items-center text-slate-400">
          <User className="h-4 w-4 mr-2 text-blue-400" />
          <span className="truncate">{invoice.clientName}</span>
        </div>
        <div className="flex items-center text-slate-400">
          <Mail className="h-4 w-4 mr-2 text-blue-400" />
          <span className="truncate">{invoice.clientEmail}</span>
        </div>
        <div className="flex items-center text-slate-400">
          <Calendar className="h-4 w-4 mr-2 text-blue-400" />
          <span>Due: {format(new Date(invoice.dueDate), "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center text-slate-400">
          <DollarSign className="h-4 w-4 mr-2 text-blue-400" />
          <span>Total: ${invoice.totalAmount.toFixed(2)}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-slate-700/50 flex justify-between items-center">
        <div className="text-xs text-slate-500">
          Issued: {format(new Date(invoice.issueDate), "MMM d, yyyy")}
        </div>
        <div className="text-xs text-slate-500">
          {invoice.lineItems?.length || 0} items
        </div>
      </CardFooter>
    </Card>
  )
}
