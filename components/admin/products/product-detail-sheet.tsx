"use client"

import type React from "react"
import { useState, useEffect } from "react" // Added import
import Image from "next/image"
import type { Product, ProductCategory, ProductStatus, StockLevel } from "@/lib/types/product"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Edit2,
  Trash2,
  DollarSign,
  Layers,
  Info,
  Tag,
  CalendarDays,
  Eye,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ImageIcon,
  Star,
  Clock,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ProductDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onUpdateStock: (productId: string, newStock: number) => void
}

const categoryColors: Record<ProductCategory, string> = {
  software_license: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  saas_subscription: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  consulting_service: "bg-green-500/20 text-green-400 border-green-500/30",
  support_package: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  custom_development: "bg-pink-500/20 text-pink-400 border-pink-500/30",
}

const statusColors: Record<ProductStatus, string> = {
  active: "bg-green-500/20 text-green-400",
  inactive: "bg-slate-600/50 text-slate-400",
  discontinued: "bg-red-500/20 text-red-400",
}

const getStockLevel = (product: Product): StockLevel => {
  if (!product.inventory.manageStock) return "in_stock"
  if (product.inventory.stockQuantity <= 0) return "out_of_stock"
  if (product.inventory.reorderLevel && product.inventory.stockQuantity <= product.inventory.reorderLevel) {
    return "low_stock"
  }
  return "in_stock"
}

const stockLevelInfo: Record<StockLevel, { text: string; color: string; icon: React.ElementType }> = {
  in_stock: { text: "In Stock", color: "text-green-400", icon: CheckCircle },
  low_stock: { text: "Low Stock", color: "text-yellow-400", icon: AlertTriangle },
  out_of_stock: { text: "Out of Stock", color: "text-red-400", icon: XCircle },
}

const DetailItem: React.FC<{
  icon: React.ElementType
  label: string
  value?: string | number | null
  children?: React.ReactNode
  className?: string
}> = ({ icon: Icon, label, value, children, className }) => (
  <div className={cn("flex items-start py-3", className)}>
    <Icon className="h-5 w-5 mr-3 mt-1 text-blue-400 flex-shrink-0" />
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      {children || <p className="text-sm text-slate-200">{value || "N/A"}</p>}
    </div>
  </div>
)

