"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Client } from "@/lib/types/client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UploadCloud } from "lucide-react"

const clientFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  company: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  address: z.object({
    street: z.string().min(3, "Street address is required."),
    city: z.string().min(2, "City is required."),
    state: z.string().min(2, "State is required."),
    zip: z.string().min(5, "ZIP code is required."),
    country: z.string().min(2, "Country is required."),
  }),
  status: z.enum(["active", "inactive"]),
  logoUrl: z.string().optional(), // For simplicity, we'll handle URL string, not actual upload
})

export type ClientFormValues = z.infer<typeof clientFormSchema>

interface ClientFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ClientFormValues) => Promise<void>
  defaultValues?: Partial<Client>
  isEditing: boolean
}

export default function ClientFormModal({ isOpen, onClose, onSubmit, defaultValues, isEditing }: ClientFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(defaultValues?.logoUrl || null)

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      company: defaultValues?.company || "",
      address: {
        street: defaultValues?.address?.street || "",
        city: defaultValues?.address?.city || "",
        state: defaultValues?.address?.state || "",
        zip: defaultValues?.address?.zip || "",
        country: defaultValues?.address?.country || "",
      },
      status: defaultValues?.status || "active",
      logoUrl: defaultValues?.logoUrl || "",
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name || "",
        email: defaultValues.email || "",
        phone: defaultValues.phone || "",
        company: defaultValues.company || "",
        address: {
          street: defaultValues.address?.street || "",
          city: defaultValues.address?.city || "",
          state: defaultValues.address?.state || "",
          zip: defaultValues.address?.zip || "",
          country: defaultValues.address?.country || "",
        },
        status: defaultValues.status || "active",
        logoUrl: defaultValues.logoUrl || "",
      })
      setLogoPreview(defaultValues.logoUrl || null)
    } else {
      form.reset() // Reset to empty for new client
      setLogoPreview(null)
    }
  }, [defaultValues, form, isOpen]) // Depend on isOpen to reset when modal reopens

  const handleFormSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true)
    await onSubmit(data)
    setIsSubmitting(false)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
        form.setValue("logoUrl", reader.result as string) // Store as base64 or a placeholder URL
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-slate-100 font-poppins">
        <DialogHeader>
          <DialogTitle className="text-blue-400">{isEditing ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEditing ? "Update the client's details below." : "Fill in the details to add a new client."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">
                Name
              </Label>
              <Input
                id="name"
                {...form.register("name")}
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-slate-300">
                Phone
              </Label>
              <Input
                id="phone"
                {...form.register("phone")}
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="company" className="text-slate-300">
                Company
              </Label>
              <Input
                id="company"
                {...form.register("company")}
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
              />
              {form.formState.errors.company && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.company.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <fieldset className="border border-slate-600 p-4 rounded-md">
            <legend className="text-sm font-medium text-slate-300 px-1">Address</legend>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address.street" className="text-slate-300">
                  Street
                </Label>
                <Input
                  id="address.street"
                  {...form.register("address.street")}
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                />
                {form.formState.errors.address?.street && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.address.street.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="address.city" className="text-slate-300">
                    City
                  </Label>
                  <Input
                    id="address.city"
                    {...form.register("address.city")}
                    className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                  />
                  {form.formState.errors.address?.city && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.address.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="address.state" className="text-slate-300">
                    State
                  </Label>
                  <Input
                    id="address.state"
                    {...form.register("address.state")}
                    className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                  />
                  {form.formState.errors.address?.state && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.address.state.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="address.zip" className="text-slate-300">
                    ZIP Code
                  </Label>
                  <Input
                    id="address.zip"
                    {...form.register("address.zip")}
                    className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                  />
                  {form.formState.errors.address?.zip && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.address.zip.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="address.country" className="text-slate-300">
                  Country
                </Label>
                <Input
                  id="address.country"
                  {...form.register("address.country")}
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                />
                {form.formState.errors.address?.country && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.address.country.message}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Status and Logo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <Label htmlFor="status" className="text-slate-300">
                Status
              </Label>
              <Select
                defaultValue={defaultValues?.status || "active"}
                onValueChange={(value: "active" | "inactive") => form.setValue("status", value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectItem value="active" className="focus:bg-slate-600">
                    Active
                  </SelectItem>
                  <SelectItem value="inactive" className="focus:bg-slate-600">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.status.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="logo" className="text-slate-300">
                Client Logo
              </Label>
              <div className="mt-1 flex items-center space-x-4">
                {logoPreview ? (
                  <img
                    src={logoPreview || "/placeholder.svg"}
                    alt="Logo Preview"
                    className="h-16 w-16 rounded-md object-cover bg-slate-600"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-md bg-slate-600 flex items-center justify-center text-slate-400">
                    <UploadCloud size={24} />
                  </div>
                )}
                <Input id="logo" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => document.getElementById("logo")?.click()}
                >
                  Upload Logo
                </Button>
              </div>
              {/* For simplicity, not adding validation for file upload itself */}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
