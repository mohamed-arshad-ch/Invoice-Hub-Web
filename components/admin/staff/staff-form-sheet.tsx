"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import type { Staff, StaffRole, StaffStatus } from "@/lib/types/staff"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, UploadCloud } from "lucide-react"
import { format } from "date-fns"

const staffFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  position: z.string().min(2, "Position is required."),
  role: z.enum([
    "admin",
    "manager",
    "developer",
    "designer",
    "support_specialist",
    "hr_coordinator",
    "sales_executive",
    "support",
  ]),
  department: z.string().optional(),
  salary: z.coerce.number().optional(),
  payment_rate: z.coerce.number().min(0, "Payment rate must be a positive number."),
  payment_frequency: z.string().optional(),
  payment_type: z.string().optional(),
  payment_duration: z.string().optional(),
  payment_time: z.string().optional(),
  joinDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid join date." }),
  status: z.enum(["active", "inactive", "on_leave"]),
  profilePictureUrl: z.string().optional(),
  permissions: z.array(z.string()).optional(),
})

export type StaffFormValues = z.infer<typeof staffFormSchema>

interface StaffFormSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StaffFormValues) => Promise<void>
  defaultValues?: Partial<Staff>
  isEditing: boolean
}

const roles: StaffRole[] = [
  "admin",
  "manager",
  "developer",
  "designer",
  "support_specialist",
  "hr_coordinator",
  "sales_executive",
  "support",
]
const statuses: StaffStatus[] = ["active", "inactive", "on_leave"]
const departments = ["Engineering", "Design", "Marketing", "Sales", "Human Resources", "Customer Support", "Finance"]
const paymentTypes = ["hourly", "monthly", "weekly", "daily", "yearly"]
const paymentFrequencies = ["hourly", "daily", "weekly", "monthly", "yearly"]

