"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  fetchQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  fetchQuotationDetails,
  selectQuotations,
  selectSelectedQuotation,
  selectQuotationsLoading,
  selectQuotationsError,
  selectNextQuotationNumber,
  setSelectedQuotation,
  clearQuotationSelection,
  clearQuotationError,
} from "@/lib/redux/slices/quotationsSlice"
import { fetchClients, selectAllClients } from "@/lib/redux/slices/clientsSlice"
import { fetchProducts, selectAllProducts } from "@/lib/redux/slices/productsSlice"

import type { AppDispatch } from "@/lib/redux/store"
import QuotationCard from "@/components/admin/quotations/quotation-card"
import QuotationFormSheet, { type QuotationFormSubmitValues } from "@/components/admin/quotations/quotation-form-sheet"
import QuotationDetailSheet from "@/components/admin/quotations/quotation-detail-sheet"
import LoadingQuotationPage from "./loading"
import type { QuotationStatus, Quotation, QuotationType } from "@/lib/types/quotation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"

export default function QuotationsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const quotations = useSelector(selectQuotations)
  const selectedQuotation = useSelector(selectSelectedQuotation)
  const isLoading = useSelector(selectQuotationsLoading)
  const error = useSelector(selectQuotationsError)
  const clients = useSelector(selectAllClients)
  const products = useSelector(selectAllProducts)
  const nextQuotationNumber = useSelector(selectNextQuotationNumber)

  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "all">("all")
  const [clientFilter, setClientFilter] = useState<string>("all")
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    dispatch(fetchQuotations({}))
    dispatch(fetchClients())
    dispatch(fetchProducts())
  }, [dispatch])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearQuotationError())
    }
  }, [dispatch])

  const handleCreateQuotation = () => {
    setEditingQuotation(null)
    dispatch(clearQuotationSelection())
    setIsFormSheetOpen(true)
  }

  const handleSelectQuotation = (quotation: QuotationType) => {
    // Convert QuotationType to Quotation and set directly without API call
    const selectedQuotationData: Quotation = {
      id: parseInt(quotation.id),
      quotationNumber: quotation.quotationNumber,
      clientId: quotation.clientId,
      clientName: quotation.clientName,
      clientEmail: quotation.client?.email || "",
      quotationDate: quotation.quotationDate,
      validUntilDate: quotation.validUntilDate,
      subtotal: quotation.subTotal,
      discountType: quotation.discountType,
      discountValue: quotation.discountValue,
      discountAmount: quotation.discountAmount,
      taxRatePercent: quotation.taxRatePercent,
      taxAmount: quotation.taxAmount,
      totalAmount: quotation.totalAmount,
      status: quotation.status.toLowerCase() as QuotationStatus,
      currency: quotation.currency,
      termsAndConditions: quotation.termsAndConditions,
      notes: quotation.notes,
      createdBy: quotation.createdBy,
      createdAt: quotation.createdAt,
      updatedAt: quotation.updatedAt,
      client: quotation.client,
      lineItems: quotation.items.map(item => ({
        id: item.id,
        quotationId: parseInt(quotation.id),
        productId: typeof item.productId === "string" ? parseInt(item.productId) : null,
        productName: item.productName,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.totalPrice
      }))
    }
    dispatch(setSelectedQuotation(selectedQuotationData))
    setIsDetailSheetOpen(true)
  }

  const handleEditQuotation = (quotation: Quotation) => {
    setEditingQuotation(quotation)
    setIsDetailSheetOpen(false)
    setIsFormSheetOpen(true)
  }

  const handleDeleteQuotation = async (quotationId: number) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      try {
        await dispatch(deleteQuotation(quotationId)).unwrap()
        setIsDetailSheetOpen(false)
        dispatch(clearQuotationSelection())
      } catch (error) {
        console.error("Failed to delete quotation:", error)
      }
    }
  }

  const handleFormSubmit = async (data: QuotationFormSubmitValues) => {
    try {
      if (editingQuotation) {
        await dispatch(updateQuotation({
          id: editingQuotation.id,
          ...data
        })).unwrap()
      } else {
        await dispatch(createQuotation(data)).unwrap()
      }
      setIsFormSheetOpen(false)
      setEditingQuotation(null)
      dispatch(clearQuotationSelection())
    } catch (error) {
      console.error("Failed to save quotation:", error)
      throw error
    }
  }

  const handleFormSheetClose = () => {
    setIsFormSheetOpen(false)
    setEditingQuotation(null)
    dispatch(clearQuotationSelection())
  }

  const handleDetailSheetClose = () => {
    setIsDetailSheetOpen(false)
    dispatch(clearQuotationSelection())
  }

  // Filter quotations
  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch = searchTerm === "" || 
      quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || quotation.status === statusFilter
    
    const matchesClient = clientFilter === "all" || quotation.clientId.toString() === clientFilter
    
    const matchesDateRange = !selectedDateRange?.from || !selectedDateRange?.to ||
      (new Date(quotation.quotationDate) >= selectedDateRange.from &&
       new Date(quotation.quotationDate) <= selectedDateRange.to)
    
    return matchesSearch && matchesStatus && matchesClient && matchesDateRange
  })

  const quotationStatuses: Array<{ value: QuotationStatus | "all", label: string }> = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
    { value: "converted", label: "Converted" },
  ]

  if (isLoading && quotations.length === 0) {
    return <LoadingQuotationPage />
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-900 min-h-screen text-slate-50 font-poppins">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Quotations</h1>
          <p className="text-slate-400">Manage your quotes and proposals.</p>
        </div>
        <Button
          onClick={handleCreateQuotation}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Create Quotation
        </Button>
      </header>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-800 rounded-lg shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="search"
            placeholder="Search by Quote# or Client..."
            className="pl-10 w-full bg-slate-700 border-slate-600 text-slate-50 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DatePickerWithRange
          date={selectedDateRange}
          onSelect={setSelectedDateRange}
          className="bg-slate-700 border-slate-600 text-slate-50 hover:bg-slate-600 [&>button]:w-full [&>button]:justify-start [&>button]:text-left [&>button]:font-normal"
        />
        
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50 hover:bg-slate-600">
            <SelectValue placeholder="Filter by Client" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600 text-slate-50">
            <SelectItem value="all" className="hover:bg-slate-600">
              All Clients
            </SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()} className="hover:bg-slate-600">
                {client.business_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as QuotationStatus | "all")}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50 hover:bg-slate-600">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600 text-slate-50">
            {quotationStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value} className="hover:bg-slate-600">
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4">
          <p className="text-red-400">Error: {error}</p>
          <Button
            onClick={() => dispatch(clearQuotationError())}
            variant="outline"
            size="sm"
            className="mt-2 border-red-600 text-red-400 hover:bg-red-900/20"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Quotations Grid */}
      {!isLoading && filteredQuotations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-64 h-40 bg-slate-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <p className="text-slate-500">No quotations found</p>
          </div>
          <h2 className="text-2xl font-semibold text-slate-300 mb-2">No Quotations Found</h2>
          <p className="text-slate-400 mb-6">
            {searchTerm || statusFilter !== "all" || clientFilter !== "all" || selectedDateRange
              ? "Try adjusting your filters or search criteria."
              : "Get started by creating your first quotation."}
          </p>
          <Button onClick={handleCreateQuotation} className="bg-blue-600 hover:bg-blue-500 text-white">
            <PlusCircle className="mr-2 h-5 w-5" /> Create First Quotation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotations.map((quotation) => (
            <QuotationCard
              key={quotation.id}
              quotation={{
                id: quotation.id.toString(),
                quotationNumber: quotation.quotationNumber,
                clientId: quotation.clientId,
                client: quotation.client || undefined,
                quotationDate: quotation.quotationDate,
                validUntilDate: quotation.validUntilDate,
                items: quotation.lineItems?.map(item => ({
                  id: item.id || 0,
                  productId: item.productId || null,
                  productName: item.productName,
                  description: item.description || "",
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  totalPrice: item.amount,
                  amount: item.amount
                })) || [],
                subTotal: quotation.subtotal,
                discountType: quotation.discountType,
                discountValue: quotation.discountValue,
                discountAmount: quotation.discountAmount,
                taxRate: quotation.taxRatePercent,
                taxAmount: quotation.taxAmount,
                totalAmount: quotation.totalAmount,
                termsAndConditions: quotation.termsAndConditions || "",
                notes: quotation.notes || "",
                status: quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1) as any,
                currency: quotation.currency,
                createdAt: quotation.createdAt,
                updatedAt: quotation.updatedAt,
                clientName: quotation.clientName,
                subtotal: quotation.subtotal,
                taxRatePercent: quotation.taxRatePercent,
                createdBy: quotation.createdBy,
              }}
              onSelect={handleSelectQuotation}
            />
          ))}
        </div>
      )}

      {/* Form Sheet */}
      <QuotationFormSheet
        isOpen={isFormSheetOpen}
        onClose={handleFormSheetClose}
        onSubmit={handleFormSubmit}
        defaultValues={editingQuotation || undefined}
        isEditing={!!editingQuotation}
        clients={clients}
        products={products}
        nextQuotationNumber={nextQuotationNumber}
        isLoading={isLoading}
      />

      {/* Detail Sheet */}
      <QuotationDetailSheet
        isOpen={isDetailSheetOpen}
        onClose={handleDetailSheetClose}
        onEdit={(quotation) => {
          handleEditQuotation(quotation)
        }}
        onDelete={(quotationId: string) => handleDeleteQuotation(parseInt(quotationId))}
      />
    </div>
  )
}
