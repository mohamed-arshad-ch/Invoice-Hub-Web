"use client"

import type React from "react"
import { format } from "date-fns"
import type { Invoice, InvoiceStatus } from "@/lib/types/invoice"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { X, CalendarDays, Hash, Info, CreditCard, DollarSign, Printer, Download, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface TransactionDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  transaction: Invoice | null
}

const statusColors: Record<InvoiceStatus, string> = {
  draft: "bg-slate-500/20 text-slate-300 border-slate-500/50",
  sent: "bg-blue-500/20 text-blue-300 border-blue-500/50",
  pending_payment: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
  paid: "bg-green-500/20 text-green-300 border-green-500/50",
  overdue: "bg-red-500/20 text-red-300 border-red-500/50",
  cancelled: "bg-neutral-600/20 text-neutral-300 border-neutral-500/50",
}

const DetailItem: React.FC<{
  icon: React.ElementType
  label: string
  value?: string | React.ReactNode
  className?: string
}> = ({ icon: Icon, label, value, className }) => (
  <div className={cn("flex items-start py-2", className)}>
    <Icon className="h-4 w-4 mr-3 mt-1 text-slate-400 flex-shrink-0" />
    <div className="flex-grow">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      {typeof value === "string" ? <p className="text-sm text-slate-200">{value || "N/A"}</p> : value}
    </div>
  </div>
)

export default function TransactionDetailSheet({ isOpen, onClose, transaction }: TransactionDetailSheetProps) {
  if (!transaction) return null

  const handlePrint = () => {
    // Placeholder for print functionality
    alert("Print functionality to be implemented.")
    // window.print(); // Basic browser print
  }

  const handleDownload = () => {
    // Placeholder for PDF download functionality
    alert("PDF Download functionality to be implemented.")
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl bg-slate-800 border-slate-700 text-slate-100 font-poppins flex flex-col">
        <SheetHeader className="px-6 pt-6 text-left relative">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-xl text-blue-400 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-400/80" />
                Invoice {transaction.invoiceNumber}
              </SheetTitle>
              <Badge className={cn("text-xs mt-1 capitalize", statusColors[transaction.status])}>
                {transaction.status.replace("_", " ")}
              </Badge>
            </div>
            <SheetClose className="p-1 rounded-md hover:bg-slate-700 transition-colors">
              <X className="h-5 w-5 text-slate-400 hover:text-slate-100" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-grow px-6 py-4">
          <div className="space-y-4">
            <Card className="bg-slate-700/30 border-slate-600 p-4 rounded-md">
              <h3 className="text-md font-semibold text-slate-200 mb-2">Invoice Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <DetailItem icon={Hash} label="Invoice Number" value={transaction.invoiceNumber} />
                <DetailItem
                  icon={CalendarDays}
                  label="Issue Date"
                  value={format(new Date(transaction.issueDate), "MMM d, yyyy")}
                />
                <DetailItem
                  icon={CalendarDays}
                  label="Due Date"
                  value={format(new Date(transaction.dueDate), "MMM d, yyyy")}
                />
                {transaction.paymentTerms && (
                  <DetailItem icon={Info} label="Payment Terms" value={transaction.paymentTerms} />
                )}
              </div>
            </Card>

            <Card className="bg-slate-700/30 border-slate-600 p-4 rounded-md">
              <h3 className="text-md font-semibold text-slate-200 mb-2">Line Items</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {transaction.lineItems.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-600/40 rounded-md border border-slate-600 text-xs">
                    <div className="flex justify-between items-center font-medium text-slate-100">
                      <span>{item.productName}</span>
                      <span>${item.amount.toFixed(2)}</span>
                    </div>
                    {item.description && <p className="text-slate-300 text-xs mt-0.5">{item.description}</p>}
                    <p className="text-slate-400">
                      Qty: {item.quantity} @ ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-slate-700/30 border-slate-600 p-4 rounded-md">
              <h3 className="text-md font-semibold text-slate-200 mb-2">Financial Summary</h3>
              <DetailItem icon={DollarSign} label="Subtotal" value={`$${transaction.subtotal.toFixed(2)}`} />
              {transaction.taxAmount > 0 && (
                <DetailItem
                  icon={DollarSign}
                  label={`Tax (${transaction.taxRatePercent}%)`}
                  value={`$${transaction.taxAmount.toFixed(2)}`}
                />
              )}
              <DetailItem
                icon={DollarSign}
                label="Total Amount"
                value={<span className="font-bold text-lg text-slate-50">${transaction.totalAmount.toFixed(2)}</span>}
              />
              <Separator className="my-2 bg-slate-600" />
              <DetailItem icon={CreditCard} label="Amount Paid" value={`$${transaction.amountPaid.toFixed(2)}`} />
              <DetailItem
                icon={DollarSign}
                label="Balance Due"
                value={
                  <span
                    className={cn(
                      "font-bold text-lg",
                      transaction.balanceDue > 0 ? "text-yellow-300" : "text-green-300",
                    )}
                  >
                    ${transaction.balanceDue.toFixed(2)}
                  </span>
                }
              />
            </Card>

            {transaction.notes && (
              <Card className="bg-slate-700/30 border-slate-600 p-4 rounded-md">
                <h3 className="text-md font-semibold text-slate-200 mb-1">Notes from Us</h3>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{transaction.notes}</p>
              </Card>
            )}
            {transaction.paymentInstructions && (
              <Card className="bg-slate-700/30 border-slate-600 p-4 rounded-md">
                <h3 className="text-md font-semibold text-slate-200 mb-1">Payment Instructions</h3>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{transaction.paymentInstructions}</p>
              </Card>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-slate-700 flex flex-col sm:flex-row sm:justify-end sm:space-x-2 gap-2">
          <Button
            variant="outline"
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 w-full sm:w-auto"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button
            variant="outline"
            className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300 w-full sm:w-auto"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <SheetClose asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
