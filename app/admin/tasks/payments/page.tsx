"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { PlusCircle, Filter, Search, AlertTriangle, CreditCard } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import { 
  OutgoingPaymentMethod, 
  OutgoingPaymentStatus, 
  OutgoingPaymentCategory,
  type OutgoingPaymentType,
  type ExpenseCategoryType
} from "@/lib/types/outgoing-payment"
import type { Staff } from "@/lib/types/staff"
import type { Product } from "@/lib/types/product"
import OutgoingPaymentCard from "@/components/admin/payments/outgoing-payment-card"
import OutgoingPaymentFormSheet from "@/components/admin/payments/outgoing-payment-form-sheet"
import OutgoingPaymentDetailSheet from "@/components/admin/payments/outgoing-payment-detail-sheet"

const paymentStatusOptions = Object.values(OutgoingPaymentStatus)
const paymentMethodOptions = Object.values(OutgoingPaymentMethod)
const paymentCategoryOptions = Object.values(OutgoingPaymentCategory)

export default function OutgoingPaymentsPage() {
  const [payments, setPayments] = useState<OutgoingPaymentType[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<OutgoingPaymentType | null>(null)
  const [editingPayment, setEditingPayment] = useState<OutgoingPaymentType | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<OutgoingPaymentStatus | "All">("All")
  const [methodFilter, setMethodFilter] = useState<OutgoingPaymentMethod | "All">("All")
  const [categoryFilter, setCategoryFilter] = useState<OutgoingPaymentCategory | "All">("All")

  // Fetch data
  useEffect(() => {
    fetchPayments()
    fetchStaff()
    fetchProducts()
    fetchExpenseCategories()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null) // Clear previous errors
      
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'All') params.append('status', statusFilter)
      if (methodFilter !== 'All') params.append('method', methodFilter)
      if (categoryFilter !== 'All') params.append('category', categoryFilter)
      if (dateRange?.from) params.append('startDate', dateRange.from.toISOString())
      if (dateRange?.to) params.append('endDate', dateRange.to.toISOString())

      const response = await fetch(`/api/outgoing-payments?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        // Handle specific error codes
        if (data.code === 'DATABASE_CONNECTION_ERROR') {
          throw new Error('Database connection issue. Please check your internet connection and try again.')
        }
        throw new Error(data.error || 'Failed to fetch payments')
      }
      
      setPayments(data.payments || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments'
      setError(errorMessage)
      console.error('Fetch payments error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        setStaff(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  const fetchExpenseCategories = async () => {
    try {
      // For now, use mock data since we don't have expense categories API yet
      setExpenseCategories([
        { id: 1, name: "Office Supplies", description: "General office supplies and equipment", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 2, name: "Software Licenses", description: "Software subscriptions and licenses", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 3, name: "Travel & Entertainment", description: "Business travel and client entertainment", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 4, name: "Marketing", description: "Marketing and advertising expenses", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ])
    } catch (err) {
      console.error('Failed to fetch expense categories:', err)
    }
  }

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPayments()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, methodFilter, categoryFilter, dateRange])

  const handleCreatePayment = async (data: any) => {
    try {
      setError(null) // Clear previous errors
      
      const response = await fetch('/api/outgoing-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        // Handle specific error codes
        if (result.code === 'DATABASE_CONNECTION_ERROR') {
          throw new Error('Database connection issue. Please check your internet connection and try again.')
        }
        if (result.code === 'VALIDATION_ERROR') {
          throw new Error(result.error || 'Please check your input and try again.')
        }
        if (result.code === 'DUPLICATE_PAYMENT_NUMBER') {
          throw new Error('Payment number already exists. Please try again.')
        }
        throw new Error(result.error || 'Failed to create payment')
      }
      
      await fetchPayments()
      setIsFormSheetOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment'
      setError(errorMessage)
      console.error('Create payment error:', err)
    }
  }

  const handleUpdatePayment = async (data: any) => {
    if (!editingPayment) return
    
    try {
      setError(null) // Clear previous errors
      
      const response = await fetch('/api/outgoing-payments/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: editingPayment.id,
          ...data
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        // Handle specific error codes
        if (result.code === 'DATABASE_CONNECTION_ERROR') {
          throw new Error('Database connection issue. Please check your internet connection and try again.')
        }
        if (result.code === 'VALIDATION_ERROR') {
          throw new Error(result.error || 'Please check your input and try again.')
        }
        if (result.code === 'NOT_FOUND') {
          throw new Error('Payment not found. It may have been deleted.')
        }
        throw new Error(result.error || 'Failed to update payment')
      }
      
      await fetchPayments()
      setIsFormSheetOpen(false)
      setEditingPayment(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment'
      setError(errorMessage)
      console.error('Update payment error:', err)
    }
  }

  const handleDeletePayment = async (payment: OutgoingPaymentType) => {
    if (!confirm('Are you sure you want to delete this payment?')) return
    
    try {
      setError(null) // Clear previous errors
      
      const response = await fetch('/api/outgoing-payments/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: payment.id
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        // Handle specific error codes
        if (result.code === 'DATABASE_CONNECTION_ERROR') {
          throw new Error('Database connection issue. Please check your internet connection and try again.')
        }
        if (result.code === 'NOT_FOUND') {
          throw new Error('Payment not found. It may have already been deleted.')
        }
        throw new Error(result.error || 'Failed to delete payment')
      }
      
      await fetchPayments()
      setIsDetailSheetOpen(false)
      setSelectedPayment(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete payment'
      setError(errorMessage)
      console.error('Delete payment error:', err)
    }
  }

  const openCreateForm = () => {
    setEditingPayment(null)
    setIsFormSheetOpen(true)
  }

  const openEditForm = (payment: OutgoingPaymentType) => {
    setEditingPayment(payment)
    setIsFormSheetOpen(true)
  }

  const openDetailSheet = (payment: OutgoingPaymentType) => {
    setSelectedPayment(payment)
    setIsDetailSheetOpen(true)
  }

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-poppins text-slate-900 dark:text-slate-100">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Outgoing Payments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage all outgoing financial transactions.</p>
        </div>
        <Button
          onClick={openCreateForm}
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-md shadow-md transition-all duration-300 hover:shadow-lg flex items-center gap-2"
          style={{ backgroundColor: "#3A86FF" }}
        >
          <PlusCircle size={20} />
          Record Payment
        </Button>
      </header>

      {/* Filter Section */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
          <Filter size={20} />
          <span>Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <Input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Date Range Picker */}
          <DatePickerWithRange
            date={dateRange}
            onSelect={setDateRange}
            className="w-full [&>button]:h-[42px] [&>button]:bg-slate-50 [&>button]:dark:bg-slate-700 [&>button]:border-slate-300 [&>button]:dark:border-slate-600 [&>button]:rounded-md"
            buttonClassName="justify-start text-left font-normal"
          />

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as OutgoingPaymentCategory | "All")}>
            <SelectTrigger className="w-full h-[42px] bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {paymentCategoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OutgoingPaymentStatus | "All")}>
            <SelectTrigger className="w-full h-[42px] bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {paymentStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment Method Filter */}
          <Select value={methodFilter} onValueChange={(value) => setMethodFilter(value as OutgoingPaymentMethod | "All")}>
            <SelectTrigger className="w-full h-[42px] bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md">
              <SelectValue placeholder="Filter by Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Methods</SelectItem>
              {paymentMethodOptions.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Error</h3>
              <p className="text-sm">{error}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchPayments()}
                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                Retry
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
                className="text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payments Grid */}
      {payments.length === 0 && !loading ? (
        <div className="text-center py-10">
          <CreditCard size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Payments Found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm || statusFilter !== "All" || methodFilter !== "All" || categoryFilter !== "All" || dateRange
              ? "Try adjusting your filters or search term."
              : "No payments recorded yet. Click 'Record Payment' to add one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {payments.map((payment) => (
            <OutgoingPaymentCard
              key={payment.id}
              payment={payment}
              onSelect={() => openDetailSheet(payment)}
            />
          ))}
        </div>
      )}

      {/* Form Sheet */}
      <OutgoingPaymentFormSheet
        isOpen={isFormSheetOpen}
        onClose={() => {
          setIsFormSheetOpen(false)
          setEditingPayment(null)
        }}
        onSubmit={editingPayment ? handleUpdatePayment : handleCreatePayment}
        defaultValues={editingPayment || undefined}
        isEditing={!!editingPayment}
        staff={staff}
        products={products}
        expenseCategories={expenseCategories}
        isLoading={loading}
      />

      {/* Detail Sheet */}
      {selectedPayment && (
        <OutgoingPaymentDetailSheet
          isOpen={isDetailSheetOpen}
          onOpenChange={setIsDetailSheetOpen}
          payment={selectedPayment}
          onEdit={() => {
            setIsDetailSheetOpen(false)
            setTimeout(() => openEditForm(selectedPayment), 150)
          }}
          onDelete={() => handleDeletePayment(selectedPayment)}
        />
      )}
    </div>
  )
}
