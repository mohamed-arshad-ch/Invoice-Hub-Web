// Ensure InvoiceStatus is an enum and exported
export enum InvoiceStatus {
  Draft = "draft",
  Sent = "sent",
  Paid = "paid",
  Overdue = "overdue",
  Cancelled = "cancelled",
  PendingPayment = "pending_payment", // A status for partially paid or awaiting payment confirmation
}

export interface InvoiceLineItem {
  id: string
  productId: string | null // Can be null for custom items
  productName: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  clientName: string // Denormalized for easier display
  clientEmail?: string // Denormalized
  issueDate: string // ISO Date string
  dueDate: string // ISO Date string
  lineItems: InvoiceLineItem[]
  subtotal: number
  taxRatePercent: number // Store the percentage used for calculation
  taxAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number // This should be a getter or calculated field in the slice if not stored
  status: InvoiceStatus
  paymentTerms?: string
  paymentInstructions?: string
  notes?: string
  createdAt: string // ISO Date string
  updatedAt: string // ISO Date string
}

// For the form, especially before an invoice is fully created
export interface InvoiceFormValues
  extends Omit<
    Invoice,
    "id" | "invoiceNumber" | "createdAt" | "updatedAt" | "subtotal" | "taxAmount" | "totalAmount" | "balanceDue"
  > {
  // Line items might have a slightly different structure during form input if needed
  // For example, if product selection is an object before becoming just an ID
}
