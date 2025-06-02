import type { Client } from "./client"

export interface QuotationLineItem {
  id?: number
  quotationId?: number
  productId?: number | null
  productName: string
  description?: string
  quantity: number
  unitPrice: number
  amount: number
}

export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted"

export interface Quotation {
  id: number
  quotationNumber: string
  clientId: number
  clientName: string
  clientEmail?: string
  quotationDate: string
  validUntilDate: string
  subtotal: number
  discountType: "percentage" | "fixed"
  discountValue: number
  discountAmount: number
  taxRatePercent: number
  taxAmount: number
  totalAmount: number
  status: QuotationStatus
  currency: string
  termsAndConditions?: string
  notes?: string
  createdBy: number
  createdAt: string
  updatedAt: string
  lineItems?: QuotationLineItem[]
  client?: Client
}

// API request/response types
export interface CreateQuotationRequest {
  clientId: number
  quotationDate: string
  validUntilDate: string
  lineItems: Array<{
    productId?: number | null
    productName: string
    description?: string
    quantity: number
    unitPrice: number
  }>
  discountType: "percentage" | "fixed"
  discountValue: number
  taxRatePercent: number
  status: QuotationStatus
  currency: string
  termsAndConditions?: string
  notes?: string
}

export interface UpdateQuotationRequest extends Partial<CreateQuotationRequest> {
  id: number
}

export interface QuotationListResponse {
  quotations: Quotation[]
  total: number
  page: number
  limit: number
}

export interface QuotationDetailResponse {
  quotation: Quotation
}

// Legacy types for backward compatibility
export interface QuotationItemType extends QuotationLineItem {
  totalPrice: number // alias for amount
}

export interface QuotationType extends Omit<Quotation, 'id' | 'lineItems'> {
  id: string
  items: QuotationItemType[]
  subTotal: number // alias for subtotal
  taxRate: number // alias for taxRatePercent
}
