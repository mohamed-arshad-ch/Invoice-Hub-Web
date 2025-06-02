"use client"

import { format } from "date-fns"
import { Eye, Edit, Trash2, DollarSign, Calendar, CreditCard, User, Package, Building, FileText, Hash } from "lucide-react"

import type { OutgoingPaymentType } from "@/lib/types/outgoing-payment"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OutgoingPaymentDetailSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  payment: OutgoingPaymentType
  onEdit: () => void
  onDelete?: () => void
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    case "scheduled":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    case "processing":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    case "cancelled":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Staff Salary":
      return <User size={20} />
    case "Cloud Subscription":
      return <Package size={20} />
    case "Expense Payment":
      return <Building size={20} />
    default:
      return <DollarSign size={20} />
  }
}

export default function OutgoingPaymentDetailSheet({
  isOpen,
  onOpenChange,
  payment,
  onEdit,
  onDelete,
}: OutgoingPaymentDetailSheetProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getPayeeName = () => {
    if (payment.staff) return payment.staff.name
    if (payment.product) return payment.product.name
    if (payment.payeeName) return payment.payeeName
    if (payment.expenseCategory) return payment.expenseCategory.name
    return "Unknown Payee"
  }

  const getPayeeDetails = () => {
    if (payment.staff) {
      return {
        type: "Staff Member",
        name: payment.staff.name,
        details: [
          { label: "Position", value: payment.staff.position },
          { label: "Department", value: payment.staff.department },
          { label: "Email", value: payment.staff.email },
          { label: "Phone", value: payment.staff.phone },
        ].filter(item => item.value)
      }
    }
    if (payment.product) {
      return {
        type: "Product/Service",
        name: payment.product.name,
        details: [
          { label: "Category", value: payment.product.category },
          { label: "Description", value: payment.product.description },
        ].filter(item => item.value)
      }
    }
    if (payment.expenseCategory) {
      return {
        type: "Expense Category",
        name: payment.expenseCategory.name,
        details: [
          { label: "Description", value: payment.expenseCategory.description },
          { label: "Status", value: payment.expenseCategory.status },
        ].filter(item => item.value)
      }
    }
    if (payment.payeeName) {
      return {
        type: "External Payee",
        name: payment.payeeName,
        details: []
      }
    }
    return {
      type: "Unknown",
      name: "Unknown Payee",
      details: []
    }
  }

  const payeeInfo = getPayeeDetails()

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getCategoryIcon(payment.paymentCategory)}
              <div>
                <SheetTitle className="text-xl font-semibold text-slate-800 dark:text-white">
                  {payment.paymentNumber}
                </SheetTitle>
                <SheetDescription className="text-sm text-slate-500 dark:text-slate-400">
                  {payment.paymentCategory}
                </SheetDescription>
              </div>
            </div>
            <Badge className={`text-sm font-medium ${getStatusColor(payment.status)}`}>
              {payment.status}
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign size={20} />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Amount</span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-slate-500 dark:text-slate-400">Payment Date</span>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span className="font-medium text-slate-800 dark:text-white">
                        {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 dark:text-slate-400">Payment Method</span>
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} />
                      <span className="font-medium text-slate-800 dark:text-white">
                        {payment.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
                {payment.referenceNumber && (
                  <div className="space-y-1">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Reference Number</span>
                    <div className="flex items-center gap-2">
                      <Hash size={16} />
                      <span className="font-mono text-sm font-medium text-slate-800 dark:text-white">
                        {payment.referenceNumber}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payee Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {getCategoryIcon(payment.paymentCategory)}
                  Payee Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Type</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      {payeeInfo.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Name</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      {payeeInfo.name}
                    </span>
                  </div>
                  {payeeInfo.details.map((detail, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{detail.label}</span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {payment.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText size={20} />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {payment.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {payment.attachments && payment.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {payment.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border border-slate-200 dark:border-slate-700 rounded">
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {attachment.name}
                        </span>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Created</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {format(new Date(payment.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Last Updated</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {format(new Date(payment.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onEdit}
            className="flex-1 sm:flex-none"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Payment
          </Button>
          {onDelete && (
            <Button
              variant="destructive"
              onClick={onDelete}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Payment
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
} 