export default function StaffFormSheet({ isOpen, onClose, onSubmit, defaultValues, isEditing }: StaffFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(
    defaultValues?.avatar || null,
  )

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: { street: "", city: "", state: "", zip: "", country: "" },
      position: "",
      role: "support",
      department: "Engineering",
      salary: 0,
      payment_rate: 0,
      payment_frequency: "hourly",
      payment_type: "hourly",
      payment_duration: "hourly",
      payment_time: "daily",
      joinDate: format(new Date(), "yyyy-MM-dd"),
      status: "active",
      profilePictureUrl: "",
      permissions: [],
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        form.reset({
          ...defaultValues,
          salary: defaultValues.salary || 0,
          payment_rate: defaultValues.payment_rate || 0,
          payment_frequency: defaultValues.payment_frequency || "hourly",
          payment_type: defaultValues.payment_type || "hourly",
          payment_duration: defaultValues.payment_duration || "hourly",
          payment_time: defaultValues.payment_time || "daily",
          joinDate: defaultValues.joinDate
            ? format(new Date(defaultValues.joinDate), "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd"),
          address: defaultValues.address || { street: "", city: "", state: "", zip: "", country: "" },
          profilePictureUrl: defaultValues.avatar || "",
          permissions: defaultValues.permissions || [],
        })
        setProfilePicturePreview(defaultValues.avatar || null)
      } else {
        form.reset({
          // Reset to empty/default for new staff
          name: "",
          email: "",
          phone: "",
          address: { street: "", city: "", state: "", zip: "", country: "" },
          position: "",
          role: "support",
          department: "Engineering",
          salary: 0,
          payment_rate: 0,
          payment_frequency: "hourly",
          payment_type: "hourly",
          payment_duration: "hourly",
          payment_time: "daily",
          joinDate: format(new Date(), "yyyy-MM-dd"),
          status: "active",
          profilePictureUrl: "",
          permissions: [],
        })
        setProfilePicturePreview(null)
      }
    }
  }, [defaultValues, form, isOpen])

  const handleFormSubmit = async (data: StaffFormValues) => {
    setIsSubmitting(true)
    await onSubmit(data)
    setIsSubmitting(false)
    // onClose(); // Typically handled by parent after successful submission
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
        form.setValue("profilePictureUrl", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-slate-800 border-slate-700 text-slate-100 font-poppins flex flex-col">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-blue-400">{isEditing ? "Edit Staff Member" : "Add New Staff Member"}</SheetTitle>
          <SheetDescription className="text-slate-400">
            {isEditing ? "Update the staff member's details." : "Fill in the details for the new staff member."}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow px-6 py-4">
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-2">
              <Label htmlFor="profilePicture" className="text-slate-300 self-start">
                Profile Picture
              </Label>
              {profilePicturePreview ? (
                <Image
                  src={profilePicturePreview || "/placeholder.svg"}
                  alt="Profile Preview"
                  width={100}
                  height={100}
                  className="h-24 w-24 rounded-full object-cover bg-slate-600 border-2 border-slate-500"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-500">
                  <UploadCloud size={32} />
                </div>
              )}
              <Input id="profilePicture" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => document.getElementById("profilePicture")?.click()}
              >
                Upload Picture
              </Button>
            </div>

            {/* Personal Info */}
            <fieldset className="border border-slate-600 p-4 rounded-md space-y-4">
              <legend className="text-sm font-medium text-slate-300 px-1">Personal Information</legend>
              <div>
                <Label htmlFor="name" className="text-slate-300">
                  Name
                </Label>
                <Input id="name" {...form.register("name")} className="bg-slate-700 border-slate-600 text-slate-50" />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-slate-300">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Address Info */}
            <fieldset className="border border-slate-600 p-4 rounded-md space-y-4">
              <legend className="text-sm font-medium text-slate-300 px-1">Address</legend>
              <div>
                <Label htmlFor="address.street" className="text-slate-300">
                  Street
                </Label>
                <Input
                  id="address.street"
                  {...form.register("address.street")}
                  className="bg-slate-700 border-slate-600 text-slate-50"
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
                    className="bg-slate-700 border-slate-600 text-slate-50"
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
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                  {form.formState.errors.address?.state && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.address.state.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="address.zip" className="text-slate-300">
                    ZIP
                  </Label>
                  <Input
                    id="address.zip"
                    {...form.register("address.zip")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
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
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
                {form.formState.errors.address?.country && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.address.country.message}</p>
                )}
              </div>
            </fieldset>

            {/* Employment Info */}
            <fieldset className="border border-slate-600 p-4 rounded-md space-y-4">
              <legend className="text-sm font-medium text-slate-300 px-1">Employment Details</legend>
              <div>
                <Label htmlFor="position" className="text-slate-300">
                  Position
                </Label>
                <Input
                  id="position"
                  {...form.register("position")}
                  className="bg-slate-700 border-slate-600 text-slate-50"
                  placeholder="e.g., Senior Developer, HR Manager"
                />
                {form.formState.errors.position && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.position.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role" className="text-slate-300">
                    Role
                  </Label>
                  <Select value={form.watch("role")} onValueChange={(value: StaffRole) => form.setValue("role", value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                      {roles.map((role) => (
                        <SelectItem key={role} value={role} className="focus:bg-slate-600 capitalize">
                          {role.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.role && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.role.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="department" className="text-slate-300">
                    Department
                  </Label>
                  <Select
                    value={form.watch("department")}
                    onValueChange={(value: string) => form.setValue("department", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept} className="focus:bg-slate-600">
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.department && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.department.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary" className="text-slate-300">
                    Salary ($)
                  </Label>
                  <Input
                    id="salary"
                    type="number"
                    {...form.register("salary")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                    placeholder="Annual salary"
                  />
                  {form.formState.errors.salary && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.salary.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="payment_rate" className="text-slate-300">
                    Payment Rate ($)
                  </Label>
                  <Input
                    id="payment_rate"
                    type="number"
                    step="0.01"
                    {...form.register("payment_rate")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                    placeholder="Hourly/daily rate"
                  />
                  {form.formState.errors.payment_rate && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.payment_rate.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_type" className="text-slate-300">
                    Payment Type
                  </Label>
                  <Select
                    value={form.watch("payment_type")}
                    onValueChange={(value: string) => form.setValue("payment_type", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                      {paymentTypes.map((type) => (
                        <SelectItem key={type} value={type} className="focus:bg-slate-600 capitalize">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.payment_type && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.payment_type.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="payment_frequency" className="text-slate-300">
                    Payment Frequency
                  </Label>
                  <Select
                    value={form.watch("payment_frequency")}
                    onValueChange={(value: string) => form.setValue("payment_frequency", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                      {paymentFrequencies.map((freq) => (
                        <SelectItem key={freq} value={freq} className="focus:bg-slate-600 capitalize">
                          {freq}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.payment_frequency && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.payment_frequency.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="joinDate" className="text-slate-300">
                    Join Date
                  </Label>
                  <Input
                    id="joinDate"
                    type="date"
                    {...form.register("joinDate")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                  {form.formState.errors.joinDate && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.joinDate.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="status" className="text-slate-300">
                    Status
                  </Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(value: StaffStatus) => form.setValue("status", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status} className="focus:bg-slate-600 capitalize">
                          {status.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.status.message}</p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Permissions - Simplified for now */}
            {/* 
            <fieldset className="border border-slate-600 p-4 rounded-md">
              <legend className="text-sm font-medium text-slate-300 px-1">Permissions</legend>
              <p className="text-xs text-slate-400">Permission management coming soon.</p>
            </fieldset> 
            */}

            <div className="pb-6">
              {" "}
              {/* Extra padding for scroll area */}
              {/* This div is intentionally empty to add padding at the bottom of the scroll area */}
            </div>
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
            form="staffForm"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white"
            onClick={form.handleSubmit(handleFormSubmit)}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Add Staff Member"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
