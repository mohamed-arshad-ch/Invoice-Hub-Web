"use client"

import type React from "react"
import { useSelector, useDispatch } from "react-redux"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, Printer, Mail, FileText, DollarSign, CalendarDays, UserCircle, Hash, Info, X, Trash2 } from "lucide-react"
import type { Quotation, QuotationStatus } from "@/lib/types/quotation"
import { selectSelectedQuotation, clearQuotationSelection } from "@/lib/redux/slices/quotationsSlice"
import type { AppDispatch } from "@/lib/redux/store"

interface QuotationDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (quotation: Quotation) => void
  onDelete: (quotationId: string) => void
}

const getStatusBadgeVariant = (
  status: QuotationStatus,
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
  switch (status) {
    case "draft":
      return "secondary"
    case "sent":
      return "default"
    case "accepted":
      return "success"
    case "rejected":
      return "destructive"
    case "expired":
      return "warning"
    case "converted":
      return "outline"
    default:
      return "secondary"
  }
}

const QuotationDetailSheet: React.FC<QuotationDetailSheetProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const quotation = useSelector(selectSelectedQuotation)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(clearQuotationSelection())
      onClose()
    }
  }

  if (!quotation) {
    return null
  }

  const clientName = quotation.client?.business_name || quotation.clientName || "N/A"
  const clientEmail = quotation.client?.email || quotation.clientEmail || "N/A"

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full max-w-2xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl bg-slate-800 border-slate-700 text-slate-50 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-start">
            <SheetTitle className="text-2xl font-semibold text-primary flex items-center" style={{ color: "#3A86FF" }}>
              <FileText className="mr-3 h-6 w-6" /> Quotation Details
            </SheetTitle>
            <Badge variant={getStatusBadgeVariant(quotation.status)} className="text-sm px-3 py-1">
              {quotation.status}
            </Badge>
          </div>
          <SheetDescription className="text-slate-400">
            Viewing quotation <span className="font-semibold text-slate-300">{quotation.quotationNumber}</span>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow p-6">
          <div className="space-y-6">
            {/* Client & Dates Info */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
                  <UserCircle className="mr-2 h-5 w-5 text-secondary" style={{ color: "#8338EC" }} />
                  Client Information
                </h3>
                <p className="text-sm text-slate-300">
                  <strong>Name:</strong> {clientName}
                </p>
                <p className="text-sm text-slate-400">
                  <strong>Email:</strong> {clientEmail}
                </p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5 text-secondary" style={{ color: "#8338EC" }} />
                  Dates & Validity
                </h3>
                <p className="text-sm text-slate-300">
                  <strong>Quotation Date:</strong> {new Date(quotation.quotationDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-300">
                  <strong>Valid Until:</strong> {new Date(quotation.validUntilDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-400">
                  <strong>Currency:</strong> {quotation.currency}
                </p>
              </div>
            </section>

            {/* Items Table */}
            <section>
              <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
                <Hash className="mr-2 h-5 w-5 text-secondary" style={{ color: "#8338EC" }} />
                Quoted Items
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700/70">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                      >
                        Item
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider"
                      >
                        Qty
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider"
                      >
                        Unit Price
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-700/30 divide-y divide-slate-700/50">
                    {quotation.lineItems?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-200">{item.productName}</td>
                        <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">{item.description || "N/A"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-slate-300">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-slate-300">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-slate-200">
                          ${item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Financial Summary */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-700 space-y-3">
                <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
                  <Info className="mr-2 h-5 w-5 text-secondary" style={{ color: "#8338EC" }} />
                  Terms & Notes
                </h3>
                <div>
                  <h4 className="text-sm font-medium text-slate-300">Terms & Conditions:</h4>
                  <p className="text-xs text-slate-400 whitespace-pre-wrap">{quotation.termsAndConditions || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-300">Notes:</h4>
                  <p className="text-xs text-slate-400 whitespace-pre-wrap">{quotation.notes || "N/A"}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-700 space-y-1">
                <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-green-400" />
                  Financial Summary
                </h3>
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Subtotal:</span>
                  <span>${quotation.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>
                    Discount (
                    {quotation.discountType === "percentage"
                      ? `${quotation.discountValue}%`
                      : `$${quotation.discountValue.toFixed(2)}`}
                    ):
                  </span>
                  <span>-${quotation.discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Tax ({quotation.taxRatePercent}%):</span>
                  <span>+${quotation.taxAmount.toFixed(2)}</span>
                </div>
                <div
                  className="flex justify-between text-xl font-bold pt-2 mt-2 border-t border-slate-600 text-primary"
                  style={{ color: "#3A86FF" }}
                >
                  <span>Total Amount:</span>
                  <span>${quotation.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 border-t border-slate-700 flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="ghost" onClick={() => handleOpenChange(false)} className="text-slate-300 hover:bg-slate-700">
            <X className="mr-2 h-4 w-4" /> Close
          </Button>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
              <Printer className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
              <Mail className="mr-2 h-4 w-4" /> Send Email
            </Button>
            {(quotation.status === "draft" || quotation.status === "sent") && (
              <Button
                onClick={() => {
                  onEdit(quotation)
                }}
                className="bg-secondary hover:bg-secondary/90 text-white"
                style={{ backgroundColor: "#8338EC" }}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Quotation
              </Button>
            )}
            {(quotation.status === "draft" || quotation.status === "rejected" || quotation.status === "expired") && (
              <Button
                onClick={() => {
                  onDelete(quotation.id.toString())
                }}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default QuotationDetailSheet
