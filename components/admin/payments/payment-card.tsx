"use client"

import type React from "react"
import { type PaymentType, PaymentStatus, PaymentMethod } from "@/lib/types/payment"
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  Edit3,
  DollarSign,
  CalendarDays,
  CreditCard,
  Hash,
  UserCircle,
  FileText,
  Banknote,
  Landmark,
  Receipt,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useSelector } from "react-redux"
import { selectClientById } from "@/lib/redux/slices/clientsSlice"
import type { RootState } from "@/lib/redux/store"
// Poppins font is globally applied

interface PaymentCardProps {
  payment: PaymentType
  onViewDetails: () => void
  onEdit: () => void
  onDelete?: () => void // Optional: Add if delete functionality is needed
}

const getStatusClass = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.Completed:
    case PaymentStatus.Applied:
      return "bg-green-500/20 text-green-300 border-green-700/50"
    case PaymentStatus.Pending:
    case PaymentStatus.Unapplied:
      return "bg-yellow-500/20 text-yellow-300 border-yellow-700/50"
    case PaymentStatus.Failed:
      return "bg-red-500/20 text-red-300 border-red-700/50"
    case PaymentStatus.Refunded:
    case PaymentStatus.PartiallyRefunded:
      return "bg-blue-500/20 text-blue-300 border-blue-700/50" // Using blue for refunds
    default:
      return "bg-slate-600/50 text-slate-300 border-slate-500/50"
  }
}

const getPaymentMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.Card:
      return <CreditCard className="h-4 w-4 mr-1.5 text-slate-400" />
    case PaymentMethod.BankTransfer:
      return <Landmark className="h-4 w-4 mr-1.5 text-slate-400" />
    case PaymentMethod.Cash:
      return <Banknote className="h-4 w-4 mr-1.5 text-slate-400" />
    case PaymentMethod.Cheque:
      return <FileText className="h-4 w-4 mr-1.5 text-slate-400" />
    case PaymentMethod.Online:
      return <Receipt className="h-4 w-4 mr-1.5 text-slate-400" />
    default:
      return <DollarSign className="h-4 w-4 mr-1.5 text-slate-400" />
  }
}

const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onViewDetails, onEdit, onDelete }) => {
  const client = useSelector((state: RootState) => selectClientById(state, payment.clientId))

  const formattedDate = new Date(payment.paymentDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg shadow-custom hover:border-blue-500/70 transition-all duration-200 flex flex-col font-poppins">
      <CardHeader className="p-4 flex flex-row justify-between items-start">
        <div>
          <CardTitle
            className="text-lg font-semibold text-blue-400 hover:underline cursor-pointer flex items-center"
            onClick={onViewDetails}
          >
            <Hash size={18} className="mr-1.5 text-blue-400/80" />
            {payment.paymentNumber}
          </CardTitle>
          <p className="text-sm text-slate-300 flex items-center mt-1">
            <UserCircle size={14} className="mr-1.5 text-slate-400" />
            {client?.name || "N/A"}
          </p>
        </div>
        <Badge className={cn("text-xs capitalize h-fit", getStatusClass(payment.status))}>{payment.status}</Badge>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-1 text-sm flex-grow text-slate-300">
        <div className="flex items-center">
          <DollarSign size={14} className="mr-2 text-slate-400" />
          <span className="font-medium text-slate-100">Amount: ${payment.amount.toFixed(2)}</span>
        </div>
        <div className="flex items-center">
          <CalendarDays size={14} className="mr-2 text-slate-400" />
          <span>Date: {formattedDate}</span>
        </div>
        <div className="flex items-center">
          {getPaymentMethodIcon(payment.paymentMethod)}
          <span>Method: {payment.paymentMethod}</span>
        </div>
        {payment.referenceNumber && (
          <div className="flex items-center">
            <FileText size={14} className="mr-2 text-slate-400" />
            <span>Ref: {payment.referenceNumber}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 border-t border-slate-700/50 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100 hover:bg-slate-700">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-100 shadow-xl">
            <DropdownMenuItem onClick={onViewDetails} className="focus:bg-slate-700">
              <Eye className="mr-2 h-4 w-4 text-blue-400" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} className="focus:bg-slate-700">
              <Edit3 className="mr-2 h-4 w-4 text-green-400" /> Edit
            </DropdownMenuItem>
            {onDelete && (
              <>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem onClick={onDelete} className="focus:bg-red-600/50 text-red-400 focus:text-red-300">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}

export default PaymentCard
