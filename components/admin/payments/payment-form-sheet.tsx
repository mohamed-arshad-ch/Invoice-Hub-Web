"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/hooks/use-toast"
import type { AppDispatch } from "@/lib/redux/store"
import { addPayment, updatePayment, fetchPayments } from "@/lib/redux/slices/paymentsSlice"
// Client and Invoice selectors are no longer needed for this form's primary purpose
// import { selectAllClients } from "@/lib/redux/slices/clientsSlice";
// import { selectAllInvoices, selectUnpaidInvoicesByClientId } from "@/lib/redux/slices/invoicesSlice";
import { selectAllStaff, fetchStaffMembers as fetchStaffAction } from "@/lib/redux/slices/staffSlice"
import { selectAllProducts, fetchProducts as fetchProductsAction } from "@/lib/redux/slices/productsSlice"

import {
  PaymentMethod,
  PaymentStatus,
  PaymentCategory,
  type PaymentType,
  type PaymentFormValues,
  type ExpenseCategoryType,
} from "@/lib/types/payment"
// ClientType and InvoiceType are no longer directly used in this form's state
// import type { ClientType } from "@/lib/types/client";
// import type { InvoiceType } from "@/lib/types/invoice";
// SearchableClientSelect and SearchableInvoiceSelect are removed
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Banknote,
  Briefcase,
  CalendarDays,
  Cloud,
  CreditCard,
  FileText,
  Landmark,
  ListChecks,
  Loader2,
  MessageSquare,
  Paperclip,
  Receipt,
  Users,
  Tag,
  Building,
} from "lucide-react"

interface PaymentFormSheetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  paymentData?: PaymentType | null
}

const paymentMethodOptions = Object.values(PaymentMethod)

// Only outgoing payment statuses are needed now
const paymentStatusOptions = [
  PaymentStatus.Scheduled,
  PaymentStatus.Processing,
  PaymentStatus.Paid,
  PaymentStatus.Failed,
  PaymentStatus.Cancelled,
]

// Updated: Removed CLIENT_PAYMENT
const paymentCategoryOptions = [
  PaymentCategory.EXPENSE_PAYMENT,
  PaymentCategory.STAFF_SALARY,
  PaymentCategory.CLOUD_SUBSCRIPTION,
  PaymentCategory.OTHER_OUTGOING,
]

const mockExpenseCategories: ExpenseCategoryType[] = [
  { id: "exp_cat_1", name: "Office Supplies" },
  { id: "exp_cat_2", name: "Travel & Accommodation" },
  { id: "exp_cat_3", name: "Software & Subscriptions" },
  { id: "exp_cat_4", name: "Utilities" },
  { id: "exp_cat_5", name: "Marketing & Advertising" },
  { id: "exp_cat_6", name: "Rent & Lease" },
  { id: "exp_cat_7", name: "Professional Fees" },
  { id: "exp_cat_8", name: "Other Expenses" },
]

const getPaymentMethodIcon = (method?: PaymentMethod) => {
  if (!method) return <CreditCard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
  switch (method) {
    case PaymentMethod.Card:
      return <CreditCard className="h-4 w-4" />
    case PaymentMethod.BankTransfer:
      return <Landmark className="h-4 w-4" />
    case PaymentMethod.Cash:
      return <Banknote className="h-4 w-4" />
    case PaymentMethod.Cheque:
      return <FileText className="h-4 w-4" />
    case PaymentMethod.Online:
      return <Receipt className="h-4 w-4" />
    case PaymentMethod.DirectDebit:
      return <Briefcase className="h-4 w-4" />
    default:
      return <CreditCard className="h-4 w-4" />
  }
}

