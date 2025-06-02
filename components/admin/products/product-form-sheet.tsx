"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Product, ProductCategory, ProductStatus } from "@/lib/types/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, UploadCloud, Trash2 } from "lucide-react"
import Image from "next/image" // For displaying uploaded images
import { nanoid } from "nanoid"

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  sku: z.string().min(3, "SKU is required."),
  category: z.enum([
    "software_license",
    "saas_subscription",
    "consulting_service",
    "support_package",
    "custom_development",
  ]),
  pricing: z.object({
    costPrice: z.coerce.number().optional(),
    sellingPrice: z.coerce.number().min(0, "Selling price must be positive."),
    salePrice: z.coerce.number().optional(),
    taxRatePercent: z.coerce.number().min(0).max(100, "Tax rate must be between 0 and 100."),
  }),
  inventory: z.object({
    stockQuantity: z.coerce.number().min(0, "Stock quantity cannot be negative."),
    reorderLevel: z.coerce.number().min(0, "Reorder level cannot be negative.").optional(),
    manageStock: z.boolean(),
  }),
  images: z.array(z.object({ id: z.string(), url: z.string(), altText: z.string().optional() })).optional(),
  status: z.enum(["active", "inactive", "discontinued"]),
  visibility: z
    .object({
      onlineStore: z.boolean().optional(),
      internalUse: z.boolean().optional(),
    })
    .optional(),
  features: z.object({
    isFeatured: z.boolean().optional(),
    isNew: z.boolean().optional(),
  }).optional(),
  serviceDetails: z.object({
    serviceWorkHours: z.coerce.number().optional(),
    workHourByDay: z.string().optional(),
    workHoursPerDay: z.coerce.number().optional(),
  }).optional(),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductFormSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProductFormValues) => Promise<void>
  defaultValues?: Partial<Product>
  isEditing: boolean
}

const categories: ProductCategory[] = [
  "software_license",
  "saas_subscription",
  "consulting_service",
  "support_package",
  "custom_development",
]
const statuses: ProductStatus[] = ["active", "inactive", "discontinued"]

