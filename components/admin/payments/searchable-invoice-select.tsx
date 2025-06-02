"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Check, ChevronsUpDown, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { type InvoiceType, InvoiceStatus } from "@/lib/types/invoice" // Assuming InvoiceStatus is exported

interface SearchableInvoiceSelectProps {
  selectedInvoices: InvoiceType[]
  onInvoicesChange: (invoices: InvoiceType[]) => void
  availableInvoices: InvoiceType[]
  clientId?: string | null
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
}

const getInvoiceStatusClass = (status: InvoiceStatus) => {
  switch (status) {
    case InvoiceStatus.Paid:
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300 dark:border-green-700"
    case InvoiceStatus.Pending:
    case InvoiceStatus.Sent:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700"
    case InvoiceStatus.Overdue:
      return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300 dark:border-red-700"
    case InvoiceStatus.Draft:
      return "bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300 border-slate-300 dark:border-slate-600"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }
}

const SearchableInvoiceSelect: React.FC<SearchableInvoiceSelectProps> = ({
  selectedInvoices,
  onInvoicesChange,
  availableInvoices,
  clientId,
  placeholder = "Select invoices...",
  searchPlaceholder = "Search invoices...",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSelect = (invoice: InvoiceType) => {
    const isSelected = selectedInvoices.find((inv) => inv.id === invoice.id)
    if (isSelected) {
      onInvoicesChange(selectedInvoices.filter((inv) => inv.id !== invoice.id))
    } else {
      onInvoicesChange([...selectedInvoices, invoice])
    }
  }

  const filteredInvoices = useMemo(() => {
    if (!clientId) return []
    return availableInvoices.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.totalAmount && invoice.totalAmount.toString().includes(searchTerm)),
    )
  }, [availableInvoices, searchTerm, clientId])

  const displayValue = useMemo(() => {
    if (selectedInvoices.length === 0) return placeholder
    if (selectedInvoices.length === 1) return `1 invoice selected: ${selectedInvoices[0].invoiceNumber}`
    return `${selectedInvoices.length} invoices selected`
  }, [selectedInvoices, placeholder])

  useEffect(() => {
    if (clientId && selectedInvoices.length > 0) {
      const validSelectedInvoices = selectedInvoices.filter((si) => si.clientId === clientId)
      if (validSelectedInvoices.length !== selectedInvoices.length) {
        onInvoicesChange(validSelectedInvoices)
      }
    } else if (!clientId) {
      // CRITICAL FIX: Only call onInvoicesChange if selectedInvoices is not already empty
      // This prevents an infinite loop when the parent form initializes and clientId becomes null.
      if (selectedInvoices.length > 0) {
        onInvoicesChange([])
      }
    }
  }, [clientId, selectedInvoices, onInvoicesChange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 font-normal text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/80"
          disabled={disabled || !clientId}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false} className="bg-white dark:bg-slate-800">
          <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-3">
            <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
            />
          </div>
          <CommandList>
            {filteredInvoices.length === 0 && searchTerm && (
              <CommandEmpty className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No invoices found for "{searchTerm}".
              </CommandEmpty>
            )}
            {filteredInvoices.length === 0 && !searchTerm && clientId && (
              <CommandEmpty className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No invoices available for this client.
              </CommandEmpty>
            )}
            {!clientId && (
              <CommandEmpty className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Please select a client first.
              </CommandEmpty>
            )}
            {clientId && filteredInvoices.length > 0 && (
              <CommandGroup>
                {filteredInvoices.map((invoice) => (
                  <CommandItem
                    key={invoice.id}
                    value={invoice.id}
                    onSelect={() => handleSelect(invoice)}
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/70 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-700"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedInvoices.find((si) => si.id === invoice.id) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="truncate">
                        {invoice.invoiceNumber} - ${invoice.totalAmount?.toFixed(2)}
                      </span>
                      <Badge className={cn("text-xs ml-2", getInvoiceStatusClass(invoice.status))}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default SearchableInvoiceSelect
