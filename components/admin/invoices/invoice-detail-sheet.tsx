"use client"

import type React from "react"
import type { Invoice } from "@/lib/types/invoice"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  CreditCard, 
  CalendarDays, 
  FileText, 
  User,
  X,
  DollarSign,
  Clock,
  Package,
  Hash
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface InvoiceDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  invoice: Invoice | null
  onEdit: (invoice: Invoice) => void
  onDelete: (invoiceId: string) => void
}

const DetailItem: React.FC<{
  icon: React.ElementType
  label: string
  value?: string | number | null
  children?: React.ReactNode
}> = ({ icon: Icon, label, value, children }) => (
  <div className="flex items-start py-3">
    <Icon className="h-5 w-5 mr-3 mt-1 text-blue-400 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
      {children || <p className="text-sm text-slate-200 mt-1">{value || "N/A"}</p>}
    </div>
  </div>
)

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

export default function InvoiceDetailSheet({ isOpen, onClose, invoice, onEdit, onDelete }: InvoiceDetailSheetProps) {
  if (!invoice) return null

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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl bg-slate-800 border-slate-700 text-slate-100 font-poppins flex flex-col">
        <SheetHeader className="px-6 pt-6 text-left relative">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 border-2 border-blue-500">
              <FileText className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl text-slate-50 truncate">{invoice.invoiceNumber}</SheetTitle>
              <div className="flex items-center gap-2 mt-2">
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
          </div>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-5 w-5 text-slate-400 hover:text-slate-100" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        <ScrollArea className="flex-grow px-6 py-4">
          <div className="space-y-6">
            {/* Client Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Client Information
              </h3>
              <div className="space-y-1 divide-y divide-slate-700/50">
                <DetailItem icon={Building2} label="Business Name" value={invoice.clientName} />
                <DetailItem icon={Mail} label="Email" value={invoice.clientEmail} />
              </div>
            </div>

            <Separator className="bg-slate-600" />

            {/* Invoice Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Invoice Details
              </h3>
              <div className="space-y-1 divide-y divide-slate-700/50">
                <DetailItem 
                  icon={Hash} 
                  label="Invoice Number" 
                  value={invoice.invoiceNumber} 
                />
                <DetailItem 
                  icon={CalendarDays} 
                  label="Issue Date" 
                  value={format(new Date(invoice.issueDate), "MMMM d, yyyy")} 
                />
                <DetailItem 
                  icon={CalendarDays} 
                  label="Due Date" 
                  value={format(new Date(invoice.dueDate), "MMMM d, yyyy")} 
                />
                {invoice.paymentTerms && (
                  <DetailItem 
                    icon={CreditCard} 
                    label="Payment Terms" 
                    value={invoice.paymentTerms} 
                  />
                )}
              </div>
            </div>

            <Separator className="bg-slate-600" />

            {/* Line Items */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Line Items ({invoice.lineItems?.length || 0})
              </h3>
              <div className="space-y-3">
                {invoice.lineItems?.map((item, index) => (
                  <Card key={item.id || index} className="bg-slate-700/30 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-100">{item.productName}</h4>
                        <span className="text-slate-100 font-semibold">${item.amount.toFixed(2)}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-slate-400 mb-2">{item.description}</p>
                      )}
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>Qty: {item.quantity}</span>
                        <span>Unit Price: ${item.unitPrice.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-600" />

            {/* Financial Summary */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Summary
              </h3>
              <div className="space-y-1 divide-y divide-slate-700/50">
                <DetailItem 
                  icon={DollarSign} 
                  label="Subtotal" 
                  value={`$${invoice.subtotal.toFixed(2)}`} 
                />
                <DetailItem 
                  icon={DollarSign} 
                  label={`Tax (${invoice.taxRatePercent}%)`}
                  value={`$${invoice.taxAmount.toFixed(2)}`} 
                />
                <DetailItem 
                  icon={DollarSign} 
                  label="Total Amount" 
                  value={`$${invoice.totalAmount.toFixed(2)}`} 
                />
                <DetailItem 
                  icon={DollarSign} 
                  label="Amount Paid" 
                  value={`$${invoice.amountPaid.toFixed(2)}`} 
                />
                <DetailItem 
                  icon={DollarSign} 
                  label="Balance Due" 
                  value={`$${invoice.balanceDue.toFixed(2)}`} 
                />
              </div>
            </div>

            <Separator className="bg-slate-600" />

            {/* Additional Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Additional Information
              </h3>
              <div className="space-y-1 divide-y divide-slate-700/50">
                <DetailItem 
                  icon={CalendarDays} 
                  label="Created" 
                  value={format(new Date(invoice.createdAt), "MMMM d, yyyy 'at' h:mm a")} 
                />
                <DetailItem 
                  icon={CalendarDays} 
                  label="Last Updated" 
                  value={format(new Date(invoice.updatedAt), "MMMM d, yyyy 'at' h:mm a")} 
                />
                {invoice.notes && (
                  <DetailItem icon={FileText} label="Notes">
                    <div className="mt-1 p-3 bg-slate-700/50 rounded-md border border-slate-600">
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                  </DetailItem>
                )}
                {invoice.paymentInstructions && (
                  <DetailItem icon={CreditCard} label="Payment Instructions">
                    <div className="mt-1 p-3 bg-slate-700/50 rounded-md border border-slate-600">
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">{invoice.paymentInstructions}</p>
                    </div>
                  </DetailItem>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-slate-700 flex flex-col sm:flex-row sm:justify-end sm:space-x-2 gap-2">
          <Button
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full sm:w-auto"
            onClick={() => {
              onClose()
              onDelete(invoice.id)
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto"
            onClick={() => {
              onClose()
              onEdit(invoice)
            }}
          >
            <Edit2 className="mr-2 h-4 w-4" /> Edit Invoice
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
