"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { QuotationType, QuotationStatus } from "@/lib/types/quotation"
import {
  Mail,
  Calendar,
  DollarSign,
  FileText,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface QuotationCardProps {
  quotation: QuotationType
  onSelect: (quotation: QuotationType) => void
}

const statusColors = {
  draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  accepted: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  expired: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  converted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
}

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
  converted: "Converted",
}

export default function QuotationCard({ quotation, onSelect }: QuotationCardProps) {
  const getStatusBadge = (status: string) => {
    const colorClass = statusColors[status.toLowerCase() as keyof typeof statusColors] || statusColors.draft
    const label = statusLabels[status.toLowerCase() as keyof typeof statusLabels] || status
    
    return (
      <Badge className={cn("text-xs", colorClass)}>
        {label}
      </Badge>
    )
  }

  const clientName = quotation.client?.business_name || "N/A"
  const clientEmail = quotation.client?.email || ""

  return (
    <Card
      className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg shadow-custom hover:border-blue-500/70 transition-all duration-200 cursor-pointer flex flex-col font-poppins"
      onClick={() => onSelect(quotation)}
    >
      <CardHeader className="p-4 flex flex-row items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 border-2 border-blue-500/50">
          <FileText className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-semibold text-slate-100 truncate">
            {quotation.quotationNumber}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(quotation.status)}
            <Badge className={cn(
              "text-xs",
              quotation.status.toLowerCase() === "expired" 
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                : quotation.status.toLowerCase() === "accepted"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
            )}>
              {quotation.status.toLowerCase() === "expired" ? "Expired" : 
               quotation.status.toLowerCase() === "accepted" ? "Accepted" : 
               "Valid"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3 text-sm flex-grow">
        <div className="flex items-center text-slate-400">
          <User className="h-4 w-4 mr-2 text-blue-400" />
          <span className="truncate">{clientName}</span>
        </div>
        {clientEmail && (
          <div className="flex items-center text-slate-400">
            <Mail className="h-4 w-4 mr-2 text-blue-400" />
            <span className="truncate">{clientEmail}</span>
          </div>
        )}
        <div className="flex items-center text-slate-400">
          <Calendar className="h-4 w-4 mr-2 text-blue-400" />
          <span>Valid Until: {format(new Date(quotation.validUntilDate), "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center text-slate-400">
          <DollarSign className="h-4 w-4 mr-2 text-blue-400" />
          <span>Total: {quotation.currency} {quotation.totalAmount.toFixed(2)}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-slate-700/50 flex justify-between items-center">
        <div className="text-xs text-slate-500">
          Created: {format(new Date(quotation.quotationDate), "MMM d, yyyy")}
        </div>
        <div className="text-xs text-slate-500">
          {quotation.items?.length || 0} items
        </div>
      </CardFooter>
    </Card>
  )
}
