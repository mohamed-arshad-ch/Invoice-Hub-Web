"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import type { OutgoingPaymentType, OutgoingPaymentCategory, OutgoingPaymentMethod, OutgoingPaymentStatus, ExpenseCategoryType } from "@/lib/types/outgoing-payment"
import type { Staff } from "@/lib/types/staff"
import type { Product } from "@/lib/types/product"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import SearchableSelect from "@/components/ui/searchableSelect"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertCircle, DollarSign, User, Package, Building } from "lucide-react"

const outgoingPaymentFormSchema = z.object({
  paymentCategory: z.enum(["Expense Payment", "Staff Salary", "Cloud Subscription", "Other Outgoing Payment"]),
  expenseCategoryId: z.number().optional(),
  staffId: z.number().optional(),
  productId: z.number().optional(),
  payeeName: z.string().optional(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentDate: z.date({ required_error: "Payment date is required" }),
  paymentMethod: z.enum(["Cash", "Card", "Bank Transfer", "Cheque", "Online Payment", "Direct Debit", "Other"]),
  referenceNumber: z.string().optional(),
  status: z.enum(["Scheduled", "Paid", "Failed", "Cancelled", "Processing"]),
  notes: z.string().optional(),
})

type OutgoingPaymentFormData = z.infer<typeof outgoingPaymentFormSchema>

export type OutgoingPaymentFormSubmitValues = {
  paymentCategory: OutgoingPaymentCategory
  expenseCategoryId?: number
  staffId?: number
  productId?: number
  payeeName?: string
  amount: number
  paymentDate: string
  paymentMethod: OutgoingPaymentMethod
  referenceNumber?: string
  status: OutgoingPaymentStatus
  notes?: string
}

interface OutgoingPaymentFormSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: OutgoingPaymentFormSubmitValues) => Promise<void>
  defaultValues?: Partial<OutgoingPaymentType>
  isEditing: boolean
  staff: Staff[]
  products: Product[]
  expenseCategories: ExpenseCategoryType[]
  isLoading?: boolean
}

const paymentCategories = [
  { value: "Expense Payment", label: "Expense Payment" },
  { value: "Staff Salary", label: "Staff Salary" },
  { value: "Cloud Subscription", label: "Cloud Subscription" },
  { value: "Other Outgoing Payment", label: "Other Outgoing Payment" },
]

