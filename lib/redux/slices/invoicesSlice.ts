import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
// Correctly import InvoiceStatus as a value, and others as types where appropriate
import { InvoiceStatus, type Invoice, type InvoiceLineItem } from "@/lib/types/invoice"
import type { RootState } from "../store"

// Helper function to calculate totals
export const calculateTotals = (
  lineItems: InvoiceLineItem[],
  taxRatePercent = 0,
): { subtotal: number; taxAmount: number; totalAmount: number } => {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  const taxAmount = subtotal * (taxRatePercent / 100)
  const totalAmount = subtotal + taxAmount
  return { subtotal, taxAmount, totalAmount }
}

// Helper function to generate invoice number
export const generateInvoiceNumber = (currentNumber: number): string => {
  const year = new Date().getFullYear()
  return `INV-${year}-${String(currentNumber).padStart(4, "0")}`
}

interface InvoicesState {
  invoices: Invoice[]
  selectedInvoice: Invoice | null
  isLoading: boolean
  error: string | null
  nextInvoiceNumber: number
  currentFilters: {
    searchTerm: string
    status: InvoiceStatus | null
    dateRange: { from: Date | undefined; to: Date | undefined } | null
    client: string | null
  }
}

const initialState: InvoicesState = {
  invoices: [],
  selectedInvoice: null,
  isLoading: false,
  error: null,
  nextInvoiceNumber: 1,
  currentFilters: {
    searchTerm: "",
    status: null,
    dateRange: null,
    client: null,
  },
}

// Async Thunks for API calls
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/invoices')
      const result = await response.json()
      
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      
      return result.data
    } catch (error) {
      return rejectWithValue('Failed to fetch invoices')
    }
  }
)

export const addInvoice = createAsyncThunk(
  'invoices/addInvoice',
  async (invoiceData: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })
      const result = await response.json()
      
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      
      return result.data
    } catch (error) {
      return rejectWithValue('Failed to create invoice')
    }
  }
)

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ id, ...invoiceData }: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...invoiceData }),
      })
      const result = await response.json()
      
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      
      return result.data
    } catch (error) {
      return rejectWithValue('Failed to update invoice')
    }
  }
)

export const deleteInvoice = createAsyncThunk(
  'invoices/deleteInvoice',
  async (invoiceId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/invoices?id=${invoiceId}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      
      return invoiceId
    } catch (error) {
      return rejectWithValue('Failed to delete invoice')
    }
  }
)

export const fetchInvoiceDetails = createAsyncThunk(
  'invoices/fetchInvoiceDetails',
  async (invoiceId: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/invoices/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get', id: invoiceId }),
      })
      const result = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to fetch invoice details')
      }
      
      return result.invoice
    } catch (error) {
      return rejectWithValue('Failed to fetch invoice details')
    }
  }
)

export const updateInvoiceDetails = createAsyncThunk(
  'invoices/updateInvoiceDetails',
  async ({ id, ...invoiceData }: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/invoices/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'update', id, ...invoiceData }),
      })
      const result = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to update invoice')
      }
      
      return result.invoice
    } catch (error) {
      return rejectWithValue('Failed to update invoice')
    }
  }
)

export const deleteInvoiceDetails = createAsyncThunk(
  'invoices/deleteInvoiceDetails',
  async (invoiceId: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/invoices/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'delete', id: invoiceId }),
      })
      const result = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to delete invoice')
      }
      
      return invoiceId
    } catch (error) {
      return rejectWithValue('Failed to delete invoice')
    }
  }
)

