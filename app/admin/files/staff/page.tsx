"use client"

import { Card } from "@/components/ui/card"

import { Label } from "@/components/ui/label"

import { useState, useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { fetchStaffMembers, addStaffMember, updateStaffMember, deleteStaffMember } from "@/lib/redux/slices/staffSlice"
import type { Staff, StaffRole, StaffStatus } from "@/lib/types/staff"
import type { StaffFormValues } from "@/components/admin/staff/staff-form-sheet"

import StaffCard from "@/components/admin/staff/staff-card"
import StaffFormSheet from "@/components/admin/staff/staff-form-sheet"
import StaffDetailSheet from "@/components/admin/staff/staff-detail-sheet"
import DeleteConfirmDialog from "@/components/admin/clients/delete-confirm-dialog" // Reusable

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle, Search } from "lucide-react"

const ITEMS_PER_PAGE = 9 // Number of cards per page

const rolesForFilter: StaffRole[] = [
  "admin",
  "manager",
  "developer",
  "designer",
  "support_specialist",
  "hr_coordinator",
  "sales_executive",
]
const statusesForFilter: StaffStatus[] = ["active", "inactive", "on_leave"]
const departmentsForFilter = [
  "All",
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Human Resources",
  "Customer Support",
  "Finance",
]

export default function StaffManagementPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { staffMembers, isLoading: staffLoading } = useSelector((state: RootState) => state.staff)

  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | StaffRole>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("All")
  const [statusFilter, setStatusFilter] = useState<"all" | StaffStatus>("all")

  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(fetchStaffMembers())
  }, [dispatch])

  const handleAddStaff = () => {
    setIsEditing(false)
    setSelectedStaff(null)
    setIsFormSheetOpen(true)
  }

  const handleEditStaff = (staff: Staff) => {
    setIsEditing(true)
    setSelectedStaff(staff)
    setIsFormSheetOpen(true)
  }

  const handleViewStaffDetails = (staff: Staff) => {
    setSelectedStaff(staff)
    setIsDetailSheetOpen(true)
  }

  const handleDeleteStaff = (staffId: string) => {
    setDeletingStaffId(staffId)
    const staffToDelete = staffMembers.find((s) => s.id === staffId)
    setSelectedStaff(staffToDelete || null) // For item name in dialog
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingStaffId) {
      await dispatch(deleteStaffMember(deletingStaffId))
    }
    setIsDeleteDialogOpen(false)
    setDeletingStaffId(null)
    setSelectedStaff(null)
    setIsDetailSheetOpen(false) // Close detail sheet if open
  }

  const handleFormSubmit = async (data: StaffFormValues) => {
    const staffData = {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || { street: '', city: '', state: '', zip: '', country: '' },
      position: data.position || '',
      department: data.department || '',
      role: data.role || 'support',
      salary: data.salary && data.salary > 0 ? Number(data.salary) : undefined,
      payment_rate: data.payment_rate !== undefined && data.payment_rate !== null ? Number(data.payment_rate) : 0,
      payment_frequency: data.payment_frequency || 'hourly',
      payment_type: data.payment_type || 'hourly',
      payment_duration: data.payment_duration || 'hourly',
      payment_time: data.payment_time || 'daily',
      joinDate: data.joinDate ? new Date(data.joinDate).toISOString() : new Date().toISOString(),
      status: data.status || 'active',
      avatar: data.profilePictureUrl || '', // Map profilePictureUrl to avatar
      permissions: data.permissions || [],
    }

    if (isEditing && selectedStaff) {
      await dispatch(updateStaffMember({ ...selectedStaff, ...staffData }))
    } else {
      await dispatch(addStaffMember(staffData))
    }
    setIsFormSheetOpen(false)
    setSelectedStaff(null) // Clear selection
  }

  const filteredStaff = useMemo(() => {
    return staffMembers.filter((staff) => {
      const nameMatch = staff.name.toLowerCase().includes(searchTerm.toLowerCase())
      const emailMatch = staff.email.toLowerCase().includes(searchTerm.toLowerCase())
      const roleMatch = roleFilter === "all" || staff.role === roleFilter
      const departmentMatch = departmentFilter === "All" || staff.department === departmentFilter
      const statusMatch = statusFilter === "all" || staff.status === statusFilter
      return (nameMatch || emailMatch) && roleMatch && departmentMatch && statusMatch
    })
  }, [staffMembers, searchTerm, roleFilter, departmentFilter, statusFilter])

  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE)
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredStaff.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredStaff, currentPage])

  return (
    <div className="space-y-6 animate-fade-in font-poppins">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Staff Management</h1>
          <p className="text-slate-400">Oversee all staff members and their roles.</p>
        </div>
        <Button onClick={handleAddStaff} className="bg-blue-600 hover:bg-blue-500 text-white">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Staff Member
        </Button>
      </header>

      {/* Search and Filters */}
      <div className="p-4 bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="lg:col-span-2">
          <Label htmlFor="search-staff" className="text-xs text-slate-400">
            Search Name/Email
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              id="search-staff"
              type="search"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 w-full"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="filter-role" className="text-xs text-slate-400">
            Filter by Role
          </Label>
          <Select
            value={roleFilter}
            onValueChange={(value: "all" | StaffRole) => {
              setRoleFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger
              id="filter-role"
              className="bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500 w-full"
            >
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectItem value="all" className="focus:bg-slate-600">
                All Roles
              </SelectItem>
              {rolesForFilter.map((role) => (
                <SelectItem key={role} value={role} className="focus:bg-slate-600 capitalize">
                  {role.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filter-department" className="text-xs text-slate-400">
            Filter by Department
          </Label>
          <Select
            value={departmentFilter}
            onValueChange={(value: string) => {
              setDepartmentFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger
              id="filter-department"
              className="bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500 w-full"
            >
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
              {departmentsForFilter.map((dept) => (
                <SelectItem key={dept} value={dept} className="focus:bg-slate-600">
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filter-status" className="text-xs text-slate-400">
            Filter by Status
          </Label>
          <Select
            value={statusFilter}
            onValueChange={(value: "all" | StaffStatus) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger
              id="filter-status"
              className="bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500 w-full"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectItem value="all" className="focus:bg-slate-600">
                All Statuses
              </SelectItem>
              {statusesForFilter.map((status) => (
                <SelectItem key={status} value={status} className="focus:bg-slate-600 capitalize">
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Staff Cards Grid */}
      {staffLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(ITEMS_PER_PAGE)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="bg-slate-800/60 p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full bg-slate-700" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32 bg-slate-700" />
                    <Skeleton className="h-4 w-20 bg-slate-700" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full bg-slate-700" />
                <Skeleton className="h-4 w-3/4 bg-slate-700" />
                <div className="flex justify-between pt-2 border-t border-slate-700/50">
                  <Skeleton className="h-4 w-20 bg-slate-700" />
                  <Skeleton className="h-6 w-16 bg-slate-700" />
                </div>
              </Card>
            ))}
        </div>
      ) : paginatedStaff.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedStaff.map((staff) => (
            <StaffCard key={staff.id} staffMember={staff} onSelect={handleViewStaffDetails} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg">No staff members found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4 text-slate-300">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="border-slate-600 hover:bg-slate-700"
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="border-slate-600 hover:bg-slate-700"
          >
            Next
          </Button>
        </div>
      )}

      <StaffFormSheet
        isOpen={isFormSheetOpen}
        onClose={() => {
          setIsFormSheetOpen(false)
          setSelectedStaff(null)
        }}
        onSubmit={handleFormSubmit}
        defaultValues={selectedStaff || undefined}
        isEditing={isEditing}
      />
      <StaffDetailSheet
        isOpen={isDetailSheetOpen}
        onClose={() => {
          setIsDetailSheetOpen(false)
          setSelectedStaff(null)
        }}
        staffMember={selectedStaff}
        onEdit={handleEditStaff}
        onDelete={handleDeleteStaff}
      />
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedStaff(null)
        }}
        onConfirm={confirmDelete}
        itemName={selectedStaff?.name || "this staff member"}
      />
    </div>
  )
}
