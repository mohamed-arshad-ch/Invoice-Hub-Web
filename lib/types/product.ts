export type ProductCategory =
  | "software_license"
  | "saas_subscription"
  | "consulting_service"
  | "support_package"
  | "custom_development"
export type ProductStatus = "active" | "inactive" | "discontinued"
export type StockLevel = "in_stock" | "low_stock" | "out_of_stock" // For services/software, this might represent license availability or capacity

export interface ProductImage {
  id: string
  url: string
  altText?: string
}

export interface Product {
  id: string
  name: string
  description: string
  sku: string // Stock Keeping Unit
  category: ProductCategory
  pricing: {
    costPrice?: number // Optional for services
    sellingPrice: number
    salePrice?: number // New field
    taxRatePercent: number // e.g., 0, 5, 10
  }
  inventory: {
    // For software/services, stock might mean available licenses, concurrent users, or service slots
    stockQuantity: number
    reorderLevel?: number // Alert when stockQuantity hits this for licenses/slots
    manageStock: boolean // True if stock is tracked (e.g., licenses), false for unlimited services
  }
  images: ProductImage[] // Primary image first
  status: ProductStatus
  visibility?: {
    onlineStore: boolean
    internalUse: boolean
  }
  // New fields from schema
  features?: {
    isFeatured?: boolean
    isNew?: boolean
  }
  serviceDetails?: {
    serviceWorkHours?: number
    workHourByDay?: string
    workHoursPerDay?: number
  }
  dateAdded: string // ISO string
  lastUpdated: string // ISO string
}
