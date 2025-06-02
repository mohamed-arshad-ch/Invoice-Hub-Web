import type { StaffType } from "./staff"
import type { ProductType } from "./product"

export enum PaymentMethod {
  Cash = "Cash",
  Card = "Card",
  BankTransfer = "Bank Transfer",
  Cheque = "Cheque",
  Online = "Online Payment",
  DirectDebit = "Direct Debit",
  Other = "Other",
}

export enum PaymentStatus {
  // For outgoing payments
  Scheduled = "Scheduled",
  Paid = "Paid",
  Failed = "Failed",
  Cancelled = "Cancelled",
  Processing = "Processing", // Added for outgoing payments that take time
}

export enum PaymentCategory {
  // CLIENT_PAYMENT = "Client Payment (Incoming)", // Removed
  EXPENSE_PAYMENT = "Expense Payment",
  STAFF_SALARY = "Staff Salary",
  CLOUD_SUBSCRIPTION = "Cloud Subscription",
  OTHER_OUTGOING = "Other Outgoing Payment",
}

// PaymentAllocation is likely not needed if payments are purely outgoing and not tied to specific incoming invoices.
// If there's a scenario where an outgoing payment might be linked to an expense invoice you've received,
// then a similar concept might apply, but for now, let's assume it's not needed for outgoing.
// export interface PaymentAllocation {
//   invoiceId: string;
//   invoiceNumber?: string;
//   amountApplied: number;
// }

export interface PaymentType {
  id: string
  paymentNumber: string // Auto-generated
  paymentCategory: PaymentCategory // New field

  // Fields for outgoing payments
  expenseCategoryId?: string | null
  staffId?: string | null
  staff?: StaffType | null
  productId?: string | null // ID of the subscribed product/service
  product?: ProductType | null
  payeeName?: string | null // For 'Other' or if no specific entity

  // Client and Invoice fields are removed as primary attributes for outgoing payments.
  // If an outgoing payment *could* be associated with a client (e.g., a refund not processed via receipt system),
  // you might add an optional clientId here. For now, keeping it clean for pure outgoing.
  // clientId?: string | null;
  // client?: ClientType | null;

  amount: number
  paymentDate: string // ISO Date string
  paymentMethod: PaymentMethod
  referenceNumber?: string // e.g., transaction ID, cheque number
  status: PaymentStatus
  notes?: string
  attachments?: Array<{ name: string; url: string; type: string }>
  createdBy?: string // User ID
  createdAt: string // ISO Date string
  updatedAt: string // ISO Date string
}

export type PaymentFormValues = Omit<
  PaymentType,
  "id" | "paymentNumber" | "staff" | "product" | "createdAt" | "updatedAt" | "createdBy"
> & {
  // No selectedClient or selectedInvoices needed as primary form values anymore
}

export interface ExpenseCategoryType {
  id: string
  name: string
  description?: string
}
