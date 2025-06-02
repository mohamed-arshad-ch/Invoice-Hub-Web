"use client"
import Image from "next/image"
import type { Staff, StaffRole, StaffStatus } from "@/lib/types/staff"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Briefcase, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface StaffCardProps {
  staffMember: Staff
  onSelect: (staffMember: Staff) => void
}

const roleColors: Record<StaffRole, string> = {
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
  manager: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  developer: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  designer: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  support_specialist: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  hr_coordinator: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  sales_executive: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  support: "bg-green-500/20 text-green-400 border-green-500/30",
}

const statusColors: Record<StaffStatus, string> = {
  active: "bg-green-500/20 text-green-400",
  inactive: "bg-slate-600/50 text-slate-400",
  on_leave: "bg-yellow-500/20 text-yellow-400",
}

export default function StaffCard({ staffMember, onSelect }: StaffCardProps) {
  const formattedRole = staffMember.role
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")

  return (
    <Card
      className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg shadow-custom hover:border-blue-500/70 transition-all duration-200 cursor-pointer flex flex-col font-poppins"
      onClick={() => onSelect(staffMember)}
    >
      <CardHeader className="p-4 flex flex-row items-center gap-4">
        <Image
          src={staffMember.avatar || `/placeholder.svg?height=64&width=64&query=${staffMember.role}+profile`}
          alt={staffMember.name}
          width={64}
          height={64}
          className="rounded-full object-cover border-2 border-slate-600"
        />
        <div>
          <CardTitle className="text-lg font-semibold text-slate-100">{staffMember.name}</CardTitle>
          <Badge className={cn("text-xs mt-1", roleColors[staffMember.role] || "bg-gray-500/20 text-gray-400")}>
            {formattedRole}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2 text-sm flex-grow">
        <div className="flex items-center text-slate-400">
          <Briefcase className="h-4 w-4 mr-2 text-blue-400" />
          <span>{staffMember.position}</span>
        </div>
        {staffMember.department && (
          <div className="flex items-center text-slate-400">
            <Briefcase className="h-4 w-4 mr-2 text-blue-400" />
            <span>{staffMember.department}</span>
          </div>
        )}
        <div className="flex items-center text-slate-400">
          <Mail className="h-4 w-4 mr-2 text-blue-400" />
          <span>{staffMember.email}</span>
        </div>
        {staffMember.phone && (
          <div className="flex items-center text-slate-400">
            <Phone className="h-4 w-4 mr-2 text-blue-400" />
            <span>{staffMember.phone}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-slate-700/50 flex justify-between items-center">
        <div className="flex items-center text-xs text-slate-500">
          <DollarSign className="h-3 w-3 mr-1" />
          <span>
            {staffMember.salary 
              ? `Salary: $${staffMember.salary.toLocaleString()}` 
              : `Rate: $${staffMember.payment_rate.toLocaleString()}/hr`
            }
          </span>
        </div>
        <Badge className={cn("text-xs capitalize", statusColors[staffMember.status])}>
          {staffMember.status.replace("_", " ")}
        </Badge>
      </CardFooter>
    </Card>
  )
}
