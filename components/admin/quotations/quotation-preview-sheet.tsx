"use client"

import type React from "react"
import { useSelector, useDispatch } from "react-redux"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Printer, Download } from "lucide-react"
import { selectSelectedQuotation } from "@/lib/redux/slices/quotationsSlice" // Assuming you'll use selectedQuotation for preview
import { selectClientById } from "@/lib/redux/slices/clientsSlice"
import type { AppDispatch, RootState } from "@/lib/redux/store"

// This component is a placeholder and needs a proper layout for the quotation document.
// For now, it will show basic details.

interface QuotationPreviewSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  // quotation: QuotationType | null; // Could pass quotation directly or use Redux state
}

const QuotationPreviewSheet: React.FC<QuotationPreviewSheetProps> = ({ isOpen, onOpenChange }) => {
  const dispatch = useDispatch<AppDispatch>()
  const quotation = useSelector(selectSelectedQuotation) // Using selectedQuotation for preview
  const client = useSelector((state: RootState) => (quotation ? selectClientById(state, quotation.clientId) : null))

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Optionally clear selection if preview is tied to selectedQuotation
      // dispatch(clearQuotationSelection());
    }
    onOpenChange(open)
  }

  if (!quotation) {
    return null
  }

  // Placeholder for company details - ideally from settings or a dedicated slice
  const companyDetails = {
    name: "Your Company LLC",
    address: "123 Business Rd, Suite 456, City, State, 78900",
    phone: "(555) 123-4567",
    email: "contact@yourcompany.com",
    logoUrl: "/placeholder.svg?width=150&height=50", // Replace with actual logo
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full max-w-3xl sm:max-w-3xl md:max-w-4xl lg:max-w-[900px] bg-slate-100 text-slate-900 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-slate-200">
          <SheetTitle className="text-2xl font-semibold text-primary" style={{ color: "#3A86FF" }}>
            Quotation Preview: {quotation.quotationNumber}
          </SheetTitle>
          <SheetDescription className="text-slate-600">
            Review the quotation before sending or downloading.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow p-8 bg-white" id="quotation-preview-content">
          {/* Actual Quotation Document Layout */}
          <div className="font-sans text-sm">
            {/* Header: Company Logo & Details, Quotation Title */}
            <header className="flex justify-between items-start mb-8 pb-4 border-b">
              <div>
                <img
                  src={companyDetails.logoUrl || "/placeholder.svg"}
                  alt={companyDetails.name}
                  className="h-12 mb-2"
                />
                <p className="font-semibold text-lg">{companyDetails.name}</p>
                <p className="text-xs text-slate-600">{companyDetails.address}</p>
                <p className="text-xs text-slate-600">
                  Phone: {companyDetails.phone} | Email: {companyDetails.email}
                </p>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-primary uppercase" style={{ color: "#3A86FF" }}>
                  Quotation
                </h1>
                <p className="text-slate-700">
                  <strong>Number:</strong> {quotation.quotationNumber}
                </p>
                <p className="text-slate-700">
                  <strong>Date:</strong> {new Date(quotation.quotationDate).toLocaleDateString()}
                </p>
                <p className="text-slate-700">
                  <strong>Valid Until:</strong> {new Date(quotation.validUntilDate).toLocaleDateString()}
                </p>
              </div>
            </header>

            {/* Client Details */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold uppercase text-slate-500 mb-1">Bill To:</h2>
              <p className="font-semibold text-slate-800">{client?.name || "N/A"}</p>
              {client?.company && <p className="text-slate-700">{client.company}</p>}
              {/* Add client address if available */}
              <p className="text-slate-700">{client?.email || "N/A"}</p>
            </section>

            {/* Items Table */}
            <section className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-200">
                    <th className="p-2 text-left font-semibold text-slate-700 border-b">#</th>
                    <th className="p-2 text-left font-semibold text-slate-700 border-b">Item & Description</th>
                    <th className="p-2 text-right font-semibold text-slate-700 border-b">Qty</th>
                    <th className="p-2 text-right font-semibold text-slate-700 border-b">Unit Price</th>
                    <th className="p-2 text-right font-semibold text-slate-700 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, index) => (
                    <tr key={item.id} className="border-b last:border-b-0">
                      <td className="p-2 align-top">{index + 1}</td>
                      <td className="p-2 align-top">
                        <p className="font-medium text-slate-800">{item.productName}</p>
                        <p className="text-xs text-slate-600">{item.description}</p>
                      </td>
                      <td className="p-2 text-right align-top">{item.quantity}</td>
                      <td className="p-2 text-right align-top">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right align-top font-medium">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Totals Section */}
            <section className="flex justify-end mb-8">
              <div className="w-full max-w-xs space-y-1">
                <div className="flex justify-between text-slate-700">
                  <p>Subtotal:</p>
                  <p>${quotation.subTotal.toFixed(2)}</p>
                </div>
                {quotation.discountAmount > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <p>
                      Discount ({quotation.discountType === "percentage" ? `${quotation.discountValue}%` : "Fixed"}):
                    </p>
                    <p>-${quotation.discountAmount.toFixed(2)}</p>
                  </div>
                )}
                {quotation.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <p>Tax ({quotation.taxRate}%):</p>
                    <p>+${quotation.taxAmount.toFixed(2)}</p>
                  </div>
                )}
                <div
                  className="flex justify-between font-bold text-lg pt-2 border-t text-primary"
                  style={{ color: "#3A86FF" }}
                >
                  <p>Total ({quotation.currency}):</p>
                  <p>${quotation.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </section>

            {/* Terms & Notes */}
            {quotation.termsAndConditions && (
              <section className="mb-4">
                <h3 className="font-semibold text-slate-700 mb-1">Terms & Conditions:</h3>
                <p className="text-xs text-slate-600 whitespace-pre-wrap">{quotation.termsAndConditions}</p>
              </section>
            )}
            {quotation.notes && (
              <section className="mb-8">
                <h3 className="font-semibold text-slate-700 mb-1">Notes:</h3>
                <p className="text-xs text-slate-600 whitespace-pre-wrap">{quotation.notes}</p>
              </section>
            )}

            {/* Footer */}
            <footer className="text-center text-xs text-slate-500 pt-8 border-t">
              <p>Thank you for your business!</p>
              <p>
                {companyDetails.name} | {companyDetails.phone} | {companyDetails.email}
              </p>
            </footer>
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 border-t bg-slate-200 flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="ghost" onClick={() => handleOpenChange(false)} className="text-slate-700 hover:bg-slate-300">
            <X className="mr-2 h-4 w-4" /> Close Preview
          </Button>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="border-slate-400 text-slate-700 hover:bg-slate-300">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white" style={{ backgroundColor: "#3A86FF" }}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default QuotationPreviewSheet
