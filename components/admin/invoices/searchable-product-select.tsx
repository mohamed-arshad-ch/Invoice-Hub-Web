"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PackagePlus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Product } from "@/lib/types/product"
import { ScrollArea } from "@/components/ui/scroll-area"

export const CUSTOM_PRODUCT_ITEM_VALUE = "__custom_product__" // Export if needed elsewhere

interface SearchableProductSelectProps {
  products: Product[]
  value: string | null // Product ID
  onChange: (productId: string | null, product?: Product) => void
  placeholder?: string
  disabled?: boolean
}

export function SearchableProductSelect({
  products,
  value,
  onChange,
  placeholder = "Select product...",
  disabled,
}: SearchableProductSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const selectedProduct = products.find((product) => product.id === value)

  const filteredProducts = React.useMemo(() => {
    if (!searchQuery) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [products, searchQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-slate-600 border-slate-500 text-slate-100 hover:bg-slate-500 hover:text-slate-50 h-9 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          {selectedProduct ? (
            <span className="truncate">{selectedProduct.name}</span>
          ) : value === null ? ( // Check if explicitly custom item
            <span className="text-slate-300 italic">Custom Item</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-600 border-slate-500 text-slate-100">
        <Command shouldFilter={false}>
          {" "}
          {/* We handle filtering manually */}
          <CommandInput
            placeholder="Search product or SKU..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9 border-slate-500 focus:border-blue-500 caret-blue-500"
          />
          <CommandList>
            <ScrollArea className="max-h-[200px]">
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key={CUSTOM_PRODUCT_ITEM_VALUE}
                  value={CUSTOM_PRODUCT_ITEM_VALUE}
                  onSelect={() => {
                    onChange(null, undefined) // Pass null for ID, undefined for product
                    setOpen(false)
                    setSearchQuery("")
                  }}
                  className="hover:bg-slate-500 aria-selected:bg-blue-600"
                >
                  <PackagePlus
                    className={cn("mr-2 h-4 w-4", value === null ? "opacity-100 text-blue-400" : "opacity-70")}
                  />
                  <span className="italic">-- Add Custom Item --</span>
                </CommandItem>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id} // Use product.id for CommandItem value
                    onSelect={(currentValue) => {
                      // currentValue is product.id here
                      const newSelectedProduct = products.find((p) => p.id === currentValue)
                      onChange(currentValue === value ? null : currentValue, newSelectedProduct)
                      setOpen(false)
                      setSearchQuery("") // Reset search query on select
                    }}
                    className="hover:bg-slate-500 aria-selected:bg-blue-600"
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === product.id ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                      <span className="truncate">{product.name}</span>
                      <span className="text-xs text-slate-400 truncate">
                        SKU: {product.sku} - ${product.pricing.sellingPrice.toFixed(2)}
                      </span>
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