const paymentMethods = [
  { value: "Cash", label: "Cash" },
  { value: "Card", label: "Card" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Cheque", label: "Cheque" },
  { value: "Online Payment", label: "Online Payment" },
  { value: "Direct Debit", label: "Direct Debit" },
  { value: "Other", label: "Other" },
]

const paymentStatuses = [
  { value: "Scheduled", label: "Scheduled" },
  { value: "Paid", label: "Paid" },
  { value: "Failed", label: "Failed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Processing", label: "Processing" },
]

export default function OutgoingPaymentFormSheet({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isEditing,
  staff,
  products,
  expenseCategories,
  isLoading,
}: OutgoingPaymentFormSheetProps) {
  const form = useForm<OutgoingPaymentFormData>({
    resolver: zodResolver(outgoingPaymentFormSchema),
    defaultValues: {
      paymentCategory: (defaultValues?.paymentCategory as any) || "Expense Payment",
      expenseCategoryId: defaultValues?.expenseCategoryId || undefined,
      staffId: defaultValues?.staffId || undefined,
      productId: defaultValues?.productId || undefined,
      payeeName: defaultValues?.payeeName || "",
      amount: defaultValues?.amount || 0,
      paymentDate: defaultValues?.paymentDate ? new Date(defaultValues.paymentDate) : new Date(),
      paymentMethod: (defaultValues?.paymentMethod as any) || "Bank Transfer",
      referenceNumber: defaultValues?.referenceNumber || "",
      status: (defaultValues?.status as any) || "Scheduled",
      notes: defaultValues?.notes || "",
    },
  })

  const watchedCategory = form.watch("paymentCategory")

  useEffect(() => {
    if (isOpen) {
      form.reset({
        paymentCategory: (defaultValues?.paymentCategory as any) || "Expense Payment",
        expenseCategoryId: defaultValues?.expenseCategoryId || undefined,
        staffId: defaultValues?.staffId || undefined,
        productId: defaultValues?.productId || undefined,
        payeeName: defaultValues?.payeeName || "",
        amount: defaultValues?.amount || 0,
        paymentDate: defaultValues?.paymentDate ? new Date(defaultValues.paymentDate) : new Date(),
        paymentMethod: (defaultValues?.paymentMethod as any) || "Bank Transfer",
        referenceNumber: defaultValues?.referenceNumber || "",
        status: (defaultValues?.status as any) || "Scheduled",
        notes: defaultValues?.notes || "",
      })
    }
  }, [defaultValues, form, isOpen])

  const handleFormSubmitInternal = async (data: OutgoingPaymentFormData) => {
    const submissionData: OutgoingPaymentFormSubmitValues = {
      ...data,
      paymentCategory: data.paymentCategory as OutgoingPaymentCategory,
      paymentMethod: data.paymentMethod as OutgoingPaymentMethod,
      status: data.status as OutgoingPaymentStatus,
      paymentDate: data.paymentDate.toISOString(),
      amount: Number(data.amount),
    }
    try {
      await onSubmit(submissionData)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-xl font-semibold text-slate-800 dark:text-white">
            {isEditing ? "Edit Outgoing Payment" : "Record New Outgoing Payment"}
          </SheetTitle>
          <SheetDescription className="text-sm text-slate-500 dark:text-slate-400">
            {isEditing ? "Update payment details below." : "Fill in the details to record a new outgoing payment."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <form onSubmit={form.handleSubmit(handleFormSubmitInternal)} className="space-y-6 py-4">
            {/* Payment Category */}
            <div className="space-y-2">
              <Label htmlFor="paymentCategory" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Payment Category *
              </Label>
              <Controller
                name="paymentCategory"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment category" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <DollarSign size={16} />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.paymentCategory && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {form.formState.errors.paymentCategory.message}
                </p>
              )}
            </div>

            {/* Conditional Fields Based on Category */}
            {watchedCategory === "Expense Payment" && (
              <div className="space-y-2">
                <Label htmlFor="expenseCategoryId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Expense Category
                </Label>
                <Controller
                  name="expenseCategoryId"
                  control={form.control}
                  render={({ field }) => (
                    <Select 
                      value={field.value?.toString() || ""} 
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      disabled={expenseCategories.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={
                          expenseCategories.length === 0 
                            ? "No expense categories available" 
                            : "Select expense category"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-slate-500 dark:text-slate-400">
                            No expense categories available
                          </div>
                        ) : (
                          expenseCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Building size={16} />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {watchedCategory === "Staff Salary" && (
              <div className="space-y-2">
                <Label htmlFor="staffId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Staff Member *
                </Label>
                <Controller
                  name="staffId"
                  control={form.control}
                  render={({ field }) => (
                    <SearchableSelect
                      items={staff}
                      value={staff.find(member => Number(member.id) === field.value) || null}
                      onChange={(selectedStaff) => field.onChange(selectedStaff ? Number(selectedStaff.id) : undefined)}
                      placeholder={
                        staff.length === 0 
                          ? "No staff members available" 
                          : "Search and select staff member..."
                      }
                      displayKey="name"
                      valueKey="id"
                      searchKeys={["name", "position", "email"]}
                      disabled={staff.length === 0}
                      clearable={true}
                      emptyMessage="No staff members found"
                      className="w-full"
                      error={!!form.formState.errors.staffId}
                      errorMessage={form.formState.errors.staffId?.message}
                    />
                  )}
                />
                {form.formState.errors.staffId && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={16} />
                    Staff member is required for salary payments
                  </p>
                )}
              </div>
            )}

            {watchedCategory === "Cloud Subscription" && (
              <div className="space-y-2">
                <Label htmlFor="productId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Product/Service *
                </Label>
                <Controller
                  name="productId"
                  control={form.control}
                  render={({ field }) => (
                    <SearchableSelect
                      items={products}
                      value={products.find(product => Number(product.id) === field.value) || null}
                      onChange={(selectedProduct) => field.onChange(selectedProduct ? Number(selectedProduct.id) : undefined)}
                      placeholder={
                        products.length === 0 
                          ? "No products/services available" 
                          : "Search and select product/service..."
                      }
                      displayKey="name"
                      valueKey="id"
                      searchKeys={["name", "description", "category"]}
                      disabled={products.length === 0}
                      clearable={true}
                      emptyMessage="No products/services found"
                      className="w-full"
                      error={!!form.formState.errors.productId}
                      errorMessage={form.formState.errors.productId?.message}
                    />
                  )}
                />
                {form.formState.errors.productId && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={16} />
                    Product/Service is required for subscription payments
                  </p>
                )}
              </div>
            )}

            {watchedCategory === "Other Outgoing Payment" && (
              <div className="space-y-2">
                <Label htmlFor="payeeName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Payee Name *
                </Label>
                <Input
                  {...form.register("payeeName")}
                  placeholder="Enter payee name"
                  className="w-full"
                />
                {form.formState.errors.payeeName && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={16} />
                    Payee name is required for other payments
                  </p>
                )}
              </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Amount *
              </Label>
              <Input
                {...form.register("amount")}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full"
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
              <Label htmlFor="paymentDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Payment Date *
              </Label>
              <Controller
                name="paymentDate"
                control={form.control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    className="w-full"
                  />
                )}
              />
              {form.formState.errors.paymentDate && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {form.formState.errors.paymentDate.message}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Payment Method *
              </Label>
              <Controller
                name="paymentMethod"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.paymentMethod && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {form.formState.errors.paymentMethod.message}
                </p>
              )}
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <Label htmlFor="referenceNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Reference Number
              </Label>
              <Input
                {...form.register("referenceNumber")}
                placeholder="Transaction ID, cheque number, etc."
                className="w-full"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Status *
              </Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.status && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Notes
              </Label>
              <Textarea
                {...form.register("notes")}
                placeholder="Additional notes about this payment..."
                className="w-full min-h-[80px]"
              />
            </div>
          </form>
        </ScrollArea>

        <Separator className="my-4" />

        <SheetFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleFormSubmitInternal)}
            disabled={isLoading}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Payment" : "Record Payment"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
} 