// No changes needed here based on the immediate request,
// but ensure the mock API and types align with the form's outgoing-only nature.
// The previous version of paymentsSlice.ts already had logic to handle different categories.
// Just ensure `PaymentCategory.CLIENT_PAYMENT` is not used when creating new mock payments
// unless you have a specific reason for it outside this form.
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import {
  type PaymentType,
  type PaymentFormValues,
  PaymentStatus,
  PaymentMethod,
  PaymentCategory,
} from "@/lib/types/payment"
import type { RootState } from "../store"
import type { StaffType } from "@/lib/types/staff" // For populating staff details
import type { ProductType } from "@/lib/types/product" // For populating product details

// MOCK EXPENSE CATEGORIES
const mockExpenseCategories = [
  { id: "exp_cat_1", name: "Office Supplies" },
  { id: "exp_cat_2", name: "Travel & Accommodation" },
  { id: "exp_cat_3", name: "Software & Subscriptions" },
  { id: "exp_cat_4", name: "Utilities" },
  { id: "exp_cat_5", name: "Marketing & Advertising" },
]

// Assume staff and product data are available (e.g., from their respective slices or a combined source)
// For simplicity, we'll just use IDs here. In a real app, you'd populate these.
const mockStaff: StaffType[] = [
  {
    id: "staff_1",
    name: "John Doe",
    employeeId: "EMP001",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    department: "Sales",
    role: "Manager",
    status: "Active",
    joiningDate: "2022-01-15",
    avatarUrl: "/placeholder.svg?width=100&height=100",
  },
  {
    id: "staff_2",
    name: "Jane Smith",
    employeeId: "EMP002",
    email: "jane.smith@example.com",
    phone: "987-654-3210",
    department: "Engineering",
    role: "Developer",
    status: "Active",
    joiningDate: "2021-06-01",
    avatarUrl: "/placeholder.svg?width=100&height=100",
  },
]

const mockProducts: ProductType[] = [
  {
    id: "prod_saas_1",
    name: "Cloud Platform Pro",
    category: "Subscription",
    price: 99.99,
    description: "Premium cloud services subscription.",
    stock: 0,
    unit: "Monthly",
  },
  {
    id: "prod_saas_2",
    name: "Analytics Suite Basic",
    category: "Subscription",
    price: 29.99,
    description: "Basic analytics tools.",
    stock: 0,
    unit: "Monthly",
  },
]

const fetchPaymentsAPI = async (filters?: PaymentsState["currentFilters"]): Promise<PaymentType[]> => {
  console.log("Fetching payments with filters:", filters)
  await new Promise((resolve) => setTimeout(resolve, 1000))
  let filtered = [...mockPayments]

  if (filters?.status && filters.status !== "All") {
    filtered = filtered.filter((p) => p.status === filters.status)
  }
  if (filters?.paymentMethod && filters.paymentMethod !== "All") {
    filtered = filtered.filter((p) => p.paymentMethod === filters.paymentMethod)
  }
  if (filters?.paymentCategory && filters.paymentCategory !== "All") {
    filtered = filtered.filter((p) => p.paymentCategory === filters.paymentCategory)
  }
  // Client filter is removed as payments are outgoing
  if (filters?.dateRange?.from) {
    filtered = filtered.filter((p) => new Date(p.paymentDate) >= new Date(filters.dateRange!.from!))
  }
  if (filters?.dateRange?.to) {
    filtered = filtered.filter((p) => new Date(p.paymentDate) <= new Date(filters.dateRange!.to!))
  }
  if (filters?.searchTerm) {
    const searchTermLower = filters.searchTerm.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.paymentNumber.toLowerCase().includes(searchTermLower) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchTermLower)) ||
        p.notes?.toLowerCase().includes(searchTermLower) ||
        p.staff?.name?.toLowerCase().includes(searchTermLower) || // Search by populated staff name
        p.product?.name?.toLowerCase().includes(searchTermLower) || // Search by populated product name
        (p.payeeName && p.payeeName.toLowerCase().includes(searchTermLower)),
    )
  }
  return filtered.map((p) => {
    // Populate staff and product for display
    if (p.staffId) p.staff = mockStaff.find((s) => s.id === p.staffId) || null
    if (p.productId) p.product = mockProducts.find((pr) => pr.id === p.productId) || null
    return p
  })
}

