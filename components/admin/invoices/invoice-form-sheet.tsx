"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { nanoid } from "nanoid"
import { addDays } from "date-fns"

import type { Invoice, InvoiceLineItem } from "@/lib/types/invoice"
import type { Client } from "@/lib/types/client"
import type { Product } from "@/lib/types/product"
import { calculateTotals as calculateInvoiceTotals, generateInvoiceNumber } from "@/lib/redux/slices/invoicesSlice"

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

const invoiceFormSchema = z.object({
  clientId: z.number().min(1, "Client is required."),
  issueDate: z.date({ required_error: "Issue date is required." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  paymentTerms: z.string().optional(),
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
  taxRatePercent: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  paymentInstructions: z.string().optional(),
  status: z.enum(["draft", "sent", "pending_payment"]),
  amountPaid: z.coerce.number().min(0).default(0),
})

type InvoiceFormData = z.infer<typeof invoiceFormSchema>

export type InvoiceFormSubmitValues = {
  clientId: number
  issueDate: string
  dueDate: string
  paymentTerms?: string
  lineItems: Array<{
    id?: string
    productId?: number | null
    productName: string
    description?: string
    quantity: number
    unitPrice: number
  }>
  taxRatePercent: number
  notes?: string
  paymentInstructions?: string
  status: "draft" | "sent" | "pending_payment"
  amountPaid: number
}

interface InvoiceFormSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: InvoiceFormSubmitValues) => Promise<void>
  defaultValues?: Partial<Invoice>
  isEditing: boolean
  clients: Client[]
  products: Product[]
  nextInvoiceNumber: number
  isLoading?: boolean
}

const statusesForForm = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "pending_payment", label: "Pending Payment" },
]

