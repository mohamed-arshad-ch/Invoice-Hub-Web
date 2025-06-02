"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Client } from "@/lib/types/client"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SearchableClientSelectProps {
  clients: Client[]
  value: string | null // Client ID
  onChange: (clientId: string | null) => void
  placeholder?: string
  disabled?: boolean
}

export function SearchableClientSelect({
  clients,
  value,
  onChange,
  placeholder = "Select client...",
  disabled,
}: SearchableClientSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const selectedClient = clients.find((client) => client.id === value)

  const filteredClients = React.useMemo(() => {
    if (!searchQuery) return clients
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }, [clients, searchQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-slate-700 border-slate-600 text-slate-50 hover:bg-slate-600 hover:text-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          {selectedClient ? (
            <span className="truncate">{selectedClient.name}</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-700 border-slate-600 text-slate-50">
        <Command shouldFilter={false}>
          {" "}
          {/* We handle filtering manually */}
          <CommandInput
            placeholder="Search client..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9 border-slate-600 focus:border-blue-500 caret-blue-500"
          />
          <CommandList>
            <ScrollArea className="max-h-[200px]">
              <CommandEmpty>No client found.</CommandEmpty>
              <CommandGroup>
                {filteredClients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.id} // Use client.id for CommandItem value
                    onSelect={(currentValue) => {
                      // currentValue is client.id here
                      onChange(currentValue === value ? null : currentValue)
                      setOpen(false)
                      setSearchQuery("") // Reset search query on select
                    }}
                    className="hover:bg-slate-600 aria-selected:bg-blue-600"
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === client.id ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                      <span className="truncate">{client.name}</span>
                      <span className="text-xs text-slate-400 truncate">{client.email}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
