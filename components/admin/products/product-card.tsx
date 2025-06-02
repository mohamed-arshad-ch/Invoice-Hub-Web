"use client"

import type React from "react"

import Image from "next/image"
import type { Product, ProductCategory, ProductStatus, StockLevel } from "@/lib/types/product"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  onSelect: (product: Product) => void
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
  if (!product.inventory.manageStock) return "in_stock" // Or a different status for unmanaged stock
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

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const primaryImage = product.images?.[0]?.url || `/placeholder.svg?height=200&width=300&query=${product.category}`
  const stockLevel = getStockLevel(product)
  const StockIcon = stockLevelInfo[stockLevel].icon

  return (
    <Card
      className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg shadow-custom hover:border-blue-500/70 transition-all duration-200 cursor-pointer flex flex-col font-poppins overflow-hidden"
      onClick={() => onSelect(product)}
    >
      <div className="relative w-full h-40 bg-slate-700">
        <Image src={primaryImage || "/placeholder.svg"} alt={product.name} layout="fill" objectFit="cover" />
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-md font-semibold text-slate-100 truncate" title={product.name}>
          {product.name}
        </CardTitle>
        <Badge
          className={cn("text-xs mt-1 capitalize", categoryColors[product.category] || "bg-gray-500/20 text-gray-400")}
        >
          {product.category.replace(/_/g, " ")}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2 text-sm flex-grow">
        <div className="flex items-center text-slate-400">
          <Package className="h-4 w-4 mr-2 text-blue-400" />
          SKU: {product.sku}
        </div>
        <div className="flex items-center text-slate-400">
          <DollarSign className="h-4 w-4 mr-2 text-blue-400" />
          Price: ${product.pricing.sellingPrice.toFixed(2)}
        </div>
        <div className={cn("flex items-center", stockLevelInfo[stockLevel].color)}>
          <StockIcon className="h-4 w-4 mr-2" />
          {product.inventory.manageStock
            ? `${stockLevelInfo[stockLevel].text} (${product.inventory.stockQuantity})`
            : "Availability Varies"}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t border-slate-700/50 flex justify-between items-center">
        <Badge className={cn("text-xs capitalize", statusColors[product.status])}>
          {product.status.replace("_", " ")}
        </Badge>
        {/* Quick stock update could be a small +/- button or input here if needed */}
      </CardFooter>
    </Card>
  )
}