export default function ProductDetailSheet({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete,
  onUpdateStock,
}: ProductDetailSheetProps) {
  const [quickStock, setQuickStock] = useState<number | string>("")

  useEffect(() => {
    if (product) {
      setQuickStock(product.inventory.stockQuantity)
    }
  }, [product])

  if (!product) return null

  const primaryImage = product.images?.[0]?.url || `/placeholder.svg?height=200&width=300&query=${product.category}`
  const stockLevel = getStockLevel(product)
  const StockIcon = stockLevelInfo[stockLevel].icon

  const handleQuickStockUpdate = () => {
    const newStock = Number(quickStock)
    if (!isNaN(newStock) && newStock >= 0) {
      onUpdateStock(product.id, newStock)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-slate-800 border-slate-700 text-slate-100 font-poppins flex flex-col">
        <SheetHeader className="px-6 pt-6 text-left relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 bg-slate-700">
            <Image src={primaryImage || "/placeholder.svg"} alt={product.name} layout="fill" objectFit="cover" />
          </div>
          <SheetTitle className="text-xl text-slate-50">{product.name}</SheetTitle>
          <Badge
            className={cn(
              "text-xs mt-1 capitalize w-fit",
              categoryColors[product.category] || "bg-gray-500/20 text-gray-400",
            )}
          >
            {product.category.replace(/_/g, " ")}
          </Badge>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-5 w-5 text-slate-400 hover:text-slate-100" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        <ScrollArea className="flex-grow px-6 py-4">
          <div className="space-y-1 divide-y divide-slate-700/50">
            <DetailItem icon={Info} label="Description">
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{product.description}</p>
            </DetailItem>
            
            <DetailItem icon={Tag} label="SKU" value={product.sku} />

            <DetailItem icon={Tag} label="Category">
              <Badge
                className={cn(
                  "text-xs capitalize w-fit",
                  categoryColors[product.category] || "bg-gray-500/20 text-gray-400",
                )}
              >
                {product.category.replace(/_/g, " ")}
              </Badge>
            </DetailItem>

            <DetailItem icon={DollarSign} label="Pricing">
              <div className="text-sm text-slate-200 space-y-1">
                <p>Selling Price: <span className="font-medium text-green-400">${product.pricing.sellingPrice.toFixed(2)}</span></p>
                {product.pricing.salePrice !== undefined && (
                  <p>Sale Price: <span className="font-medium text-orange-400">${product.pricing.salePrice.toFixed(2)}</span></p>
                )}
                {product.pricing.costPrice !== undefined && (
                  <p>Cost Price: <span className="font-medium text-blue-400">${product.pricing.costPrice.toFixed(2)}</span></p>
                )}
                <p className="text-xs text-slate-400">Tax Rate: {product.pricing.taxRatePercent}%</p>
                {product.pricing.costPrice && product.pricing.sellingPrice && (
                  <p className="text-xs text-slate-400">
                    Profit Margin: <span className="text-green-400">
                      ${(product.pricing.sellingPrice - product.pricing.costPrice).toFixed(2)}
                      ({(((product.pricing.sellingPrice - product.pricing.costPrice) / product.pricing.sellingPrice) * 100).toFixed(1)}%)
                    </span>
                  </p>
                )}
              </div>
            </DetailItem>

            <DetailItem icon={Layers} label="Inventory / Availability">
              <div className="text-sm text-slate-200 space-y-1">
                <div className={cn("flex items-center", stockLevelInfo[stockLevel].color)}>
                  <StockIcon className="h-4 w-4 mr-1.5" />
                  {product.inventory.manageStock
                    ? `${stockLevelInfo[stockLevel].text} (${product.inventory.stockQuantity} units)`
                    : "Availability Varies (Unmanaged)"}
                </div>
                <p className="text-xs text-slate-400">
                  Stock Management: {product.inventory.manageStock ? "Enabled" : "Disabled"}
                </p>
                {product.inventory.manageStock && product.inventory.reorderLevel !== undefined && (
                  <p className="text-xs text-slate-400">
                    Reorder Level: <span className="text-yellow-400">{product.inventory.reorderLevel} units</span>
                  </p>
                )}
                {!product.inventory.reorderLevel && product.inventory.manageStock && (
                  <p className="text-xs text-slate-500">No reorder level set</p>
                )}
              </div>
            </DetailItem>

            {product.inventory.manageStock && (
              <div className="py-3">
                <Label htmlFor="quickStock" className="text-xs text-slate-400 block mb-1">
                  Quick Stock Update
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="quickStock"
                    type="number"
                    value={quickStock}
                    onChange={(e) => setQuickStock(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-50 h-9 w-24"
                  />
                  <Button
                    size="sm"
                    onClick={handleQuickStockUpdate}
                    className="bg-blue-600 hover:bg-blue-500 text-white h-9"
                  >
                    Update
                  </Button>
                </div>
              </div>
            )}

            <DetailItem icon={product.status === "active" ? CheckCircle : XCircle} label="Status">
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs capitalize", statusColors[product.status])}>
                  {product.status.replace("_", " ")}
                </Badge>
                <span className="text-xs text-slate-400">
                  ({product.status === "active" ? "Available for sale" : 
                    product.status === "inactive" ? "Temporarily unavailable" : 
                    "No longer available"})
                </span>
              </div>
            </DetailItem>

            <DetailItem icon={Eye} label="Visibility">
              <div className="text-sm text-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Online Store/Portal:</span>
                  {product.visibility?.onlineStore ? (
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Visible</Badge>
                  ) : (
                    <Badge className="bg-slate-600/50 text-slate-400 text-xs">Hidden</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Internal Use Only:</span>
                  {product.visibility?.internalUse ? (
                    <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Yes</Badge>
                  ) : (
                    <Badge className="bg-slate-600/50 text-slate-400 text-xs">No</Badge>
                  )}
                </div>
              </div>
            </DetailItem>

            {/* Product Features */}
            <DetailItem icon={Star} label="Product Features">
              <div className="text-sm text-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Featured Product:</span>
                  {product.features?.isFeatured ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Featured</Badge>
                    </div>
                  ) : (
                    <Badge className="bg-slate-600/50 text-slate-400 text-xs">Not Featured</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>New Product:</span>
                  {product.features?.isNew ? (
                    <Badge className="bg-green-500/20 text-green-400 text-xs">NEW</Badge>
                  ) : (
                    <Badge className="bg-slate-600/50 text-slate-400 text-xs">Regular</Badge>
                  )}
                </div>
              </div>
            </DetailItem>

            {/* Service Details */}
            {(product.serviceDetails?.serviceWorkHours || product.serviceDetails?.workHourByDay || product.serviceDetails?.workHoursPerDay) && (
              <DetailItem icon={Clock} label="Service Details">
                <div className="text-sm text-slate-200 space-y-1">
                  {product.serviceDetails?.serviceWorkHours !== undefined && (
                    <p>Total Service Hours: <span className="font-medium">{product.serviceDetails.serviceWorkHours}</span></p>
                  )}
                  {product.serviceDetails?.workHourByDay && (
                    <p>Work Schedule: <span className="font-medium">{product.serviceDetails.workHourByDay}</span></p>
                  )}
                  {product.serviceDetails?.workHoursPerDay !== undefined && (
                    <p>Hours Per Day: <span className="font-medium">{product.serviceDetails.workHoursPerDay}</span></p>
                  )}
                  {product.serviceDetails?.serviceWorkHours && product.serviceDetails?.workHoursPerDay && (
                    <p className="text-xs text-slate-400">
                      Estimated Days: {(product.serviceDetails.serviceWorkHours / product.serviceDetails.workHoursPerDay).toFixed(1)} days
                    </p>
                  )}
                </div>
              </DetailItem>
            )}

            <DetailItem
              icon={CalendarDays}
              label="Date Added"
              value={format(new Date(product.dateAdded), "MMMM d, yyyy 'at' h:mm a")}
            />
            <DetailItem
              icon={CalendarDays}
              label="Last Updated"
              value={format(new Date(product.lastUpdated), "MMMM d, yyyy 'at' h:mm a")}
            />

            {/* Product Images */}
            <DetailItem icon={ImageIcon} label="Product Images">
              {product.images && product.images.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Total Images: {product.images.length}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((img, index) => (
                      <div key={img.id} className="relative">
                        <Image
                          src={img.url || "/placeholder.svg"}
                          alt={img.altText || `Product image ${index + 1}`}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-md bg-slate-700 border border-slate-600"
                        />
                        {index === 0 && (
                          <Badge className="absolute -top-1 -right-1 bg-blue-500/20 text-blue-400 text-xs px-1">
                            Primary
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No images uploaded</p>
              )}
            </DetailItem>

            {/* Product ID - for technical reference */}
            <DetailItem icon={Info} label="Product ID">
              <code className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">#{product.id}</code>
            </DetailItem>
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-slate-700 flex flex-col sm:flex-row sm:justify-end sm:space-x-2 gap-2">
          <Button
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full sm:w-auto"
            onClick={() => {
              onClose()
              onDelete(product.id)
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto"
            onClick={() => {
              onClose()
              onEdit(product)
            }}
          >
            <Edit2 className="mr-2 h-4 w-4" /> Edit Product
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
