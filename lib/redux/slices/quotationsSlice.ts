import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Quotation, CreateQuotationRequest, UpdateQuotationRequest, QuotationStatus } from "@/lib/types/quotation"
import type { RootState } from "../store"

interface QuotationsState {
  quotations: Quotation[]
  selectedQuotation: Quotation | null
  isLoading: boolean
  error: string | null
  filters: {
    status: QuotationStatus | "all"
    client: string | "all"
    dateRange: { from?: Date; to?: Date }
  }
  nextQuotationNumber: number
}

const initialState: QuotationsState = {
  quotations: [],
  selectedQuotation: null,
  isLoading: false,
  error: null,
  filters: {
    status: "all",
    client: "all",
    dateRange: {}
  },
  nextQuotationNumber: 1
}

// Generate quotation number
export function generateQuotationNumber(nextNumber: number): string {
  const year = new Date().getFullYear()
  const paddedNumber = String(nextNumber).padStart(4, "0")
  return `QUO-${year}-${paddedNumber}`
}

// Calculate totals for quotations
export function calculateQuotationTotals(lineItems: any[], taxRatePercent: number, discountType: "percentage" | "fixed" = "percentage", discountValue: number = 0) {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)
  
  let discountAmount = 0
  if (discountType === "percentage") {
    discountAmount = (subtotal * discountValue) / 100
  } else {
    discountAmount = discountValue
  }
  
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * taxRatePercent) / 100
  const totalAmount = taxableAmount + taxAmount
  
  return {
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount
  }
}

// Async thunks for API calls
export const fetchQuotations = createAsyncThunk(
  "quotations/fetchQuotations",
  async (params: { page?: number; limit?: number; status?: string; clientId?: string } = {}) => {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append("page", params.page.toString())
    if (params.limit) searchParams.append("limit", params.limit.toString())
    if (params.status && params.status !== "all") searchParams.append("status", params.status)
    if (params.clientId && params.clientId !== "all") searchParams.append("clientId", params.clientId)

    const response = await fetch(`/api/quotations?${searchParams}`)
    if (!response.ok) {
      throw new Error("Failed to fetch quotations")
    }
    return response.json()
  }
)

export const createQuotation = createAsyncThunk(
  "quotations/createQuotation",
  async (quotationData: CreateQuotationRequest) => {
    const response = await fetch("/api/quotations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotationData)
    })
    
    if (!response.ok) {
      throw new Error("Failed to create quotation")
    }
    return response.json()
  }
)

export const fetchQuotationDetails = createAsyncThunk(
  "quotations/fetchQuotationDetails",
  async (id: number) => {
    const response = await fetch("/api/quotations/details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action: "get", id })
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch quotation details")
    }
    return response.json()
  }
)

export const updateQuotation = createAsyncThunk(
  "quotations/updateQuotation",
  async ({ id, ...updateData }: UpdateQuotationRequest) => {
    const response = await fetch("/api/quotations/details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action: "update", id, ...updateData })
    })
    
    if (!response.ok) {
      throw new Error("Failed to update quotation")
    }
    return response.json()
  }
)

export const deleteQuotation = createAsyncThunk(
  "quotations/deleteQuotation",
  async (id: number) => {
    const response = await fetch("/api/quotations/details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action: "delete", id })
    })
    
    if (!response.ok) {
      throw new Error("Failed to delete quotation")
    }
    return { id }
  }
)

const quotationsSlice = createSlice({
  name: "quotations",
  initialState,
  reducers: {
    setSelectedQuotation: (state, action: PayloadAction<Quotation | null>) => {
      state.selectedQuotation = action.payload
    },
    setQuotationFilters: (state, action: PayloadAction<Partial<QuotationsState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearQuotationSelection: (state) => {
      state.selectedQuotation = null
    },
    clearQuotationError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch quotations
      .addCase(fetchQuotations.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.isLoading = false
        state.quotations = action.payload.quotations
        // Update next quotation number based on existing quotations
        const lastQuotationNumber = state.quotations.length > 0 
          ? Math.max(...state.quotations.map(q => parseInt(q.quotationNumber.split("-").pop() || "0")))
          : 0
        state.nextQuotationNumber = lastQuotationNumber + 1
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to fetch quotations"
      })
      
      // Create quotation
      .addCase(createQuotation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.isLoading = false
        state.quotations.unshift(action.payload.quotation)
        state.nextQuotationNumber += 1
      })
      .addCase(createQuotation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to create quotation"
      })
      
      // Fetch quotation details
      .addCase(fetchQuotationDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchQuotationDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedQuotation = action.payload.quotation
      })
      .addCase(fetchQuotationDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to fetch quotation details"
      })
      
      // Update quotation
      .addCase(updateQuotation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateQuotation.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.quotations.findIndex(q => q.id === action.payload.quotation.id)
        if (index !== -1) {
          state.quotations[index] = action.payload.quotation
        }
        if (state.selectedQuotation?.id === action.payload.quotation.id) {
          state.selectedQuotation = action.payload.quotation
        }
      })
      .addCase(updateQuotation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to update quotation"
      })
      
      // Delete quotation
      .addCase(deleteQuotation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteQuotation.fulfilled, (state, action) => {
        state.isLoading = false
        state.quotations = state.quotations.filter(q => q.id !== action.payload.id)
        if (state.selectedQuotation?.id === action.payload.id) {
          state.selectedQuotation = null
        }
      })
      .addCase(deleteQuotation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to delete quotation"
      })
  }
})

export const {
  setSelectedQuotation,
  setQuotationFilters,
  clearQuotationSelection,
  clearQuotationError
} = quotationsSlice.actions

// Selectors
export const selectQuotations = (state: RootState) => state.quotations.quotations
export const selectSelectedQuotation = (state: RootState) => state.quotations.selectedQuotation
export const selectQuotationsLoading = (state: RootState) => state.quotations.isLoading
export const selectQuotationsError = (state: RootState) => state.quotations.error
export const selectQuotationFilters = (state: RootState) => state.quotations.filters
export const selectNextQuotationNumber = (state: RootState) => state.quotations.nextQuotationNumber

export default quotationsSlice.reducer
