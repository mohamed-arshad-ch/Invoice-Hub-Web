"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Client, ClientFormData } from "@/lib/types/client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Building2, User, Mail, Phone, MapPin, CreditCard, FileText } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const clientFormSchema = z.object({
  business_name: z.string().min(2, { message: "Business name must be at least 2 characters." }),
  contact_person: z.string().min(2, { message: "Contact person name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  payment_schedule: z.enum(["weekly", "monthly", "quarterly", "annually"], {
    required_error: "Please select a payment schedule.",
  }),
  payment_terms: z.enum(["net_15", "net_30", "net_45", "net_60", "cod", "prepaid"], {
    required_error: "Please select payment terms.",
  }),
  status: z.boolean(),
  notes: z.string().optional(),
})

export type ClientFormValues = z.infer<typeof clientFormSchema>

interface ClientFormSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ClientFormValues) => Promise<void>
  defaultValues?: Partial<Client>
  isEditing: boolean
}

export default function ClientFormSheet({ 
  isOpen, 
  onClose, 
  onSubmit, 
  defaultValues, 
  isEditing 
}: ClientFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      business_name: "",
      contact_person: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      payment_schedule: "monthly",
      payment_terms: "net_30",
      status: true,
      notes: "",
    },
  })

  useEffect(() => {
    if (defaultValues && isOpen) {
      form.reset({
        business_name: defaultValues.business_name || "",
        contact_person: defaultValues.contact_person || "",
        email: defaultValues.email || "",
        phone: defaultValues.phone || "",
        street: defaultValues.street || "",
        city: defaultValues.city || "",
        state: defaultValues.state || "",
        zip: defaultValues.zip || "",
        payment_schedule: (defaultValues.payment_schedule as "weekly" | "monthly" | "quarterly" | "annually") || "monthly",
        payment_terms: (defaultValues.payment_terms as "net_15" | "net_30" | "net_45" | "net_60" | "cod" | "prepaid") || "net_30",
        status: defaultValues.status ?? true,
        notes: defaultValues.notes || "",
      })
    } else if (!isEditing && isOpen) {
      form.reset({
        business_name: "",
        contact_person: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        payment_schedule: "monthly",
        payment_terms: "net_30",
        status: true,
        notes: "",
      })
    }
  }, [defaultValues, form, isOpen, isEditing])

  const handleFormSubmit: SubmitHandler<ClientFormValues> = async (data) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      if (!isEditing) {
        form.reset()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-slate-100 font-poppins overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-blue-400 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEditing ? "Edit Client" : "Add New Client"}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {isEditing ? "Update the client's details below." : "Fill in the details to add a new client."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-6">
          {/* Business Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="h-4 w-4" />
              <h3 className="font-medium">Business Information</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="business_name" className="text-slate-300">
                  Business Name *
                </Label>
                <Input
                  id="business_name"
                  {...form.register("business_name")}
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                  placeholder="Enter business name"
                />
                {form.formState.errors.business_name && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.business_name.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-slate-600" />

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <User className="h-4 w-4" />
              <h3 className="font-medium">Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="contact_person" className="text-slate-300">
                  Contact Person *
                </Label>
                <Input
                  id="contact_person"
                  {...form.register("contact_person")}
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                  placeholder="Enter contact person name"
                />
                {form.formState.errors.contact_person && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.contact_person.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                    placeholder="Enter email address"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-slate-300 flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                    placeholder="Enter phone number"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-600" />

          {/* Address Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="h-4 w-4" />
              <h3 className="font-medium">Address Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="street" className="text-slate-300">
                  Street Address
                </Label>
                <Input
                  id="street"
                  {...form.register("street")}
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="text-slate-300">
                    City
                  </Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <Label htmlFor="state" className="text-slate-300">
                    State
                  </Label>
                  <Input
                    id="state"
                    {...form.register("state")}
                    className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <Label htmlFor="zip" className="text-slate-300">
                    ZIP Code
                  </Label>
                  <Input
                    id="zip"
                    {...form.register("zip")}
                    className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-600" />

          {/* Payment Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <CreditCard className="h-4 w-4" />
              <h3 className="font-medium">Payment Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_schedule" className="text-slate-300">
                  Payment Schedule *
                </Label>
                <Select
                  value={form.watch("payment_schedule")}
                  onValueChange={(value) => form.setValue("payment_schedule", value as any)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                    <SelectValue placeholder="Select payment schedule" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectItem value="weekly" className="focus:bg-slate-600">Weekly</SelectItem>
                    <SelectItem value="monthly" className="focus:bg-slate-600">Monthly</SelectItem>
                    <SelectItem value="quarterly" className="focus:bg-slate-600">Quarterly</SelectItem>
                    <SelectItem value="annually" className="focus:bg-slate-600">Annually</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.payment_schedule && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.payment_schedule.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="payment_terms" className="text-slate-300">
                  Payment Terms *
                </Label>
                <Select
                  value={form.watch("payment_terms")}
                  onValueChange={(value) => form.setValue("payment_terms", value as any)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectItem value="net_15" className="focus:bg-slate-600">Net 15</SelectItem>
                    <SelectItem value="net_30" className="focus:bg-slate-600">Net 30</SelectItem>
                    <SelectItem value="net_45" className="focus:bg-slate-600">Net 45</SelectItem>
                    <SelectItem value="net_60" className="focus:bg-slate-600">Net 60</SelectItem>
                    <SelectItem value="cod" className="focus:bg-slate-600">COD</SelectItem>
                    <SelectItem value="prepaid" className="focus:bg-slate-600">Prepaid</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.payment_terms && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.payment_terms.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-slate-600" />

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <FileText className="h-4 w-4" />
              <h3 className="font-medium">Additional Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="status" className="text-slate-300">
                    Active Status
                  </Label>
                  <p className="text-sm text-slate-400">
                    Inactive clients will be hidden from most views
                  </p>
                </div>
                <Switch
                  id="status"
                  checked={form.watch("status")}
                  onCheckedChange={(checked) => form.setValue("status", checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-slate-300">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 min-h-[100px]"
                  placeholder="Add any additional notes about this client..."
                />
              </div>
            </div>
          </div>

          <SheetFooter className="pt-6">
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
              disabled={isSubmitting} 
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Client" : "Create Client"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
} 