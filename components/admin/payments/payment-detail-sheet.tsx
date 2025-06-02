"use client"

import type React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
// Corrected import: PaymentStatus and PaymentMethod are now value imports
import { PaymentStatus, PaymentMethod, type PaymentType } from "@/lib/types/payment"
import { useSelector } from "react-redux"
import { selectClientById } from "@/lib/redux/slices/clientsSlice"
import type { RootState } from "@/lib/redux/store"
import { cn } from "@/lib/utils"
import {
  Banknote,
  CalendarDays,
  CreditCard,
  Edit3,
  FileText,
  Hash,
  Landmark,
  ListChecks,
  MessageSquare,
  Paperclip,
  Receipt,
  UserCircle,
  X,
} from "lucide-react"
import { useCallback } from "react"

interface PaymentDetailSheetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  payment: PaymentType | null
  onEdit: () => void
}

const getStatusClass = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.Completed:
    case PaymentStatus.Applied:
      return "bg-green-500/20 text-green-700 dark:bg-green-700/30 dark:text-green-300 border-green-500/30"
    case PaymentStatus.Pending:
    case PaymentStatus.Unapplied:
      return "bg-yellow-500/20 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300 border-yellow-500/30"
    case PaymentStatus.Failed:
      return "bg-red-500/20 text-red-700 dark:bg-red-700/30 dark:text-red-300 border-red-500/30"
    case PaymentStatus.Refunded:
    case PaymentStatus.PartiallyRefunded:
      return "bg-blue-500/20 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300 border-blue-500/30"
    default:
      return "bg-slate-500/20 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300 border-slate-500/30"
  }
}

const getPaymentMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.Card:
      return <CreditCard className="h-5 w-5" />
    case PaymentMethod.BankTransfer:
      return <Landmark className="h-5 w-5" />
    case PaymentMethod.Cash:
      return <Banknote className="h-5 w-5" />
    case PaymentMethod.Cheque:
      return <FileText className="h-5 w-5" />
    case PaymentMethod.Online:
      return <Receipt className="h-5 w-5" />
    default:
      return <CreditCard className="h-5 w-5" /> // Default icon
  }
}

const DetailItem: React.FC<{
  icon: React.ElementType
  label: string
  value?: string | number | null
  children?: React.ReactNode
  className?: string
}> = ({ icon: Icon, label, value, children, className }) => (
  <div className={cn("flex items-start py-3 border-b border-slate-200 dark:border-slate-700/60", className)}>
    <Icon className="h-5 w-5 mr-3 mt-0.5 text-primary dark:text-sky-400 flex-shrink-0" />
    <div className="flex-grow">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      {value !== undefined && <p className="text-sm text-slate-800 dark:text-slate-100 font-medium">{value}</p>}
      {children}
    </div>
  </div>
)

