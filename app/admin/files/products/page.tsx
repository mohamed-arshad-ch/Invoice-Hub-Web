"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { fetchProducts, addProduct, updateProduct, deleteProduct, updateStock } from "@/lib/redux/slices/productsSlice"
import type { Product, ProductCategory, ProductStatus } from "@/lib/types/product"
import type { ProductFormValues } from "@/components/admin/products/product-form-sheet"

import ProductCard from "@/components/admin/products/product-card"
import ProductFormSheet from "@/components/admin/products/product-form-sheet"
import ProductDetailSheet from "@/components/admin/products/product-detail-sheet"
import DeleteConfirmDialog from "@/components/admin/clients/delete-confirm-dialog" // Reusable

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle, Search, LayoutGrid, TableIcon } from "lucide-react" // Added TableIcon
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const ITEMS_PER_PAGE = 8 // Number of cards per page

const categoriesForFilter: ProductCategory[] = [
  "software_license",
  "saas_subscription",
  "consulting_service",
  "support_package",
  "custom_development",
]
const statusesForFilter: ProductStatus[] = ["active", "inactive", "discontinued"]

export default function ProductManagementPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { products, isLoading: productsLoading } = useSelector((state: RootState) => state.products)

  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | ProductCategory>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all")
  const [priceRangeFilter, setPriceRangeFilter] = useState<{ min?: number; max?: number }>({})

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid") // Default to grid
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const handleAddProduct = () => {
    setIsEditing(false)
    setSelectedProduct(null)
    setIsFormSheetOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setIsEditing(true)
    // Transform product data to match form structure
    const formData = {
      name: product.name,
      description: product.description,
      sku: product.sku,
      category: product.category,
      pricing: {
        costPrice: product.pricing.costPrice,
        sellingPrice: product.pricing.sellingPrice,
        salePrice: product.pricing.salePrice,
        taxRatePercent: product.pricing.taxRatePercent,
      },
      inventory: {
        stockQuantity: product.inventory.stockQuantity,
        reorderLevel: product.inventory.reorderLevel,
        manageStock: product.inventory.manageStock,
      },
      images: product.images || [],
      status: product.status,
      visibility: product.visibility,
      features: product.features,
      serviceDetails: product.serviceDetails,
    }
    setSelectedProduct({ ...product, ...formData } as Product)
    setIsFormSheetOpen(true)
  }

  const handleViewProductDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsDetailSheetOpen(true)
  }

  const handleDeleteProduct = (productId: string) => {
    setDeletingProductId(productId)
    const productToDelete = products.find((p) => p.id === productId)
    setSelectedProduct(productToDelete || null)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingProductId) {
      await dispatch(deleteProduct(deletingProductId))
    }
    setIsDeleteDialogOpen(false)
    setDeletingProductId(null)
    setSelectedProduct(null)
    setIsDetailSheetOpen(false)
  }

  const handleFormSubmit = async (data: ProductFormValues) => {
    if (isEditing && selectedProduct) {
      await dispatch(updateProduct({ id: selectedProduct.id, productData: data }))
    } else {
      await dispatch(addProduct(data))
    }
    setIsFormSheetOpen(false)
    setSelectedProduct(null)
  }

  const handleUpdateStock = async (productId: string, newStock: number) => {
    await dispatch(updateStock({ productId, newStock }))
    // Optionally refetch or update selectedProduct if detail sheet is open
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct((prev) =>
        prev ? { ...prev, inventory: { ...prev.inventory, stockQuantity: newStock } } : null,
      )
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const skuMatch = product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const categoryMatch = categoryFilter === "all" || product.category === categoryFilter
      const statusMatch = statusFilter === "all" || product.status === statusFilter
      const priceMinMatch = priceRangeFilter.min ? product.pricing.sellingPrice >= priceRangeFilter.min : true
      const priceMaxMatch = priceRangeFilter.max ? product.pricing.sellingPrice <= priceRangeFilter.max : true

      return (nameMatch || skuMatch) && categoryMatch && statusMatch && priceMinMatch && priceMaxMatch
    })
  }, [products, searchTerm, categoryFilter, statusFilter, priceRangeFilter])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  return (
    <div className="space-y-6 animate-fade-in font-poppins">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Product Management</h1>
          <p className="text-slate-400">Manage your software products and services.</p>
        </div>
        <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-500 text-white">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Product/Service
        </Button>
      </header>

      {/* Search and Filters */}
      <div className="p-4 bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="lg:col-span-2">
            <Label htmlFor="search-products" className="text-xs text-slate-400">
              Search Name/SKU
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="search-products"
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 w-full"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="filter-category" className="text-xs text-slate-400">
              Category
            </Label>
            <Select
              value={categoryFilter}
              onValueChange={(value: "all" | ProductCategory) => {
                setCategoryFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger
                id="filter-category"
                className="bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500 w-full"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                <SelectItem value="all" className="focus:bg-slate-600">
                  All Categories
                </SelectItem>
                {categoriesForFilter.map((cat) => (
                  <SelectItem key={cat} value={cat} className="focus:bg-slate-600 capitalize">
                    {cat.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-status" className="text-xs text-slate-400">
              Status
            </Label>
            <Select
              value={statusFilter}
              onValueChange={(value: "all" | ProductStatus) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger
                id="filter-status"
                className="bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500 w-full"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                <SelectItem value="all" className="focus:bg-slate-600">
                  All Statuses
                </SelectItem>
                {statusesForFilter.map((stat) => (
                  <SelectItem key={stat} value={stat} className="focus:bg-slate-600 capitalize">
                    {stat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
          <div>
            <Label htmlFor="price-min" className="text-xs text-slate-400">
              Min Price ($)
            </Label>
            <Input
              id="price-min"
              type="number"
              placeholder="e.g., 0"
              value={priceRangeFilter.min ?? ""}
              onChange={(e) =>
                setPriceRangeFilter((prev) => ({ ...prev, min: e.target.value ? Number(e.target.value) : undefined }))
              }
              className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 w-full"
            />
          </div>
          <div>
            <Label htmlFor="price-max" className="text-xs text-slate-400">
              Max Price ($)
            </Label>
            <Input
              id="price-max"
              type="number"
              placeholder="e.g., 1000"
              value={priceRangeFilter.max ?? ""}
              onChange={(e) =>
                setPriceRangeFilter((prev) => ({ ...prev, max: e.target.value ? Number(e.target.value) : undefined }))
              }
              className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 w-full"
            />
          </div>
          <div className="flex items-end">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value: "grid" | "table") => {
                if (value) setViewMode(value)
              }}
              aria-label="View mode"
              className="ml-auto"
            >
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white border-slate-600 hover:bg-slate-700"
              >
                <LayoutGrid className="h-5 w-5" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="table"
                aria-label="Table view"
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white border-slate-600 hover:bg-slate-700"
                disabled // Table view not implemented yet
              >
                <TableIcon className="h-5 w-5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(ITEMS_PER_PAGE)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="bg-slate-800/60">
                <Skeleton className="h-40 w-full bg-slate-700 rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-slate-700" />
                  <Skeleton className="h-4 w-1/2 bg-slate-700" />
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <Skeleton className="h-4 w-2/3 bg-slate-700" />
                </div>
                <div className="p-4 border-t border-slate-700/50 flex justify-between">
                  <Skeleton className="h-6 w-16 bg-slate-700" />
                  <Skeleton className="h-6 w-20 bg-slate-700" />
                </div>
              </Card>
            ))}
        </div>
      ) : viewMode === "grid" && paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={handleViewProductDetails} />
          ))}
        </div>
      ) : (
        // Placeholder for Table View or No Results
        <div className="text-center py-12 text-slate-400">
          {viewMode === "table" ? (
            <p className="text-lg">Table view coming soon!</p>
          ) : (
            <p className="text-lg">No products found matching your criteria.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4 text-slate-300">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="border-slate-600 hover:bg-slate-700"
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="border-slate-600 hover:bg-slate-700"
          >
            Next
          </Button>
        </div>
      )}

      <ProductFormSheet
        isOpen={isFormSheetOpen}
        onClose={() => {
          setIsFormSheetOpen(false)
          setSelectedProduct(null)
        }}
        onSubmit={handleFormSubmit}
        defaultValues={selectedProduct || undefined}
        isEditing={isEditing}
      />
      <ProductDetailSheet
        isOpen={isDetailSheetOpen}
        onClose={() => {
          setIsDetailSheetOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onUpdateStock={handleUpdateStock}
      />
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedProduct(null)
        }}
        onConfirm={confirmDelete}
        itemName={selectedProduct?.name || "this product/service"}
      />
    </div>
  )
}