const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    setInvoicesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action: PayloadAction<Partial<InvoicesState["currentFilters"]>>) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload }
    },
    clearFilters: (state) => {
      state.currentFilters = {
        searchTerm: "",
        status: null,
        dateRange: null,
        client: null,
      }
    },
    updateInvoiceStatus: (state, action: PayloadAction<{ id: string; status: InvoiceStatus }>) => {
      const invoice = state.invoices.find((inv) => inv.id === action.payload.id)
      if (invoice) {
        invoice.status = action.payload.status
        invoice.updatedAt = new Date().toISOString()
      }
    },
    setSelectedInvoice: (state, action: PayloadAction<Invoice>) => {
      state.selectedInvoice = action.payload
    },
    clearInvoiceSelection: (state) => {
      state.selectedInvoice = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false
        state.invoices = action.payload
        // Update next invoice number based on existing invoices
        if (action.payload.length > 0) {
          const maxNumber = Math.max(...action.payload.map((inv: any) => {
            const match = inv.invoiceNumber.match(/INV-\d{4}-(\d+)/)
            return match ? parseInt(match[1]) : 0
          }))
          state.nextInvoiceNumber = maxNumber + 1
        }
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Add invoice
      .addCase(addInvoice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addInvoice.fulfilled, (state, action) => {
        state.isLoading = false
        state.invoices.unshift(action.payload)
        state.nextInvoiceNumber++
      })
      .addCase(addInvoice.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update invoice
      .addCase(updateInvoice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.invoices.findIndex((invoice) => invoice.id === action.payload.id)
        if (index !== -1) {
          state.invoices[index] = action.payload
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete invoice
      .addCase(deleteInvoice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.isLoading = false
        state.invoices = state.invoices.filter((invoice) => invoice.id !== action.payload.toString())
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch invoice details
      .addCase(fetchInvoiceDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInvoiceDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedInvoice = action.payload
      })
      .addCase(fetchInvoiceDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update invoice details
      .addCase(updateInvoiceDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateInvoiceDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedInvoice = action.payload
        // Also update in the main invoices list
        const index = state.invoices.findIndex((invoice) => invoice.id === action.payload.id)
        if (index !== -1) {
          state.invoices[index] = action.payload
        }
      })
      .addCase(updateInvoiceDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete invoice details
      .addCase(deleteInvoiceDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteInvoiceDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedInvoice = null
        state.invoices = state.invoices.filter((invoice) => invoice.id !== action.payload.toString())
      })
      .addCase(deleteInvoiceDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { 
  setInvoicesLoading, 
  clearError, 
  setFilters, 
  clearFilters, 
  updateInvoiceStatus,
  setSelectedInvoice,
  clearInvoiceSelection
} = invoicesSlice.actions

// Selectors
export const selectAllInvoices = (state: RootState) => state.invoices.invoices
export const selectSelectedInvoice = (state: RootState) => state.invoices.selectedInvoice
export const selectInvoiceById = (state: RootState, invoiceId: string) =>
  state.invoices.invoices.find((invoice) => invoice.id === invoiceId)
export const selectInvoicesLoading = (state: RootState) => state.invoices.isLoading
export const selectInvoicesError = (state: RootState) => state.invoices.error
export const selectNextInvoiceNumber = (state: RootState) => state.invoices.nextInvoiceNumber
export const selectInvoiceFilters = (state: RootState) => state.invoices.currentFilters

export const selectInvoicesByClientId = (state: RootState, clientId: string | null | undefined) => {
  if (!clientId) return []
  return state.invoices.invoices.filter((invoice) => invoice.clientId === clientId)
}

export const selectUnpaidInvoicesByClientId = (state: RootState, clientId: string | null | undefined) => {
  if (!clientId) return []
  return state.invoices.invoices.filter(
    (invoice) => invoice.clientId === clientId && invoice.balanceDue > 0
  )
}

export const selectFilteredInvoices = (state: RootState) => {
  const { invoices, currentFilters } = state.invoices
  
  return invoices.filter((invoice) => {
    let passes = true
    
    if (currentFilters.searchTerm) {
      const term = currentFilters.searchTerm.toLowerCase()
      passes = passes && (
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.clientName.toLowerCase().includes(term)
      )
    }
    
    if (currentFilters.status) {
      passes = passes && invoice.status === currentFilters.status
    }
    
    if (currentFilters.client) {
      passes = passes && invoice.clientId === currentFilters.client
    }
    
    if (currentFilters.dateRange?.from) {
      passes = passes && new Date(invoice.issueDate) >= currentFilters.dateRange.from
    }
    
    if (currentFilters.dateRange?.to) {
      passes = passes && new Date(invoice.issueDate) <= currentFilters.dateRange.to
    }
    
    return passes
  })
}

export default invoicesSlice.reducer
