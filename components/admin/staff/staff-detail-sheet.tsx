"use client"

import type React from "react"
import Image from "next/image"
import type { Staff, StaffRole, StaffStatus } from "@/lib/types/staff"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  CalendarDays, 
  ShieldCheck, 
  X, 
  Clock,
  CreditCard,
  Timer,
  KeyRound,
  Building,
  Calendar,
  User
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface StaffDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  staffMember: Staff | null
  onEdit: (staffMember: Staff) => void
  onDelete: (staffId: string) => void
  // onAssignTask: (staffId: string) => void; // Placeholder
}

const roleColors: Record<StaffRole, string> = {
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
  manager: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  developer: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  designer: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  support_specialist: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  hr_coordinator: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  sales_executive: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  support: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

const statusColors: Record<StaffStatus, string> = {
  active: "bg-green-500/20 text-green-400",
  inactive: "bg-slate-600/50 text-slate-400",
  on_leave: "bg-yellow-500/20 text-yellow-400",
}

const DetailItem: React.FC<{
  icon: React.ElementType
  label: string
  value?: string | number | null
  children?: React.ReactNode
}> = ({ icon: Icon, label, value, children }) => (
  <div className="flex items-start py-3">
    <Icon className="h-5 w-5 mr-3 mt-1 text-blue-400 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      {children || <p className="text-sm text-slate-200 mt-1">{value || "N/A"}</p>}
    </div>
  </div>
)

const SectionHeader: React.FC<{ title: string; icon: React.ElementType }> = ({ title, icon: Icon }) => (
  <div className="flex items-center py-2 mt-4 mb-2 border-b border-slate-600">
    <Icon className="h-4 w-4 mr-2 text-blue-400" />
    <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
  </div>
)

export default function StaffDetailSheet({ isOpen, onClose, staffMember, onEdit, onDelete }: StaffDetailSheetProps) {
  if (!staffMember) return null

  const formattedRole = staffMember.role
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
  
  // Safely handle address that might be undefined
  const fullAddress = staffMember.address 
    ? `${staffMember.address.street || ''}, ${staffMember.address.city || ''}, ${staffMember.address.state || ''} ${staffMember.address.zip || ''}, ${staffMember.address.country || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '') || 'N/A'
    : 'N/A'

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-slate-800 border-slate-700 text-slate-100 font-poppins flex flex-col">
        <SheetHeader className="px-6 pt-6 text-left relative">
          <div className="flex items-center space-x-4 mb-4">
            <Image
              src={
                staffMember.avatar || `/placeholder.svg?height=80&width=80&query=${staffMember.role}+profile`
              }
              alt={staffMember.name}
              width={80}
              height={80}
              className="rounded-full object-cover border-2 border-blue-500"
            />
            <div>
              <SheetTitle className="text-xl text-slate-50">{staffMember.name}</SheetTitle>
              <p className="text-sm text-slate-400 mt-1">{staffMember.position}</p>
              <Badge className={cn("text-xs mt-2", roleColors[staffMember.role] || "bg-gray-500/20 text-gray-400")}>
                {formattedRole}
              </Badge>
            </div>
          </div>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-5 w-5 text-slate-400 hover:text-slate-100" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        <ScrollArea className="flex-grow px-6 py-4">
          <div className="space-y-1">
            
            {/* Personal Information Section */}
            <SectionHeader title="Personal Information" icon={User} />
            <DetailItem icon={Mail} label="Email Address" value={staffMember.email} />
            <DetailItem icon={Phone} label="Phone Number" value={staffMember.phone} />
            <DetailItem icon={MapPin} label="Address" value={fullAddress} />
            
            {/* Job Information Section */}
            <SectionHeader title="Job Information" icon={Briefcase} />
            <DetailItem icon={Building} label="Position" value={staffMember.position} />
            <DetailItem icon={Briefcase} label="Department" value={staffMember.department} />
            <DetailItem icon={ShieldCheck} label="Status">
              <Badge className={cn("text-xs capitalize", statusColors[staffMember.status])}>
                {staffMember.status.replace("_", " ")}
              </Badge>
            </DetailItem>
            <DetailItem
              icon={CalendarDays}
              label="Join Date"
              value={format(new Date(staffMember.joinDate), "MMMM d, yyyy")}
            />

            {/* Compensation Section */}
            <SectionHeader title="Compensation" icon={DollarSign} />
            <DetailItem 
              icon={DollarSign} 
              label="Salary" 
              value={staffMember.salary ? `$${staffMember.salary.toLocaleString()}` : 'N/A'} 
            />
            <DetailItem 
              icon={CreditCard} 
              label="Payment Rate" 
              value={`$${staffMember.payment_rate}`} 
            />
            <DetailItem 
              icon={Clock} 
              label="Payment Frequency" 
              value={staffMember.payment_frequency || 'N/A'} 
            />
            <DetailItem 
              icon={Timer} 
              label="Payment Type" 
              value={staffMember.payment_type || 'N/A'} 
            />
            <DetailItem 
              icon={Clock} 
              label="Payment Duration" 
              value={staffMember.payment_duration || 'N/A'} 
            />
            <DetailItem 
              icon={Timer} 
              label="Payment Time" 
              value={staffMember.payment_time || 'N/A'} 
            />

            {/* Permissions Section */}
            <SectionHeader title="Permissions & Access" icon={KeyRound} />
            <DetailItem icon={KeyRound} label="Permissions">
              {staffMember.permissions && staffMember.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {staffMember.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                      {permission}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 mt-1">No specific permissions assigned</p>
              )}
            </DetailItem>

            {/* System Information Section */}
            <SectionHeader title="System Information" icon={Calendar} />
            <DetailItem
              icon={Calendar}
              label="Record Created"
              value={staffMember.created_at ? format(new Date(staffMember.created_at), "MMMM d, yyyy 'at' h:mm a") : 'N/A'}
            />
            <DetailItem
              icon={Calendar}
              label="Last Updated"
              value={staffMember.updated_at ? format(new Date(staffMember.updated_at), "MMMM d, yyyy 'at' h:mm a") : 'N/A'}
            />
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-slate-700 flex flex-col sm:flex-row sm:justify-end sm:space-x-2 gap-2">
          <Button
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full sm:w-auto"
            onClick={() => {
              onClose() // Close detail sheet first
              onDelete(staffMember.id)
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto"
            onClick={() => {
              onClose() // Close detail sheet first
              onEdit(staffMember)
            }}
          >
            <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
