import type { Staff } from "./staff"
import type { Product } from "./product"

export enum OutgoingPaymentMethod {
  Cash = "Cash",
  Card = "Card",
  BankTransfer = "Bank Transfer",
  Cheque = "Cheque",
  Online = "Online Payment",
  DirectDebit = "Direct Debit",
  Other = "Other",
}

export enum OutgoingPaymentStatus {
  Scheduled = "Scheduled",
  Paid = "Paid",
  Failed = "Failed",
  Cancelled = "Cancelled",
  Processing = "Processing",
}

export enum OutgoingPaymentCategory {
  EXPENSE_PAYMENT = "Expense Payment",
  STAFF_SALARY = "Staff Salary",
  CLOUD_SUBSCRIPTION = "Cloud Subscription",
  OTHER_OUTGOING = "Other Outgoing Payment",
}

export interface ExpenseCategoryType {
  id: number
  name: string
  description?: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface OutgoingPaymentType {
  id: number
  paymentNumber: string
  paymentCategory: OutgoingPaymentCategory
  expenseCategoryId?: number | null
  staffId?: number | null
  staff?: Staff | null
  productId?: number | null
  product?: Product | null
  payeeName?: string | null
  amount: number
  paymentDate: string
  paymentMethod: OutgoingPaymentMethod
  referenceNumber?: string
  status: OutgoingPaymentStatus
  notes?: string
  attachments?: Array<{ name: string; url: string; type: string }>
  createdBy: number
  createdAt: string
  updatedAt: string
  expenseCategory?: ExpenseCategoryType | null
}

export type OutgoingPaymentFormValues = Omit<
  OutgoingPaymentType,
  "id" | "paymentNumber" | "staff" | "product" | "expenseCategory" | "createdAt" | "updatedAt" | "createdBy"
>

export interface CreateOutgoingPaymentRequest {
  paymentCategory: OutgoingPaymentCategory
  expenseCategoryId?: number
  staffId?: number
  productId?: number
  payeeName?: string
  amount: number
  paymentDate: string
  paymentMethod: OutgoingPaymentMethod
  referenceNumber?: string
  status: OutgoingPaymentStatus
  notes?: string
  attachments?: Array<{ name: string; url: string; type: string }>
}

export interface UpdateOutgoingPaymentRequest extends CreateOutgoingPaymentRequest {
  id: number
} 