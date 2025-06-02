"use client"
import { format } from "date-fns"
import type { Invoice } from "@/lib/types/invoice"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Printer, X } from "lucide-react"
import Image from "next/image" // For company logo
import { Separator } from "@/components/ui/separator"

interface InvoicePreviewSheetProps {
  isOpen: boolean
  onClose: () => void
  invoice: Invoice | null
}

export default function InvoicePreviewSheet({ isOpen, onClose, invoice }: InvoicePreviewSheetProps) {
  if (!invoice) return null

  const handlePrint = () => {
    window.print()
  }

  // Dummy company details
  const companyDetails = {
    name: "InvoiceHub Inc.",
    addressLine1: "123 Innovation Drive",
    addressLine2: "Tech City, TC 54321",
    email: "billing@invoicehub.com",
    phone: "(555) 123-4567",
    logoUrl: "/placeholder.svg?height=80&width=150", // Replace with actual logo
  }
  // Dummy client details (should come from client data linked to invoice)
  const clientFullAddress = `${invoice.clientName}\n${invoice.clientEmail || ""}\nClient Address Line 1\nClient City, State ZIP`

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-3xl md:max-w-4xl bg-slate-100 text-slate-900 font-sans flex flex-col p-0 print:bg-white print:text-black print:shadow-none print:border-none print:p-0 print:max-w-full print:h-auto">
        <SheetHeader className="px-6 py-4 bg-slate-200 print:hidden flex flex-row justify-between items-center">
          <SheetTitle className="text-slate-800">Invoice Preview: {invoice.invoiceNumber}</SheetTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="border-slate-400 hover:bg-slate-300">
              <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
            </Button>
            <SheetClose className="p-1 rounded-md hover:bg-slate-300">
              <X className="h-5 w-5 text-slate-600 hover:text-slate-900" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-grow print:overflow-visible print:h-auto">
          <div
            id="invoice-printable-area"
            className="p-8 md:p-12 bg-white text-sm text-slate-800 min-h-screen print:min-h-0 print:p-4"
          >
            {/* Invoice Header */}
            <header className="flex justify-between items-start mb-10">
              <div>
                <Image
                  src={companyDetails.logoUrl || "/placeholder.svg"}
                  alt="Company Logo"
                  width={150}
                  height={50}
                  className="mb-2"
                />
                <p className="font-semibold text-lg">{companyDetails.name}</p>
                <p>{companyDetails.addressLine1}</p>
                <p>{companyDetails.addressLine2}</p>
                <p>Email: {companyDetails.email}</p>
                <p>Phone: {companyDetails.phone}</p>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-slate-900 mb-1">INVOICE</h1>
                <p>
                  <span className="font-semibold">Invoice #:</span> {invoice.invoiceNumber}
                </p>
                <p>
                  <span className="font-semibold">Date Issued:</span>{" "}
                  {format(new Date(invoice.issueDate), "MMMM d, yyyy")}
                </p>
                <p>
                  <span className="font-semibold">Date Due:</span> {format(new Date(invoice.dueDate), "MMMM d, yyyy")}
                </p>
              </div>
            </header>

            {/* Bill To Section */}
            <section className="mb-10">
              <h2 className="text-xs font-semibold uppercase text-slate-500 mb-1">Bill To:</h2>
              <p className="font-semibold text-slate-700">{invoice.clientName}</p>
              {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
              {/* Add more client address details here if available */}
            </section>

            {/* Line Items Table */}
            <section className="mb-8">
              <table className="w-full">
                <thead className="bg-slate-100 print:bg-slate-50">
                  <tr>
                    <th className="p-2 text-left font-semibold text-slate-600">Item/Description</th>
                    <th className="p-2 text-right font-semibold text-slate-600 w-20">Qty</th>
                    <th className="p-2 text-right font-semibold text-slate-600 w-24">Rate</th>
                    <th className="p-2 text-right font-semibold text-slate-600 w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-200 print:border-slate-300">
                      <td className="p-2 align-top">
                        <p className="font-medium text-slate-800">{item.productName}</p>
                        {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                      </td>
                      <td className="p-2 text-right align-top">{item.quantity}</td>
                      <td className="p-2 text-right align-top">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right align-top">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Totals Section */}
            <section className="flex justify-end mb-10">
              <div className="w-full max-w-xs space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="text-slate-800">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax ({invoice.taxRatePercent}%):</span>
                  <span className="text-slate-800">${invoice.taxAmount.toFixed(2)}</span>
                </div>
                <Separator className="my-1 bg-slate-300 print:bg-slate-400" />
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-slate-700">Total:</span>
                  <span className="text-slate-900">${invoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount Paid:</span>
                  <span className="text-slate-800">-${invoice.amountPaid.toFixed(2)}</span>
                </div>
                <Separator className="my-1 bg-slate-300 print:bg-slate-400" />
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-slate-700">Balance Due:</span>
                  <span className="text-slate-900">${invoice.balanceDue.toFixed(2)}</span>
                </div>
              </div>
            </section>

            {/* Notes, Terms, Payment Instructions */}
            {(invoice.notes || invoice.paymentTerms || invoice.paymentInstructions) && (
              <section className="mb-8 space-y-4 text-xs">
                {invoice.paymentTerms && (
                  <div>
                    <h3 className="font-semibold text-slate-600 mb-0.5">Payment Terms:</h3>
                    <p className="text-slate-500">{invoice.paymentTerms}</p>
                  </div>
                )}
                {invoice.notes && (
                  <div>
                    <h3 className="font-semibold text-slate-600 mb-0.5">Notes:</h3>
                    <p className="text-slate-500 whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
                {invoice.paymentInstructions && (
                  <div>
                    <h3 className="font-semibold text-slate-600 mb-0.5">Payment Instructions:</h3>
                    <p className="text-slate-500 whitespace-pre-wrap">{invoice.paymentInstructions}</p>
                  </div>
                )}
              </section>
            )}

            {/* Footer */}
            <footer className="text-center text-xs text-slate-400 pt-8 border-t border-slate-200 print:border-slate-300">
              <p>Thank you for your business!</p>
              <p>
                {companyDetails.name} | {companyDetails.email} | {companyDetails.phone}
              </p>
            </footer>
          </div>
        </ScrollArea>
        <style jsx global>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                #invoice-printable-area, #invoice-printable-area * {
                    visibility: visible;
                }
                #invoice-printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: auto;
                    margin: 0;
                    padding: 1cm; /* Adjust padding for print */
                    font-size: 10pt; /* Adjust font size for print */
                    box-shadow: none !important;
                    border: none !important;
                }
                .print\:hidden { display: none !important; }
                .print\:bg-white { background-color: white !important; }
                .print\:text-black { color: black !important; }
                .print\:shadow-none { box-shadow: none !important; }
                .print\:border-none { border: none !important; }
                .print\:p-0 { padding: 0 !important; }
                .print\:max-w-full { max-width: 100% !important; }
                .print\:h-auto { height: auto !important; }
                .print\:overflow-visible { overflow: visible !important; }
                .print\:min-h-0 { min-height: 0 !important; }
                .print\:p-4 { padding: 16px !important; } /* Example: specific padding for print */
                .print\:bg-slate-50 { background-color: #f8fafc !important; } /* Tailwind slate-50 */
                .print\:border-slate-300 { border-color: #cbd5e1 !important; } /* Tailwind slate-300 */
                 .print\:text-slate-400 { color: #94a3b8 !important; } /* Tailwind slate-400 */
            }
        `}</style>
      </SheetContent>
    </Sheet>
  )
}
