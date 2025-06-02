"use client"

import type { Client } from "@/lib/types/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Building2, CreditCard, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface ClientCardProps {
  client: Client
  onSelect: (client: Client) => void
}

export default function ClientCard({ client, onSelect }: ClientCardProps) {
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

  return (
    <Card
      className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg shadow-custom hover:border-blue-500/70 transition-all duration-200 cursor-pointer flex flex-col font-poppins"
      onClick={() => onSelect(client)}
    >
      <CardHeader className="p-4 flex flex-row items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 border-2 border-blue-500/50">
          <Building2 className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-semibold text-slate-100 truncate">
            {client.business_name}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
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
      </CardHeader>
      
      <CardContent className="p-4 space-y-3 text-sm flex-grow">
        <div className="flex items-center text-slate-400">
          <Mail className="h-4 w-4 mr-2 text-blue-400" />
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center text-slate-400">
          <Phone className="h-4 w-4 mr-2 text-blue-400" />
          <span>{client.phone}</span>
        </div>
        <div className="flex items-center text-slate-400">
          <Building2 className="h-4 w-4 mr-2 text-blue-400" />
          <span className="truncate">{client.contact_person}</span>
        </div>
        {(client.city || client.state) && (
          <div className="flex items-center text-slate-400">
            <MapPin className="h-4 w-4 mr-2 text-blue-400" />
            <span className="truncate">
              {[client.city, client.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 border-t border-slate-700/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CreditCard className="h-3 w-3 text-slate-400" />
          <span className="text-xs text-slate-500">
            {formatPaymentTerms(client.payment_terms)}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          {formatPaymentSchedule(client.payment_schedule)}
        </div>
      </CardFooter>
    </Card>
  )
} 