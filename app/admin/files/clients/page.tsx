"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { 
  fetchClients, 
  addClient, 
  updateClient, 
  selectAllClients,
  selectClientsLoading,
  selectClientsError
} from "@/lib/redux/slices/clientsSlice"

import ClientCard from "@/components/admin/clients/client-card"
import ClientFormSheet from "@/components/admin/clients/client-form-sheet"
import ClientDetailSheet from "@/components/admin/clients/client-detail-sheet"
import DeleteConfirmDialog from "@/components/admin/clients/delete-confirm-dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle, Search, Users, Building2, DollarSign, Calendar } from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ITEMS_PER_PAGE = 8

export default function ClientsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const clients = useSelector(selectAllClients)
  const loading = useSelector(selectClientsLoading)
  const error = useSelector(selectClientsError)

  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter clients based on search and status
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const searchTermLower = searchTerm.toLowerCase()
      const matchesSearch = 
        client.business_name.toLowerCase().includes(searchTermLower) ||
        client.contact_person.toLowerCase().includes(searchTermLower) ||
        client.email.toLowerCase().includes(searchTermLower)

      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && client.status) ||
        (statusFilter === "inactive" && !client.status)

      return matchesSearch && matchesStatus
    })
  }, [clients, searchTerm, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE)
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredClients, currentPage])

  // Stats
  const stats = useMemo(() => {
    return {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status).length,
      totalSpent: clients.reduce((sum, c) => sum + Number(c.total_spent || 0), 0),
      newThisMonth: clients.filter(c => {
        const joinedDate = new Date(c.joined_date)
        const thisMonth = new Date()
        return joinedDate.getMonth() === thisMonth.getMonth() && 
               joinedDate.getFullYear() === thisMonth.getFullYear()
      }).length
    }
  }, [clients])

  useEffect(() => {
    dispatch(fetchClients())
  }, [dispatch])

  const handleAddClient = () => {
    setIsEditing(false)
    setSelectedClient(null)
    setIsFormSheetOpen(true)
  }

  const handleEditClient = (client: any) => {
    setIsEditing(true)
    setSelectedClient(client)
    setIsFormSheetOpen(true)
  }

  const handleViewClientDetails = (client: any) => {
    setSelectedClient(client)
    setIsDetailSheetOpen(true)
  }

  const handleDeleteClient = (clientId: number) => {
    setDeletingClientId(clientId)
    const clientToDelete = clients.find((c) => c.id === clientId)
    setSelectedClient(clientToDelete || null)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingClientId) {
      // Add delete API call here when needed
      console.log("Delete client:", deletingClientId)
    }
    setIsDeleteDialogOpen(false)
    setDeletingClientId(null)
    setSelectedClient(null)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (isEditing && selectedClient) {
        await dispatch(updateClient({ id: selectedClient.id, ...data }))
      } else {
        await dispatch(addClient(data))
      }
      setIsFormSheetOpen(false)
      setSelectedClient(null)
    } catch (error) {
      console.error("Error submitting client:", error)
    }
  }

  if (loading && clients.length === 0) {
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
          <h1 className="text-3xl font-bold text-blue-400 mb-2">Client Management</h1>
          <p className="text-slate-400">Manage your client database</p>
        </div>
        <Button 
          onClick={handleAddClient}
          className="bg-blue-600 hover:bg-blue-500 text-white mt-4 sm:mt-0"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{stats.totalClients}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Clients</CardTitle>
            <Building2 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.activeClients}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">${stats.totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.newThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Search Clients</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email..."
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
              <Select value={statusFilter} onValueChange={(value: any) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Actions</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setCurrentPage(1)
                }}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
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

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginatedClients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onSelect={handleViewClientDetails}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && !loading && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center py-12">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No clients found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your filters to see more results."
                : "Add your first client to get started."
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={handleAddClient} className="bg-blue-600 hover:bg-blue-500">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Your First Client
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

      {/* Sheets and Dialogs */}
      <ClientFormSheet
        isOpen={isFormSheetOpen}
        onClose={() => {
          setIsFormSheetOpen(false)
          setSelectedClient(null)
        }}
        onSubmit={handleFormSubmit}
        defaultValues={selectedClient}
        isEditing={isEditing}
      />

      <ClientDetailSheet
        isOpen={isDetailSheetOpen}
        onClose={() => {
          setIsDetailSheetOpen(false)
          setSelectedClient(null)
        }}
        client={selectedClient}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedClient(null)
        }}
        onConfirm={confirmDelete}
        itemName={selectedClient?.business_name}
      />
    </div>
  )
}
