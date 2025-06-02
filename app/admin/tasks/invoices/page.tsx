"use client"

import { useEffect, useState, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { 
  fetchInvoices, 
  addInvoice, 
  updateInvoice, 
  deleteInvoice,
  fetchInvoiceDetails,
  updateInvoiceDetails,
  deleteInvoiceDetails,
  setSelectedInvoice,
  clearInvoiceSelection,
  setFilters,
  clearFilters,
  selectFilteredInvoices,
  selectSelectedInvoice,
  selectInvoicesLoading,
  selectInvoicesError,
  selectNextInvoiceNumber
} from "@/lib/redux/slices/invoicesSlice"
import { fetchClients, selectAllClients } from "@/lib/redux/slices/clientsSlice"
import { fetchProducts, selectAllProducts } from "@/lib/redux/slices/productsSlice"
import type { Invoice } from "@/lib/types/invoice"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Eye, 
  Trash2, 
  FileText,
  Calendar,
  DollarSign,
  Users
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import InvoiceCard from "@/components/admin/invoices/invoice-card"
import InvoiceDetailSheet from "@/components/admin/invoices/invoice-detail-sheet"
import InvoiceFormSheet from "@/components/admin/invoices/invoice-form-sheet"
import DeleteConfirmDialog from "@/components/admin/clients/delete-confirm-dialog"

const ITEMS_PER_PAGE = 12

const statusColors = {
  draft: "bg-gray-500",
  sent: "bg-blue-500", 
  pending_payment: "bg-yellow-500",
  paid: "bg-green-500",
  overdue: "bg-red-500",
  cancelled: "bg-red-600",
}

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  pending_payment: "Pending Payment", 
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
}

export default function InvoicesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const filteredInvoices = useSelector(selectFilteredInvoices)
  const selectedInvoice = useSelector(selectSelectedInvoice)
  const loading = useSelector(selectInvoicesLoading)
  const error = useSelector(selectInvoicesError)
  const nextInvoiceNumber = useSelector(selectNextInvoiceNumber)
  const clients = useSelector(selectAllClients)
  const products = useSelector(selectAllProducts)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [clientFilter, setClientFilter] = useState<string>("all")

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE)
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredInvoices, currentPage])

  // Stats calculations
  const stats = useMemo(() => {
    const totalInvoices = filteredInvoices.length
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const paidAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0)
    const pendingAmount = totalAmount - paidAmount
    
    return {
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
    }
  }, [filteredInvoices])

  useEffect(() => {
    dispatch(fetchInvoices())
    dispatch(fetchClients())
    dispatch(fetchProducts())
  }, [dispatch])

  useEffect(() => {
    dispatch(setFilters({
      searchTerm: searchTerm,
      status: statusFilter === "all" ? null : statusFilter as any,
      client: clientFilter === "all" ? null : clientFilter,
    }))
  }, [searchTerm, statusFilter, clientFilter, dispatch])

  const handleAddInvoice = () => {
    setEditingInvoice(null)
    setIsFormOpen(true)
  }

  const handleSelectInvoice = (invoice: Invoice) => {
    dispatch(setSelectedInvoice(invoice))
    setIsDetailSheetOpen(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setIsDetailSheetOpen(false)
    setIsFormOpen(true)
  }

  const handleDeleteInvoice = (invoiceId: string) => {
    const invoice = filteredInvoices.find(inv => inv.id === invoiceId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedInvoice) {
      await dispatch(deleteInvoiceDetails(Number(selectedInvoice.id)))
      setDeleteDialogOpen(false)
      dispatch(clearInvoiceSelection())
      setIsDetailSheetOpen(false)
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingInvoice) {
        await dispatch(updateInvoiceDetails({ id: editingInvoice.id, ...data })).unwrap()
      } else {
        await dispatch(addInvoice(data)).unwrap()
      }
      setIsFormOpen(false)
      setEditingInvoice(null)
      console.log(`Invoice ${editingInvoice ? 'updated' : 'created'} successfully`)
    } catch (error) {
      console.error("Error submitting invoice:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const color = statusColors[status as keyof typeof statusColors] || "bg-gray-500"
    const label = statusLabels[status as keyof typeof statusLabels] || status
    
    return (
      <Badge className={`${color} text-white`}>
        {label}
      </Badge>
    )
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setClientFilter("all")
    setCurrentPage(1)
    dispatch(clearFilters())
  }

  if (loading && filteredInvoices.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 bg-slate-900 min-h-screen text-slate-100">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-slate-900 min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 mb-2">Invoice Management</h1>
          <p className="text-slate-400">Manage and track your invoices</p>
        </div>
        <Button 
          onClick={handleAddInvoice}
          className="bg-blue-600 hover:bg-blue-500 text-white mt-4 sm:mt-0"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{stats.totalInvoices}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">${stats.totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Paid Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">${stats.paidAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">${stats.pendingAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-8 bg-slate-700 border-slate-600 text-slate-100"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Client</Label>
              <Select value={clientFilter} onValueChange={(value) => {
                setClientFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.business_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Actions</Label>
              <Button 
                variant="outline" 
                onClick={clearAllFilters}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-900/20 border-red-500 mb-6">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginatedInvoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            onSelect={handleSelectInvoice}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && !loading && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center py-12">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No invoices found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || statusFilter !== "all" || clientFilter !== "all" 
                ? "Try adjusting your filters to see more results."
                : "Create your first invoice to get started."
              }
            </p>
            {!searchTerm && statusFilter === "all" && clientFilter === "all" && (
              <Button onClick={handleAddInvoice} className="bg-blue-600 hover:bg-blue-500">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Your First Invoice
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className={
                currentPage === page 
                  ? "bg-blue-600 hover:bg-blue-500 text-white" 
                  : "border-slate-600 text-slate-300 hover:bg-slate-700"
              }
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Next
          </Button>
        </div>
      )}

      {/* Invoice Detail Sheet */}
      <InvoiceDetailSheet
        isOpen={isDetailSheetOpen}
        onClose={() => {
          setIsDetailSheetOpen(false)
          dispatch(clearInvoiceSelection())
        }}
        invoice={selectedInvoice}
        onEdit={handleEditInvoice}
        onDelete={handleDeleteInvoice}
      />

      {/* Invoice Form Sheet */}
      <InvoiceFormSheet
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingInvoice(null)
        }}
        onSubmit={handleFormSubmit}
        defaultValues={editingInvoice || undefined}
        isEditing={!!editingInvoice}
        clients={clients}
        products={products}
        nextInvoiceNumber={nextInvoiceNumber}
        isLoading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemName={selectedInvoice?.invoiceNumber}
      />
    </div>
  )
}