const PaymentDetailSheet: React.FC<PaymentDetailSheetProps> = ({ isOpen, onOpenChange, payment, onEdit }) => {
  const client = useSelector((state: RootState) => (payment ? selectClientById(state, payment.clientId) : null))

  // Corrected: Use a stable reference for getInvoice or ensure it's memoized if used in dependencies
  const invoicesById = useSelector((state: RootState) =>
    state.invoices.invoices.reduce(
      (acc, inv) => {
        acc[inv.id] = inv
        return acc
      },
      {} as Record<string, import("@/lib/types/invoice").Invoice>,
    ),
  )

  const getInvoice = useCallback((invoiceId: string) => invoicesById[invoiceId] || null, [invoicesById])

  if (!payment) return null

  const formattedPaymentDate = new Date(payment.paymentDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  const formattedCreatedAt = new Date(payment.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  const formattedUpdatedAt = new Date(payment.updatedAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-poppins flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-slate-200 dark:border-slate-700/60">
          <div className="flex justify-between items-center">
            <div>
              <SheetTitle className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                <Hash size={22} className="mr-2 text-primary dark:text-sky-400" /> Payment Details:{" "}
                {payment.paymentNumber}
              </SheetTitle>
              <SheetDescription className="text-slate-500 dark:text-slate-400 mt-1">
                Viewing recorded payment information.
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50"
              >
                <X size={20} />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-grow px-6 py-2">
          <div className="space-y-1">
            <DetailItem icon={UserCircle} label="Client" value={client?.name || "N/A"} />
            <DetailItem icon={CreditCard} label="Amount" value={`$${payment.amount.toFixed(2)}`} />
            <DetailItem icon={CalendarDays} label="Payment Date" value={formattedPaymentDate} />

            <div className="flex items-start py-3 border-b border-slate-200 dark:border-slate-700/60">
              <div className="h-5 w-5 mr-3 mt-0.5 text-primary dark:text-sky-400 flex-shrink-0">
                {getPaymentMethodIcon(payment.paymentMethod)}
              </div>
              <div className="flex-grow">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Payment Method</p>
                <p className="text-sm text-slate-800 dark:text-slate-100 font-medium">{payment.paymentMethod}</p>
              </div>
            </div>

            {payment.referenceNumber && (
              <DetailItem icon={FileText} label="Reference Number" value={payment.referenceNumber} />
            )}

            <div className="flex items-start py-3 border-b border-slate-200 dark:border-slate-700/60">
              <ListChecks className="h-5 w-5 mr-3 mt-0.5 text-primary dark:text-sky-400 flex-shrink-0" />
              <div className="flex-grow">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status</p>
                <Badge
                  className={cn("text-xs font-medium py-0.5 px-2 rounded-full border", getStatusClass(payment.status))}
                >
                  {payment.status}
                </Badge>
              </div>
            </div>

            {payment.allocations && payment.allocations.length > 0 && (
              <DetailItem icon={ListChecks} label="Applied to Invoices">
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {payment.allocations.map((alloc) => {
                    const invoice = getInvoice(alloc.invoiceId)
                    return (
                      <li key={alloc.invoiceId} className="text-sm text-slate-700 dark:text-slate-200">
                        {invoice?.invoiceNumber || alloc.invoiceId}: ${alloc.amountApplied.toFixed(2)}
                      </li>
                    )
                  })}
                </ul>
              </DetailItem>
            )}
            {(payment.status === PaymentStatus.Unapplied ||
              (payment.allocations &&
                payment.allocations.length === 0 &&
                payment.status !== PaymentStatus.Pending &&
                payment.status !== PaymentStatus.Failed)) && (
              <DetailItem icon={ListChecks} label="Applied to Invoices" value="Not applied to any invoice yet." />
            )}

            {payment.notes && <DetailItem icon={MessageSquare} label="Notes" value={payment.notes} />}

            {payment.attachments && payment.attachments.length > 0 && (
              <DetailItem icon={Paperclip} label="Attachments">
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {payment.attachments.map((att, index) => (
                    <li key={index} className="text-sm">
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {att.name} ({att.type})
                      </a>
                    </li>
                  ))}
                </ul>
              </DetailItem>
            )}
            <DetailItem icon={CalendarDays} label="Recorded On" value={formattedCreatedAt} className="pt-4" />
            <DetailItem icon={CalendarDays} label="Last Updated" value={formattedUpdatedAt} className="border-b-0" />
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50">
          <Button
            variant="outline"
            onClick={onEdit}
            className="w-full sm:w-auto flex items-center gap-2 text-primary dark:text-sky-400 border-primary/50 dark:border-sky-400/50 hover:bg-primary/10 dark:hover:bg-sky-400/10"
          >
            <Edit3 size={16} />
            Edit Payment
          </Button>
          <SheetClose asChild>
            <Button
              variant="default"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
              style={{ backgroundColor: "#3A86FF" }}
            >
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default PaymentDetailSheet