const addPaymentAPI = async (paymentData: PaymentFormValues): Promise<PaymentType> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const newPaymentBase = {
    id: `pay_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    paymentNumber: `PMT-${Date.now().toString().slice(-6)}`,
    amount: paymentData.amount,
    paymentDate: paymentData.paymentDate,
    paymentMethod: paymentData.paymentMethod,
    referenceNumber: paymentData.referenceNumber,
    status: paymentData.status || PaymentStatus.Scheduled, // Default for outgoing
    notes: paymentData.notes,
    attachments: paymentData.attachments,
    paymentCategory: paymentData.paymentCategory,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  let specificData = {}
  switch (paymentData.paymentCategory) {
    case PaymentCategory.EXPENSE_PAYMENT:
      specificData = { expenseCategoryId: paymentData.expenseCategoryId || null, payeeName: paymentData.payeeName }
      break
    case PaymentCategory.STAFF_SALARY:
      specificData = { staffId: paymentData.staffId || null }
      break
    case PaymentCategory.CLOUD_SUBSCRIPTION:
      specificData = { productId: paymentData.productId || null, payeeName: paymentData.payeeName }
      break
    case PaymentCategory.OTHER_OUTGOING:
      specificData = { payeeName: paymentData.payeeName || null }
      break
  }

  const newPayment: PaymentType = { ...newPaymentBase, ...specificData } as PaymentType
  if (newPayment.staffId) newPayment.staff = mockStaff.find((s) => s.id === newPayment.staffId) || null
  if (newPayment.productId) newPayment.product = mockProducts.find((pr) => pr.id === newPayment.productId) || null

  mockPayments.unshift(newPayment)
  return newPayment
}

const updatePaymentAPI = async (paymentData: PaymentType): Promise<PaymentType> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const index = mockPayments.findIndex((p) => p.id === paymentData.id)
  if (index !== -1) {
    const updatedPayment = {
      ...mockPayments[index],
      ...paymentData,
      updatedAt: new Date().toISOString(),
    }

    // Clear fields not relevant to the current category
    if (updatedPayment.paymentCategory !== PaymentCategory.EXPENSE_PAYMENT) {
      delete updatedPayment.expenseCategoryId
    }
    if (updatedPayment.paymentCategory !== PaymentCategory.STAFF_SALARY) {
      delete updatedPayment.staffId
      delete updatedPayment.staff // Also clear populated object
    }
    if (updatedPayment.paymentCategory !== PaymentCategory.CLOUD_SUBSCRIPTION) {
      delete updatedPayment.productId
      delete updatedPayment.product // Also clear populated object
    }
    if (updatedPayment.paymentCategory === PaymentCategory.STAFF_SALARY) {
      // Payee name is not for staff salary
      delete updatedPayment.payeeName
    }

    if (updatedPayment.staffId) updatedPayment.staff = mockStaff.find((s) => s.id === updatedPayment.staffId) || null
    else updatedPayment.staff = null

    if (updatedPayment.productId)
      updatedPayment.product = mockProducts.find((pr) => pr.id === updatedPayment.productId) || null
    else updatedPayment.product = null

    mockPayments[index] = updatedPayment
    return mockPayments[index]
  }
  throw new Error("Payment not found")
}

const deletePaymentAPI = async (paymentId: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const index = mockPayments.findIndex((p) => p.id === paymentId)
  if (index !== -1) {
    mockPayments.splice(index, 1)
    return paymentId
  }
  throw new Error("Payment not found")
}

const mockPayments: PaymentType[] = [
  {
    id: "pay_2",
    paymentNumber: "PMT-000002",
    paymentCategory: PaymentCategory.EXPENSE_PAYMENT,
    expenseCategoryId: "exp_cat_1",
    payeeName: "Staples Inc.",
    amount: 85.5,
    paymentDate: new Date(2024, 5, 20).toISOString(),
    paymentMethod: PaymentMethod.Card,
    status: PaymentStatus.Paid,
    notes: "Printer paper and pens",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pay_3",
    paymentNumber: "PMT-000003",
    paymentCategory: PaymentCategory.STAFF_SALARY,
    staffId: "staff_1",
    staff: mockStaff.find((s) => s.id === "staff_1"),
    amount: 2500.75,
    paymentDate: new Date(2024, 6, 1).toISOString(),
    paymentMethod: PaymentMethod.BankTransfer,
    status: PaymentStatus.Paid,
    notes: "Salary for June",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pay_4",
    paymentNumber: "PMT-000004",
    paymentCategory: PaymentCategory.CLOUD_SUBSCRIPTION,
    productId: "prod_saas_1",
    product: mockProducts.find((p) => p.id === "prod_saas_1"),
    payeeName: "AWS Services",
    amount: 120.0,
    paymentDate: new Date(2024, 6, 5).toISOString(),
    paymentMethod: PaymentMethod.DirectDebit,
    status: PaymentStatus.Paid,
    notes: "Monthly cloud hosting fee",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async (filters?: PaymentsState["currentFilters"], { getState }) => {
    const currentFilters = filters || (getState() as RootState).payments.currentFilters
    const response = await fetchPaymentsAPI(currentFilters)
    return response
  },
)

export const addPayment = createAsyncThunk("payments/addPayment", async (paymentData: PaymentFormValues) => {
  const response = await addPaymentAPI(paymentData)
  return response
})

export const updatePayment = createAsyncThunk("payments/updatePayment", async (paymentData: PaymentType) => {
  const response = await updatePaymentAPI(paymentData)
  return response
})

export const deletePayment = createAsyncThunk("payments/deletePayment", async (paymentId: string) => {
  await deletePaymentAPI(paymentId)
  return paymentId
})

interface PaymentsState {
  payments: PaymentType[]
  loading: "idle" | "pending" | "succeeded" | "failed"
  error: string | null | undefined
  currentFilters: {
    dateRange: { from?: Date; to?: Date } | null
    // client filter removed
    paymentMethod: PaymentMethod | "All" | null
    status: PaymentStatus | "All" | null
    paymentCategory: PaymentCategory | "All" | null
    searchTerm: string
  }
}

const initialState: PaymentsState = {
  payments: [],
  loading: "idle",
  error: null,
  currentFilters: {
    dateRange: null,
    paymentMethod: "All",
    status: "All",
    paymentCategory: "All",
    searchTerm: "",
  },
}

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    setPaymentFilters: (state, action: PayloadAction<Partial<PaymentsState["currentFilters"]>>) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = "pending"
      })
      .addCase(fetchPayments.fulfilled, (state, action: PayloadAction<PaymentType[]>) => {
        state.loading = "succeeded"
        state.payments = action.payload
      })
      .addCase(fetchPayments.rejected, (state, action: any) => {
        state.loading = "failed"
        state.error = action.error.message
      })
      .addCase(addPayment.fulfilled, (state, action: PayloadAction<PaymentType>) => {
        state.payments.unshift(action.payload)
      })
      .addCase(updatePayment.fulfilled, (state, action: PayloadAction<PaymentType>) => {
        const index = state.payments.findIndex((p) => p.id === action.payload.id)
        if (index !== -1) {
          state.payments[index] = action.payload
        }
      })
      .addCase(deletePayment.fulfilled, (state, action: PayloadAction<string>) => {
        state.payments = state.payments.filter((p) => p.id !== action.payload)
      })
  },
})

export const { setPaymentFilters } = paymentsSlice.actions
export const selectAllPayments = (state: RootState) => state.payments.payments
export default paymentsSlice.reducer