const PaymentFormSheet: React.FC<PaymentFormSheetProps> = ({ isOpen, onOpenChange, paymentData }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()

  const staffMembers = useSelector(selectAllStaff)
  const products = useSelector(selectAllProducts)

  const [isLoading, setIsLoading] = useState(false)

  const initialFormValues: PaymentFormValues = useMemo(
    () => ({
      paymentCategory: PaymentCategory.EXPENSE_PAYMENT, // Default to first outgoing category
      expenseCategoryId: null,
      staffId: null,
      productId: null,
      payeeName: null,
      amount: 0,
      paymentDate: new Date().toISOString(),
      paymentMethod: PaymentMethod.BankTransfer, // Sensible default for outgoing
      status: PaymentStatus.Scheduled, // Default status for outgoing
      referenceNumber: "",
      notes: "",
      attachments: [],
    }),
    [],
  )

  const [formValues, setFormValues] = useState<PaymentFormValues>(initialFormValues)

  useEffect(() => {
    if (staffMembers.length === 0) {
      dispatch(fetchStaffAction())
    }
    if (products.length === 0) {
      dispatch(fetchProductsAction())
    }
  }, [dispatch, staffMembers.length, products.length])

  useEffect(() => {
    if (isOpen) {
      if (paymentData) {
        setFormValues({
          ...initialFormValues, // Start with defaults to clear irrelevant fields
          ...paymentData, // Overlay with paymentData
        })
      } else {
        // Reset to initial values, ensuring category default is applied
        setFormValues((prev) => ({
          ...initialFormValues,
          // Retain chosen category if form was merely closed and reopened without submission
          paymentCategory: prev.paymentCategory || PaymentCategory.EXPENSE_PAYMENT,
          status: PaymentStatus.Scheduled, // Always default to Scheduled for new outgoing
        }))
      }
    }
  }, [isOpen, paymentData, initialFormValues])

  const handlePaymentCategoryChange = useCallback(
    (newCategory: PaymentCategory) => {
      setFormValues((prev) => ({
        ...initialFormValues, // Reset most fields to default for the new category structure
        paymentCategory: newCategory,
        amount: prev.amount, // Retain common fields if user already started typing
        paymentDate: prev.paymentDate,
        paymentMethod: prev.paymentMethod,
        referenceNumber: prev.referenceNumber,
        notes: prev.notes,
        status: PaymentStatus.Scheduled, // Default for any outgoing category
      }))
    },
    [initialFormValues],
  )

  // Removed handleClientChange and handleInvoicesChange as they are no longer used

  // Removed useEffect for allocations as it's no longer applicable

  const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: name === "amount" ? Number.parseFloat(value) || 0 : value }))
  }

  const handleSelectChange = (name: string, value: string | null) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormValues((prev) => ({ ...prev, paymentDate: date.toISOString() }))
    }
  }

  // Removed totalAllocated and unallocatedAmount useMemos

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formValues.amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Payment amount must be greater than zero.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Category specific validations
    if (formValues.paymentCategory === PaymentCategory.EXPENSE_PAYMENT && !formValues.expenseCategoryId) {
      toast({ title: "Validation Error", description: "Please select an expense category.", variant: "destructive" })
      setIsLoading(false)
      return
    }
    if (formValues.paymentCategory === PaymentCategory.STAFF_SALARY && !formValues.staffId) {
      toast({ title: "Validation Error", description: "Please select a staff member.", variant: "destructive" })
      setIsLoading(false)
      return
    }
    if (formValues.paymentCategory === PaymentCategory.CLOUD_SUBSCRIPTION && !formValues.productId) {
      toast({
        title: "Validation Error",
        description: "Please select a product/service for subscription.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }
    if (
      (formValues.paymentCategory === PaymentCategory.EXPENSE_PAYMENT ||
        formValues.paymentCategory === PaymentCategory.CLOUD_SUBSCRIPTION ||
        formValues.paymentCategory === PaymentCategory.OTHER_OUTGOING) &&
      !formValues.payeeName
    ) {
      toast({ title: "Validation Error", description: "Please enter a Payee Name.", variant: "destructive" })
      setIsLoading(false)
      return
    }

    // Allocation validation is removed

    const submissionData: PaymentFormValues = {
      ...formValues,
      // Ensure only relevant fields are passed based on category
      expenseCategoryId:
        formValues.paymentCategory === PaymentCategory.EXPENSE_PAYMENT ? formValues.expenseCategoryId : null,
      staffId: formValues.paymentCategory === PaymentCategory.STAFF_SALARY ? formValues.staffId : null,
      productId: formValues.paymentCategory === PaymentCategory.CLOUD_SUBSCRIPTION ? formValues.productId : null,
      payeeName:
        formValues.paymentCategory === PaymentCategory.EXPENSE_PAYMENT ||
        formValues.paymentCategory === PaymentCategory.CLOUD_SUBSCRIPTION ||
        formValues.paymentCategory === PaymentCategory.OTHER_OUTGOING
          ? formValues.payeeName
          : null,
      // Client/Invoice related fields are naturally null/empty due to type changes and form logic
    }

    try {
      if (paymentData?.id) {
        await dispatch(updatePayment({ ...submissionData, id: paymentData.id } as PaymentType)).unwrap()
        toast({ title: "Success", description: "Payment updated successfully." })
      } else {
        await dispatch(addPayment(submissionData)).unwrap()
        toast({ title: "Success", description: "Payment recorded successfully." })
      }
      dispatch(fetchPayments(null)) // Consider passing current filters if you want to stay on a filtered view
      onOpenChange(false)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save payment.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-poppins overflow-y-hidden flex flex-col">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-2xl font-bold text-slate-800 dark:text-white">
            {paymentData ? "Edit Outgoing Payment" : "Record New Outgoing Payment"}
          </SheetTitle>
          <SheetDescription className="text-slate-500 dark:text-slate-400">
            {paymentData ? "Update outgoing payment details." : "Enter details for the new outgoing payment."}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow px-1 py-1">
          <form onSubmit={handleSubmit} className="space-y-6 p-6" id="payment-form">
            <div className="space-y-2">
              <Label htmlFor="paymentCategory" className="font-semibold flex items-center">
                <Tag size={16} className="mr-2 text-primary dark:text-sky-400" />
                Payment Category
              </Label>
              <Select
                name="paymentCategory"
                value={formValues.paymentCategory}
                onValueChange={(value) => handlePaymentCategoryChange(value as PaymentCategory)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <SelectValue placeholder="Select payment category" />
                </SelectTrigger>
                <SelectContent>
                  {paymentCategoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields Start Here - Client Payment section is removed */}

            {formValues.paymentCategory === PaymentCategory.EXPENSE_PAYMENT && (
              <div className="space-y-2">
                <Label htmlFor="expenseCategoryId" className="font-semibold flex items-center">
                  <Briefcase size={16} className="mr-2 text-primary dark:text-sky-400" /> Expense Category
                </Label>
                <Select
                  name="expenseCategoryId"
                  value={formValues.expenseCategoryId || ""}
                  onValueChange={(v) => handleSelectChange("expenseCategoryId", v)}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Select expense category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockExpenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formValues.paymentCategory === PaymentCategory.STAFF_SALARY && (
              <div className="space-y-2">
                <Label htmlFor="staffId" className="font-semibold flex items-center">
                  <Users size={16} className="mr-2 text-primary dark:text-sky-400" /> Staff Member
                </Label>
                <Select
                  name="staffId"
                  value={formValues.staffId || ""}
                  onValueChange={(v) => handleSelectChange("staffId", v)}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name} ({staff.employeeId || "N/A"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formValues.paymentCategory === PaymentCategory.CLOUD_SUBSCRIPTION && (
              <div className="space-y-2">
                <Label htmlFor="productId" className="font-semibold flex items-center">
                  <Cloud size={16} className="mr-2 text-primary dark:text-sky-400" /> Product/Service Subscribed
                </Label>
                <Select
                  name="productId"
                  value={formValues.productId || ""}
                  onValueChange={(v) => handleSelectChange("productId", v)}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Select product/service" />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter((p) => p.category === "Service" || p.category === "Subscription" || !p.category)
                      .map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(formValues.paymentCategory === PaymentCategory.EXPENSE_PAYMENT ||
              formValues.paymentCategory === PaymentCategory.CLOUD_SUBSCRIPTION ||
              formValues.paymentCategory === PaymentCategory.OTHER_OUTGOING) && (
              <div className="space-y-2">
                <Label htmlFor="payeeName" className="font-semibold flex items-center">
                  <Building size={16} className="mr-2 text-primary dark:text-sky-400" /> Payee Name
                </Label>
                <Input
                  id="payeeName"
                  name="payeeName"
                  value={formValues.payeeName || ""}
                  onChange={handleSimpleChange}
                  placeholder="Enter payee name"
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  required // Make payee name required for these types
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="font-semibold flex items-center">
                  <Banknote size={16} className="mr-2 text-primary dark:text-sky-400" /> Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formValues.amount}
                  onChange={handleSimpleChange}
                  required
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate" className="font-semibold flex items-center">
                  <CalendarDays size={16} className="mr-2 text-primary dark:text-sky-400" /> Payment Date
                </Label>
                <DatePicker
                  date={formValues.paymentDate ? new Date(formValues.paymentDate) : undefined}
                  onSelect={handleDateChange}
                  buttonClassName="w-full justify-start text-left font-normal bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="font-semibold flex items-center">
                  {getPaymentMethodIcon(formValues.paymentMethod)} Payment Method
                </Label>
                <Select
                  name="paymentMethod"
                  value={formValues.paymentMethod}
                  onValueChange={(v) => handleSelectChange("paymentMethod", v)}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referenceNumber" className="font-semibold flex items-center">
                  <FileText size={16} className="mr-2 text-primary dark:text-sky-400" /> Reference Number
                </Label>
                <Input
                  id="referenceNumber"
                  name="referenceNumber"
                  value={formValues.referenceNumber || ""}
                  onChange={handleSimpleChange}
                  placeholder="e.g., Transaction ID, Cheque #"
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
              </div>
            </div>

            {/* Invoice Allocations section is removed */}

            <div className="space-y-2">
              <Label htmlFor="status" className="font-semibold flex items-center">
                <ListChecks size={16} className="mr-2 text-primary dark:text-sky-400" /> Payment Status
              </Label>
              <Select
                name="status"
                value={formValues.status} // Should be one of the outgoing statuses
                onValueChange={(v) => handleSelectChange("status", v as PaymentStatus)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map(
                    (
                      status, // Use the filtered paymentStatusOptions
                    ) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-semibold flex items-center">
                <MessageSquare size={16} className="mr-2 text-primary dark:text-sky-400" /> Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formValues.notes || ""}
                onChange={handleSimpleChange}
                placeholder="Any additional notes..."
                className="min-h-[80px] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments" className="font-semibold flex items-center">
                <Paperclip size={16} className="mr-2 text-primary dark:text-sky-400" /> Attachments
              </Label>
              <Input
                type="file"
                multiple
                disabled // Attachment functionality is a future enhancement
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary dark:file:bg-sky-500/10 dark:file:text-sky-400 hover:file:bg-primary/20 dark:hover:file:bg-sky-500/20"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Attachment functionality is a future enhancement.
              </p>
            </div>
          </form>
        </ScrollArea>
        <SheetFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50">
          <SheetClose asChild>
            <Button variant="outline" className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="submit"
            form="payment-form"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-6 rounded-md shadow-md transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: "#3A86FF" }}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {paymentData ? "Save Changes" : "Record Payment"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default PaymentFormSheet