export default function ProductFormSheet({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isEditing,
}: ProductFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      category: "software_license",
      pricing: { sellingPrice: 0, taxRatePercent: 0 },
      inventory: { stockQuantity: 0, manageStock: true },
      images: [],
      status: "active",
      visibility: { onlineStore: true, internalUse: false },
      features: { isFeatured: false, isNew: false },
      serviceDetails: { serviceWorkHours: 0, workHourByDay: "", workHoursPerDay: 0 },
    },
  })

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control: form.control,
    name: "images",
  })

  useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        form.reset({
          ...defaultValues,
          pricing: defaultValues.pricing || { sellingPrice: 0, taxRatePercent: 0 },
          inventory: defaultValues.inventory || { stockQuantity: 0, manageStock: true },
          images: defaultValues.images || [],
          visibility: defaultValues.visibility || { onlineStore: true, internalUse: false },
          features: defaultValues.features || { isFeatured: false, isNew: false },
          serviceDetails: defaultValues.serviceDetails || { serviceWorkHours: 0, workHourByDay: "", workHoursPerDay: 0 },
        })
      } else {
        form.reset({
          name: "",
          description: "",
          sku: "",
          category: "software_license",
          pricing: { sellingPrice: 0, taxRatePercent: 0 },
          inventory: { stockQuantity: 0, manageStock: true },
          images: [],
          status: "active",
          visibility: { onlineStore: true, internalUse: false },
          features: { isFeatured: false, isNew: false },
          serviceDetails: { serviceWorkHours: 0, workHourByDay: "", workHoursPerDay: 0 },
        })
      }
    }
  }, [defaultValues, form, isOpen])

  const handleFormSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    await onSubmit(data)
    setIsSubmitting(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          appendImage({ id: nanoid(), url: reader.result as string, altText: file.name })
        }
        reader.readAsDataURL(file)
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl bg-slate-800 border-slate-700 text-slate-100 font-poppins flex flex-col">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-blue-400">{isEditing ? "Edit Product" : "Add New Product"}</SheetTitle>
          <SheetDescription className="text-slate-400">
            {isEditing ? "Update product details." : "Fill in details for the new product/service."}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow px-6 py-4">
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Info */}
            <fieldset className="border border-slate-600 p-4 rounded-md space-y-4">
              <legend className="text-sm font-medium text-slate-300 px-1">Basic Information</legend>
              <div>
                <Label htmlFor="name" className="text-slate-300">
                  Product/Service Name
                </Label>
                <Input id="name" {...form.register("name")} className="bg-slate-700 border-slate-600 text-slate-50" />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="description" className="text-slate-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  className="bg-slate-700 border-slate-600 text-slate-50 min-h-[100px]"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-400 mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku" className="text-slate-300">
                    SKU
                  </Label>
                  <Input id="sku" {...form.register("sku")} className="bg-slate-700 border-slate-600 text-slate-50" />
                  {form.formState.errors.sku && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.sku.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="category" className="text-slate-300">
                    Category
                  </Label>
                  <Select
                    value={form.watch("category")}
                    onValueChange={(value: ProductCategory) => form.setValue("category", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="focus:bg-slate-600 capitalize">
                          {cat.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.category.message}</p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Pricing */}
            <fieldset className="border border-slate-600 p-4 rounded-md space-y-4">
              <legend className="text-sm font-medium text-slate-300 px-1">Pricing</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="pricing.costPrice" className="text-slate-300">
                    Cost Price ($) (Optional)
                  </Label>
                  <Input
                    id="pricing.costPrice"
                    type="number"
                    step="0.01"
                    {...form.register("pricing.costPrice")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                </div>
                <div>
                  <Label htmlFor="pricing.sellingPrice" className="text-slate-300">
                    Selling Price ($)
                  </Label>
                  <Input
                    id="pricing.sellingPrice"
                    type="number"
                    step="0.01"
                    {...form.register("pricing.sellingPrice")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                  {form.formState.errors.pricing?.sellingPrice && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.pricing.sellingPrice.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="pricing.salePrice" className="text-slate-300">
                    Sale Price ($) (Optional)
                  </Label>
                  <Input
                    id="pricing.salePrice"
                    type="number"
                    step="0.01"
                    {...form.register("pricing.salePrice")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                </div>
                <div>
                  <Label htmlFor="pricing.taxRatePercent" className="text-slate-300">
                    Tax Rate (%)
                  </Label>
                  <Input
                    id="pricing.taxRatePercent"
                    type="number"
                    step="0.1"
                    {...form.register("pricing.taxRatePercent")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                  {form.formState.errors.pricing?.taxRatePercent && (
                    <p className="text-sm text-red-400 mt-1">{form.formState.errors.pricing.taxRatePercent.message}</p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Inventory */}
            <fieldset className="border border-slate-600 p-4 rounded-md space-y-4">
              <legend className="text-sm font-medium text-slate-300 px-1">Inventory / Availability</legend>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inventory.manageStock"
                  checked={form.watch("inventory.manageStock")}
                  onCheckedChange={(checked) => form.setValue("inventory.manageStock", !!checked)}
                  className="border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label htmlFor="inventory.manageStock" className="text-slate-300">
                  Track Stock/Availability (e.g., for licenses, service slots)
                </Label>
              </div>
              {form.watch("inventory.manageStock") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inventory.stockQuantity" className="text-slate-300">
                      Available Quantity
                    </Label>
                    <Input
                      id="inventory.stockQuantity"
                      type="number"
                      {...form.register("inventory.stockQuantity")}
                      className="bg-slate-700 border-slate-600 text-slate-50"
                    />
                    {form.formState.errors.inventory?.stockQuantity && (
                      <p className="text-sm text-red-400 mt-1">
                        {form.formState.errors.inventory.stockQuantity.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="inventory.reorderLevel" className="text-slate-300">
                      Low Stock Alert Level (Optional)
                    </Label>
                    <Input
                      id="inventory.reorderLevel"
                      type="number"
                      {...form.register("inventory.reorderLevel")}
                      className="bg-slate-700 border-slate-600 text-slate-50"
                    />
                  </div>
                </div>
              )}
            </fieldset>

            {/* Service Details */}
            <fieldset className="border border-slate-600 p-4 rounded-md space-y-4">
              <legend className="text-sm font-medium text-slate-300 px-1">Service Details (Optional)</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="serviceDetails.serviceWorkHours" className="text-slate-300">
                    Service Work Hours
                  </Label>
                  <Input
                    id="serviceDetails.serviceWorkHours"
                    type="number"
                    {...form.register("serviceDetails.serviceWorkHours")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceDetails.workHourByDay" className="text-slate-300">
                    Work Hours By Day
                  </Label>
                  <Input
                    id="serviceDetails.workHourByDay"
                    {...form.register("serviceDetails.workHourByDay")}
                    placeholder="e.g., Monday-Friday"
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceDetails.workHoursPerDay" className="text-slate-300">
                    Work Hours Per Day
                  </Label>
                  <Input
                    id="serviceDetails.workHoursPerDay"
                    type="number"
                    step="0.5"
                    {...form.register("serviceDetails.workHoursPerDay")}
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                </div>
              </div>
            </fieldset>

            {/* Features */}
            <fieldset className="border border-slate-600 p-4 rounded-md space-y-4">
              <legend className="text-sm font-medium text-slate-300 px-1">Product Features</legend>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="features.isFeatured"
                    checked={form.watch("features.isFeatured")}
                    onCheckedChange={(checked) => form.setValue("features.isFeatured", !!checked)}
                    className="border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label htmlFor="features.isFeatured" className="text-slate-300">
                    Featured Product
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="features.isNew"
                    checked={form.watch("features.isNew")}
                    onCheckedChange={(checked) => form.setValue("features.isNew", !!checked)}
                    className="border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label htmlFor="features.isNew" className="text-slate-300">
                    New Product
                  </Label>
                </div>
              </div>
            </fieldset>

            {/* Images */}
            <fieldset className="border border-slate-600 p-4 rounded-md space-y-4">
              <legend className="text-sm font-medium text-slate-300 px-1">Product Images</legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {imageFields.map((field, index) => (
                  <div key={field.id} className="relative group">
                    <Image
                      src={field.url || "/placeholder.svg"}
                      alt={field.altText || `Product image ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-24 object-cover rounded-md bg-slate-700"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Label
                  htmlFor="imageUpload"
                  className="w-full h-24 border-2 border-dashed border-slate-600 rounded-md flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-400 cursor-pointer transition-colors"
                >
                  <UploadCloud className="h-8 w-8 mb-1" />
                  <span className="text-xs">Add Image(s)</span>
                </Label>
                <Input
                  id="imageUpload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </fieldset>

            {/* Status & Visibility */}
            <fieldset className="border border-slate-600 p-4 rounded-md space-y-4">
              <legend className="text-sm font-medium text-slate-300 px-1">Status & Visibility</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status" className="text-slate-300">
                    Status
                  </Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(value: ProductStatus) => form.setValue("status", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s} className="focus:bg-slate-600 capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visibility.onlineStore"
                      checked={form.watch("visibility.onlineStore")}
                      onCheckedChange={(checked) => form.setValue("visibility.onlineStore", !!checked)}
                      className="border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label htmlFor="visibility.onlineStore" className="text-slate-300">
                      Visible in Online Store/Portal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visibility.internalUse"
                      checked={form.watch("visibility.internalUse")}
                      onCheckedChange={(checked) => form.setValue("visibility.internalUse", !!checked)}
                      className="border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label htmlFor="visibility.internalUse" className="text-slate-300">
                      For Internal Use Only
                    </Label>
                  </div>
                </div>
              </div>
            </fieldset>
            <div className="pb-6"></div> {/* Padding for scroll area */}
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
            form="productForm"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white"
            onClick={form.handleSubmit(handleFormSubmit)}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Add Product"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