export default function InvoiceFormSheet({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isEditing,
  clients,
  products,
  nextInvoiceNumber,
  isLoading,
}: InvoiceFormSheetProps) {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema) as any,
    defaultValues: {
      clientId: defaultValues?.clientId ? Number(defaultValues.clientId) : 0,
      issueDate: defaultValues?.issueDate ? new Date(defaultValues.issueDate) : new Date(),
      dueDate: defaultValues?.dueDate ? new Date(defaultValues.dueDate) : addDays(new Date(), 30),
      paymentTerms: defaultValues?.paymentTerms || "Net 30 Days",
      lineItems: defaultValues?.lineItems?.map((li) => ({ 
        id: nanoid(),
        productId: li.productId ? Number(li.productId) : null,
        productName: li.productName,
        description: li.description || "",
        quantity: li.quantity,
        unitPrice: li.unitPrice
      })) || [
        { id: nanoid(), productName: "", quantity: 1, unitPrice: 0 },
      ],
      taxRatePercent: defaultValues?.taxRatePercent || 0,
      notes: defaultValues?.notes || "",
      paymentInstructions: (defaultValues as any)?.paymentInstructions || "",
      status: (defaultValues?.status === "draft" ||
        defaultValues?.status === "sent" ||
        defaultValues?.status === "pending_payment"
          ? defaultValues.status
          : "draft") as "draft" | "sent" | "pending_payment",
      amountPaid: defaultValues?.amountPaid || 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  })

  const watchedLineItems = form.watch("lineItems")
  const watchedTaxRate = form.watch("taxRatePercent")
  const watchedClientId = form.watch("clientId")

  const { subtotal, taxAmount, totalAmount } = calculateInvoiceTotals(
    watchedLineItems.map((item) => ({
      ...item,
      id: item.id || nanoid(),
      productId: item.productId?.toString() || "custom",
      description: item.description || "",
      amount: (item.quantity || 0) * (item.unitPrice || 0),
    })),
    watchedTaxRate || 0,
  )

  useEffect(() => {
    if (isOpen) {
      form.reset({
        clientId: defaultValues?.clientId ? Number(defaultValues.clientId) : 0,
        issueDate: defaultValues?.issueDate ? new Date(defaultValues.issueDate) : new Date(),
        dueDate: defaultValues?.dueDate ? new Date(defaultValues.dueDate) : addDays(new Date(), 30),
        paymentTerms: defaultValues?.paymentTerms || "Net 30 Days",
        lineItems: defaultValues?.lineItems?.map((li) => ({
          id: nanoid(),
          productId: li.productId ? Number(li.productId) : null,
          productName: li.productName,
          description: li.description || "",
          quantity: Number(li.quantity),
          unitPrice: Number(li.unitPrice),
        })) || [{ id: nanoid(), productName: "", quantity: 1, unitPrice: 0 }],
        taxRatePercent: defaultValues?.taxRatePercent || 0,
        notes: defaultValues?.notes || "",
        paymentInstructions: (defaultValues as any)?.paymentInstructions || "",
        status: (defaultValues?.status === "draft" ||
        defaultValues?.status === "sent" ||
        defaultValues?.status === "pending_payment"
          ? defaultValues.status
          : "draft") as "draft" | "sent" | "pending_payment",
        amountPaid: defaultValues?.amountPaid || 0,
      })
    }
  }, [defaultValues, form, isOpen])

  const handleFormSubmitInternal = async (data: InvoiceFormData) => {
    const submissionData: InvoiceFormSubmitValues = {
      ...data,
      issueDate: data.issueDate.toISOString(),
      dueDate: data.dueDate.toISOString(),
      lineItems: data.lineItems.map((item) => ({
        id: item.id || nanoid(),
        productId: item.productId ? Number(item.productId) : null,
        productName: item.productName,
        description: item.description || "",
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      taxRatePercent: Number(data.taxRatePercent),
      amountPaid: Number(data.amountPaid),
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
              ? `Edit Invoice ${defaultValues?.invoiceNumber || ""}`
              : `Create New Invoice (Est. ${generateInvoiceNumber(nextInvoiceNumber)})`}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {isEditing ? "Update the invoice details below." : "Fill in the details to generate a new invoice."}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow px-6 py-4">
          <form onSubmit={form.handleSubmit(handleFormSubmitInternal)} className="space-y-6">
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

            {/* Invoice Header Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="issueDate" className="text-slate-300">
                  Issue Date
                </Label>
                <Controller
                  name="issueDate"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker
                      id="issueDate"
                      date={field.value}
                      setDate={field.onChange}
                      className="bg-slate-700 border-slate-600 text-slate-50 [&>button]:border-slate-600"
                    />
                  )}
                />
                {form.formState.errors.issueDate && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.issueDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-slate-300">
                  Due Date
                </Label>
                <Controller
                  name="dueDate"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker
                      id="dueDate"
                      date={field.value}
                      setDate={field.onChange}
                      className="bg-slate-700 border-slate-600 text-slate-50 [&>button]:border-slate-600"
                    />
                  )}
                />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.dueDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="paymentTerms" className="text-slate-300">
                  Payment Terms
                </Label>
                <Input
                  id="paymentTerms"
                  {...form.register("paymentTerms")}
                  placeholder="e.g., Net 30 Days"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <Label className="text-slate-300 text-lg">Line Items</Label>
              {fields.map((field, index) => {
                const watchedProductId = form.watch(`lineItems.${index}.productId`)
                const selectedProduct = watchedProductId && watchedProductId !== "__custom__" 
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
                                value={productsForSelect.find(p => p.id === selectField.value) || null}
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
                  <Label htmlFor="amountPaid" className="text-slate-300">
                    Amount Paid ($)
                  </Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    step="0.01"
                    {...form.register("amountPaid")}
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
                  <span>Tax ({watchedTaxRate || 0}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <Separator className="bg-slate-500 my-2" />
                <div className="flex justify-between text-slate-50 text-xl font-semibold">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-yellow-400">
                  <span>Amount Paid:</span>
                  <span>-${(Number(form.watch("amountPaid")) || 0).toFixed(2)}</span>
                </div>
                <Separator className="bg-slate-500 my-2" />
                <div className="flex justify-between text-green-400 text-lg font-semibold">
                  <span>Balance Due:</span>
                  <span>${(totalAmount - (Number(form.watch("amountPaid")) || 0)).toFixed(2)}</span>
                </div>
              </Card>
            </div>

            {/* Notes & Instructions */}
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
                <Label htmlFor="paymentInstructions" className="text-slate-300">
                  Payment Instructions (Optional)
                </Label>
                <Textarea
                  id="paymentInstructions"
                  {...form.register("paymentInstructions")}
                  placeholder="e.g., Bank details, payment link..."
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
            onClick={form.handleSubmit(handleFormSubmitInternal)}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Invoice" : "Create Invoice"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
