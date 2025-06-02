"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { nanoid } from "nanoid"
import { addDays } from "date-fns"

import type { Quotation, QuotationLineItem } from "@/lib/types/quotation"
import type { Client } from "@/lib/types/client"
import type { Product } from "@/lib/types/product"
import { calculateQuotationTotals, generateQuotationNumber } from "@/lib/redux/slices/quotationsSlice"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SearchableSelect from "@/components/ui/searchableSelect"
import { DatePicker } from "@/components/ui/date-picker"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { Loader2, PlusCircle, Trash2, AlertCircle, Edit2, User, Package } from "lucide-react"

const quotationFormSchema = z.object({
  clientId: z.number().min(1, "Client is required."),
  quotationDate: z.date({ required_error: "Quotation date is required." }),
  validUntilDate: z.date({ required_error: "Valid until date is required." }),
  lineItems: z
    .array(
      z.object({
        id: z.string().optional(),
        productId: z.union([z.number(), z.string(), z.null()]).optional(),
        productName: z.string().min(1, "Item name is required."),
        description: z.string().optional(),
        quantity: z.coerce.number().min(0.01, "Quantity must be > 0."),
        unitPrice: z.coerce.number().min(0, "Rate must be non-negative."),
      }),
    )
    .min(1, "At least one line item is required."),
  discountType: z.enum(["percentage", "fixed"]).default("percentage"),
  discountValue: z.coerce.number().min(0).default(0),
  taxRatePercent: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired", "converted"]).default("draft"),
  currency: z.string().default("USD"),
})

type QuotationFormData = z.infer<typeof quotationFormSchema>

export type QuotationFormSubmitValues = {
  clientId: number
  quotationDate: string
  validUntilDate: string
  lineItems: Array<{
    id?: string
    productId?: number | null
    productName: string
    description?: string
    quantity: number
    unitPrice: number
  }>
  discountType: "percentage" | "fixed"
  discountValue: number
  taxRatePercent: number
  notes?: string
  termsAndConditions?: string
  status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted"
  currency: string
}

interface QuotationFormSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: QuotationFormSubmitValues) => Promise<void>
  defaultValues?: Partial<Quotation>
  isEditing: boolean
  clients: Client[]
  products: Product[]
  nextQuotationNumber: number
  isLoading?: boolean
}

const statusesForForm = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
  { value: "converted", label: "Converted" },
]

