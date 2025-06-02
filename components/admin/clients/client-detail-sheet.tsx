"use client"

import type React from "react"
import type { Client } from "@/lib/types/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  CreditCard, 
  CalendarDays, 
  FileText, 
  User,
  X,
  DollarSign,
  Clock
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ClientDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  onEdit: (client: Client) => void
  onDelete: (clientId: number) => void
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
      <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
      {children || <p className="text-sm text-slate-200 mt-1">{value || "N/A"}</p>}
    </div>
  </div>
)

export default function ClientDetailSheet({ isOpen, onClose, client, onEdit, onDelete }: ClientDetailSheetProps) {
  if (!client) return null

  const formatPaymentTerms = (terms: string) => {
    switch (terms) {
      case 'net_15': return 'Net 15'
      case 'net_30': return 'Net 30'
      case 'net_45': return 'Net 45'
      case 'net_60': return 'Net 60'
      case 'cod': return 'COD'
      case 'prepaid': return 'Prepaid'
      default: return terms
    }
  }

  const formatPaymentSchedule = (schedule: string) => {
    return schedule.charAt(0).toUpperCase() + schedule.slice(1)
  }

  const fullAddress = [client.street, client.city, client.state, client.zip]
    .filter(Boolean)
    .join(", ")

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-slate-800 border-slate-700 text-slate-100 font-poppins flex flex-col">
        <SheetHeader className="px-6 pt-6 text-left relative">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 border-2 border-blue-500">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl text-slate-50 truncate">{client.business_name}</SheetTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {client.client_id}
                </Badge>
                <Badge 
                  className={cn(
                    "text-xs",
                    client.status 
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-slate-600/50 text-slate-300 border-slate-500/50"
                  )}
                >
                  {client.status ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-5 w-5 text-slate-400 hover:text-slate-100" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        <ScrollArea className="flex-grow px-6 py-4">
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h3>
              <div className="space-y-1 divide-y divide-slate-700/50">
                <DetailItem icon={User} label="Contact Person" value={client.contact_person} />
                <DetailItem icon={Mail} label="Email" value={client.email} />
                <DetailItem icon={Phone} label="Phone" value={client.phone} />
              </div>
            </div>

            <Separator className="bg-slate-600" />

            {/* Address Information */}
            {fullAddress && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </h3>
                  <div className="space-y-1">
                    <DetailItem icon={MapPin} label="Full Address" value={fullAddress} />
                  </div>
                </div>
                <Separator className="bg-slate-600" />
              </>
            )}

            {/* Payment Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Settings
              </h3>
              <div className="space-y-1 divide-y divide-slate-700/50">
                <DetailItem icon={CreditCard} label="Payment Terms" value={formatPaymentTerms(client.payment_terms)} />
                <DetailItem icon={Clock} label="Payment Schedule" value={formatPaymentSchedule(client.payment_schedule)} />
                {client.total_spent !== undefined && client.total_spent > 0 && (
                  <DetailItem 
                    icon={DollarSign} 
                    label="Total Spent" 
                    value={`$${Number(client.total_spent).toLocaleString()}`} 
                  />
                )}
                {client.last_payment && (
                  <DetailItem 
                    icon={CalendarDays} 
                    label="Last Payment" 
                    value={format(new Date(client.last_payment), "MMMM d, yyyy")} 
                  />
                )}
                {client.upcoming_payment && (
                  <DetailItem 
                    icon={CalendarDays} 
                    label="Upcoming Payment" 
                    value={format(new Date(client.upcoming_payment), "MMMM d, yyyy")} 
                  />
                )}
              </div>
            </div>

            <Separator className="bg-slate-600" />

            {/* Additional Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Additional Information
              </h3>
              <div className="space-y-1 divide-y divide-slate-700/50">
                <DetailItem 
                  icon={CalendarDays} 
                  label="Date Joined" 
                  value={format(new Date(client.joined_date), "MMMM d, yyyy")} 
                />
                <DetailItem 
                  icon={CalendarDays} 
                  label="Last Updated" 
                  value={format(new Date(client.updated_at), "MMMM d, yyyy 'at' h:mm a")} 
                />
                {client.notes && (
                  <DetailItem icon={FileText} label="Notes">
                    <div className="mt-1 p-3 bg-slate-700/50 rounded-md border border-slate-600">
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">{client.notes}</p>
                    </div>
                  </DetailItem>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-slate-700 flex flex-col sm:flex-row sm:justify-end sm:space-x-2 gap-2">
          <Button
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full sm:w-auto"
            onClick={() => {
              onClose()
              onDelete(client.id)
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto"
            onClick={() => {
              onClose()
              onEdit(client)
            }}
          >
            <Edit2 className="mr-2 h-4 w-4" /> Edit Client
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
} 