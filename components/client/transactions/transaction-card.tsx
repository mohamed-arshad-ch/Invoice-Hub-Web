"use client"

import type { Invoice, InvoiceStatus } from "@/lib/types/invoice"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText, CalendarDays, DollarSignIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TransactionCardProps {
  transaction: Invoice
  onViewDetails: (transaction: Invoice) => void
}

// Consistent status colors with admin section, but using client dashboard's palette if needed
const statusColors: Record<InvoiceStatus, string> = {
  draft: "bg-slate-500/20 text-slate-300 border-slate-500/50", // Should not be visible to client ideally
  sent: "bg-blue-500/20 text-blue-300 border-blue-500/50",
  pending_payment: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
  paid: "bg-green-500/20 text-green-300 border-green-500/50",
  overdue: "bg-red-500/20 text-red-300 border-red-500/50",
  cancelled: "bg-neutral-600/20 text-neutral-300 border-neutral-500/50",
}

export default function TransactionCard({ transaction, onViewDetails }: TransactionCardProps) {
  return (
    <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg shadow-custom hover:border-blue-500/70 transition-all duration-200 flex flex-col font-poppins">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle
            className="text-lg font-semibold text-blue-400 hover:underline cursor-pointer flex items-center"
            onClick={() => onViewDetails(transaction)}
          >
            <FileText className="mr-2 h-5 w-5 text-blue-400/80" /> {transaction.invoiceNumber}
          </CardTitle>
          <Badge className={cn("text-xs capitalize h-fit", statusColors[transaction.status])}>
            {transaction.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-1 text-sm flex-grow text-slate-300">
        <div className="flex items-center">
          <CalendarDays size={14} className="mr-2 text-slate-400" />
          Issue Date:
          <span className="text-slate-100 ml-auto">{format(new Date(transaction.issueDate), "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center">
          <CalendarDays size={14} className="mr-2 text-slate-400" />
          Due Date:
          <span className="text-slate-100 ml-auto">{format(new Date(transaction.dueDate), "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center">
          <DollarSignIcon size={14} className="mr-2 text-slate-400" />
          Total Amount:
          <span className="text-xl font-semibold text-slate-100 ml-auto">${transaction.totalAmount.toFixed(2)}</span>
        </div>
        {transaction.balanceDue > 0 && (
          <div className="flex items-center">
            <DollarSignIcon size={14} className="mr-2 text-slate-400" />
            Balance Due:
            <span
              className={cn(
                "font-semibold ml-auto",
                statusColors[transaction.status].replace("bg-", "text-").replace("/20", ""),
              )}
            >
              ${transaction.balanceDue.toFixed(2)}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-slate-700/50 flex justify-end">
        <Button
          variant="outline"
          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 w-full"
          onClick={() => onViewDetails(transaction)}
        >
          <Eye className="mr-2 h-4 w-4" /> View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