export default function QuotationFormSheet({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isEditing,
  clients,
  products,
  nextQuotationNumber,
  isLoading,
}: QuotationFormSheetProps) {
  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationFormSchema) as any,
    defaultValues: {
      clientId: defaultValues?.clientId ? Number(defaultValues.clientId) : 0,
      quotationDate: defaultValues?.quotationDate ? new Date(defaultValues.quotationDate) : new Date(),
      validUntilDate: defaultValues?.validUntilDate ? new Date(defaultValues.validUntilDate) : addDays(new Date(), 30),
      lineItems: defaultValues?.lineItems?.map((li) => ({ 
        id: nanoid(),
        productId: li.productId || null,
        productName: li.productName,
        description: li.description || "",
        quantity: li.quantity,
        unitPrice: li.unitPrice
      })) || [
        { id: nanoid(), productName: "", quantity: 1, unitPrice: 0 },
      ],
      discountType: defaultValues?.discountType || "percentage",
      discountValue: defaultValues?.discountValue || 0,
      taxRatePercent: defaultValues?.taxRatePercent || 0,
      notes: defaultValues?.notes || "",
      termsAndConditions: defaultValues?.termsAndConditions || "Payment terms: Net 30. All prices are exclusive of applicable taxes.",
      status: (defaultValues?.status === "draft" ||
        defaultValues?.status === "sent" ||
        defaultValues?.status === "accepted" ||
        defaultValues?.status === "rejected" ||
        defaultValues?.status === "expired" ||
        defaultValues?.status === "converted"
          ? defaultValues.status
          : "draft") as "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted",
      currency: defaultValues?.currency || "USD",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  })

  const watchedLineItems = form.watch("lineItems")
  const watchedDiscountType = form.watch("discountType")
  const watchedDiscountValue = form.watch("discountValue")
  const watchedTaxRate = form.watch("taxRatePercent")
  const watchedClientId = form.watch("clientId")

  const { subtotal, discountAmount, taxAmount, totalAmount } = calculateQuotationTotals(
    watchedLineItems.map((item) => ({
      ...item,
      id: item.id || nanoid(),
      productId: item.productId?.toString() || "custom",
      description: item.description || "",
      amount: (item.quantity || 0) * (item.unitPrice || 0),
    })),
    watchedTaxRate || 0,
    watchedDiscountType || "percentage",
    watchedDiscountValue || 0,
  )

  useEffect(() => {
    if (isOpen) {
      form.reset({
        clientId: defaultValues?.clientId ? Number(defaultValues.clientId) : 0,
        quotationDate: defaultValues?.quotationDate ? new Date(defaultValues.quotationDate) : new Date(),
        validUntilDate: defaultValues?.validUntilDate ? new Date(defaultValues.validUntilDate) : addDays(new Date(), 30),
        lineItems: defaultValues?.lineItems?.map((li) => ({
          id: nanoid(),
          productId: li.productId ? Number(li.productId) : null,
          productName: li.productName,
          description: li.description || "",
          quantity: Number(li.quantity),
          unitPrice: Number(li.unitPrice),
        })) || [{ id: nanoid(), productName: "", quantity: 1, unitPrice: 0 }],
        discountType: defaultValues?.discountType || "percentage",
        discountValue: defaultValues?.discountValue || 0,
        taxRatePercent: defaultValues?.taxRatePercent || 0,
        notes: defaultValues?.notes || "",
        termsAndConditions: defaultValues?.termsAndConditions || "Payment terms: Net 30. All prices are exclusive of applicable taxes.",
        status: (defaultValues?.status === "draft" ||
        defaultValues?.status === "sent" ||
        defaultValues?.status === "accepted" ||
        defaultValues?.status === "rejected" ||
        defaultValues?.status === "expired" ||
        defaultValues?.status === "converted"
          ? defaultValues.status
          : "draft") as "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted",
        currency: defaultValues?.currency || "USD",
      })
    }
  }, [defaultValues, form, isOpen])

  const handleFormSubmitInternal = async (data: QuotationFormData) => {
    const submissionData: QuotationFormSubmitValues = {
      ...data,
      quotationDate: data.quotationDate.toISOString(),
      validUntilDate: data.validUntilDate.toISOString(),
      lineItems: data.lineItems.map((item) => ({
        id: item.id || nanoid(),
        productId: typeof item.productId === "number" ? item.productId : null,
        productName: item.productName,
        description: item.description || "",
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      discountValue: Number(data.discountValue),
      taxRatePercent: Number(data.taxRatePercent),
    }
    try {
      await onSubmit(submissionData)
    } catch (error) {
      // Error handled by parent component
      console.error("Form submission error:", error)
    }
  }

  // Get selected client for display
  const selectedClient = watchedClientId ? clients.find(client => client.id === watchedClientId) : null

  // Prepare clients data for SearchableSelect
  const clientsForSelect = clients.map(client => ({
    id: client.id,
    name: client.business_name,
    email: client.email,
    contact_person: client.contact_person,
    searchText: `${client.business_name} ${client.contact_person} ${client.email}`.toLowerCase()
  }))

  // Prepare products data for SearchableSelect (including custom option)
  const productsForSelect = [
    {
      id: "__custom__",
      name: "-- Add Custom Item --",
      sku: "CUSTOM",
      price: 0,
      isCustom: true
    },
    ...products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.pricing.sellingPrice,
      description: product.description,
      isCustom: false
    }))
  ]

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl md:max-w-4xl bg-slate-800 border-slate-700 text-slate-100 font-poppins flex flex-col">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-blue-400">
            {isEditing
              ? `Edit Quotation ${defaultValues?.quotationNumber || ""}`
              : `Create New Quotation (Est. ${generateQuotationNumber(nextQuotationNumber)})`}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {isEditing ? "Update the quotation details below." : "Fill in the details to generate a new quotation."}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow px-6 py-4">
          <form onSubmit={form.handleSubmit(handleFormSubmitInternal as any)} className="space-y-6">
            {/* Client Selection Section */}
            <Card className="p-4 bg-slate-700/30 border-slate-600">
              <Label className="text-slate-300 text-lg mb-3 block">Client Information</Label>
              {!selectedClient ? (
                <Controller
                  name="clientId"
                  control={form.control}
                  render={({ field }) => (
                    <SearchableSelect
                      items={clientsForSelect}
                      value={clientsForSelect.find(c => c.id === field.value) || null}
                      onChange={(client) => field.onChange(client?.id || 0)}
                      placeholder="Search and select client..."
                      displayKey="name"
                      valueKey="id"
                      searchKeys={["name", "email", "contact_person"]}
                      className="w-full"
                      error={!!form.formState.errors.clientId}
                      errorMessage={form.formState.errors.clientId?.message}
                    />
                  )}
                />
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-600 border border-slate-500 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-slate-100 font-medium">{selectedClient.business_name}</h3>
                      <p className="text-slate-400 text-sm">{selectedClient.contact_person}</p>
                      <p className="text-slate-400 text-xs">{selectedClient.email}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => form.setValue("clientId", 0)}
                    className="text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>

            {/* Quotation Header Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quotationDate" className="text-slate-300">
                  Quotation Date
                </Label>
                <Controller
                  name="quotationDate"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker
                      id="quotationDate"
                      date={field.value}
                      setDate={field.onChange}
                      className="bg-slate-700 border-slate-600 text-slate-50 [&>button]:border-slate-600"
                    />
                  )}
                />
                {form.formState.errors.quotationDate && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.quotationDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="validUntilDate" className="text-slate-300">
                  Valid Until Date
                </Label>
                <Controller
                  name="validUntilDate"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker
                      id="validUntilDate"
                      date={field.value}
                      setDate={field.onChange}
                      className="bg-slate-700 border-slate-600 text-slate-50 [&>button]:border-slate-600"
                    />
                  )}
                />
                {form.formState.errors.validUntilDate && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.validUntilDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="currency" className="text-slate-300">
                  Currency
                </Label>
                <Input
                  id="currency"
                  {...form.register("currency")}
                  placeholder="e.g., USD"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <Label className="text-slate-300 text-lg">Line Items</Label>
              {fields.map((field, index) => {
                const watchedProductId = form.watch(`lineItems.${index}.productId`)
                const selectedProduct = watchedProductId && watchedProductId !== "__custom__" && typeof watchedProductId === "number" 
                  ? products.find(p => p.id === watchedProductId.toString()) 
                  : null

                return (
                  <Card key={field.id} className="p-4 bg-slate-700/50 border-slate-600 space-y-3">
                    {/* Product Selection Row */}
                    <div className="space-y-3">
                      {!selectedProduct && watchedProductId !== "__custom__" ? (
                        <div>
                          <Label className="text-xs text-slate-400 mb-2 block">
                            Select Product/Service
                          </Label>
                          <Controller
                            name={`lineItems.${index}.productId`}
                            control={form.control}
                            render={({ field: selectField }) => (
                              <SearchableSelect
                                items={productsForSelect}
                                value={productsForSelect.find(p => p.id.toString() === selectField.value?.toString()) || null}
                                onChange={(product) => {
                                  if (product?.id === "__custom__") {
                                    selectField.onChange("__custom__")
                                    form.setValue(`lineItems.${index}.productName`, "")
                                    form.setValue(`lineItems.${index}.description`, "")
                                    form.setValue(`lineItems.${index}.unitPrice`, 0)
                                  } else if (product) {
                                    selectField.onChange(Number(product.id))
                                    form.setValue(`lineItems.${index}.productName`, product.name)
                                    form.setValue(`lineItems.${index}.description`, product.description || "")
                                    form.setValue(`lineItems.${index}.unitPrice`, product.price)
                                  }
                                }}
                                placeholder="Search product or add custom item..."
                                displayKey="name"
                                valueKey="id"
                                searchKeys={["name", "sku"]}
                                className="w-full"
                              />
                            )}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-slate-600 border border-slate-500 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-600 rounded-lg">
                              <Package className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              {selectedProduct ? (
                                <>
                                  <h4 className="text-slate-100 font-medium">{selectedProduct.name}</h4>
                                  <p className="text-slate-400 text-sm">SKU: {selectedProduct.sku} - ${selectedProduct.pricing.sellingPrice.toFixed(2)}</p>
                                </>
                              ) : (
                                <h4 className="text-slate-100 font-medium italic">Custom Item</h4>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => form.setValue(`lineItems.${index}.productId`, null)}
                            className="text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Item Details Row */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      <div className="md:col-span-4">
                        <Label htmlFor={`lineItems.${index}.productName`} className="text-xs text-slate-400">
                          Item Name
                        </Label>
                        <Input
                          {...form.register(`lineItems.${index}.productName`)}
                          placeholder="Item name"
                          className="bg-slate-600 border-slate-500 text-slate-100 h-9"
                        />
                        {form.formState.errors.lineItems?.[index]?.productName && (
                          <p className="text-xs text-red-400 mt-0.5">
                            {form.formState.errors.lineItems[index]?.productName?.message}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`lineItems.${index}.quantity`} className="text-xs text-slate-400">
                          Quantity
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`lineItems.${index}.quantity`)}
                          defaultValue={1}
                          className="bg-slate-600 border-slate-500 text-slate-100 h-9"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`lineItems.${index}.unitPrice`} className="text-xs text-slate-400">
                          Unit Price
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`lineItems.${index}.unitPrice`)}
                          defaultValue={0}
                          className="bg-slate-600 border-slate-500 text-slate-100 h-9"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-slate-400">Total</Label>
                        <p className="text-slate-100 h-9 flex items-center font-medium">
                          $
                          {(
                            (Number(form.watch(`lineItems.${index}.quantity`)) || 0) *
                            (Number(form.watch(`lineItems.${index}.unitPrice`)) || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                      <div className="md:col-span-2 flex items-end gap-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-9 w-9"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor={`lineItems.${index}.description`} className="text-xs text-slate-400">
                        Description (Optional)
                      </Label>
                      <Textarea
                        {...form.register(`lineItems.${index}.description`)}
                        placeholder="Item description"
                        rows={2}
                        className="bg-slate-600 border-slate-500 text-slate-100 text-sm"
                      />
                    </div>
                  </Card>
                )
              })}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ id: nanoid(), productName: "", quantity: 1, unitPrice: 0 })}
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Line Item
              </Button>
              
              {form.formState.errors.lineItems &&
                !form.formState.errors.lineItems.root &&
                form.formState.errors.lineItems.message && (
                  <p className="text-sm text-red-400 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {form.formState.errors.lineItems.message}
                  </p>
                )}
            </div>

            <Separator className="bg-slate-600" />

            {/* Totals & Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="discountType" className="text-slate-300">
                      Discount Type
                    </Label>
                    <Controller
                      name="discountType"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger id="discountType" className="bg-slate-700 border-slate-600 text-slate-50">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                            <SelectItem value="percentage" className="focus:bg-slate-600">Percentage</SelectItem>
                            <SelectItem value="fixed" className="focus:bg-slate-600">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountValue" className="text-slate-300">
                      Discount Value
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      step="0.01"
                      {...form.register("discountValue")}
                      className="bg-slate-700 border-slate-600 text-slate-50"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="taxRatePercent" className="text-slate-300">
                    Tax Rate (%)
                  </Label>
                  <Input
                    id="taxRatePercent"
                    type="number"
                    step="0.1"
                    {...form.register("taxRatePercent")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="text-slate-300">
                    Status
                  </Label>
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="status" className="bg-slate-700 border-slate-600 text-slate-50">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                          {statusesForForm.map((s) => (
                            <SelectItem key={s.value} value={s.value} className="focus:bg-slate-600">
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              
              <Card className="p-4 bg-slate-700/30 border-slate-600 space-y-3">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Discount ({watchedDiscountType === "percentage" ? `${watchedDiscountValue || 0}%` : "Fixed"}):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tax ({watchedTaxRate || 0}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <Separator className="bg-slate-500 my-2" />
                <div className="flex justify-between text-slate-50 text-xl font-semibold">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </Card>
            </div>

            {/* Notes & Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notes" className="text-slate-300">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Any additional notes for the client..."
                  className="bg-slate-700 border-slate-600 text-slate-50 min-h-[100px]"
                />
              </div>
              <div>
                <Label htmlFor="termsAndConditions" className="text-slate-300">
                  Terms & Conditions (Optional)
                </Label>
                <Textarea
                  id="termsAndConditions"
                  {...form.register("termsAndConditions")}
                  placeholder="e.g., Payment terms, validity conditions..."
                  className="bg-slate-700 border-slate-600 text-slate-50 min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="pb-6"></div>
          </form>
        </ScrollArea>
        
        <SheetFooter className="px-6 py-4 border-t border-slate-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white"
            onClick={form.handleSubmit(handleFormSubmitInternal as any)}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Quotation"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
