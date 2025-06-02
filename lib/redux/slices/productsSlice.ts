import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Product } from "@/lib/types/product"
import type { RootState } from "../store" // Import RootState
import type { ProductFormValues } from "@/components/admin/products/product-form-sheet"

interface ProductsState {
  products: Product[]
  isLoading: boolean
  error: string | null
}

const initialState: ProductsState = {
  products: [],
  isLoading: false,
  error: null,
}

// Async thunks for API calls
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const response = await fetch('/api/products')
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  const data = await response.json()
  return data.products
})

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData: ProductFormValues) => {
    const apiData = {
      name: productData.name,
      description: productData.description,
      category: productData.category,
      price: productData.pricing.sellingPrice,
      tax_rate: productData.pricing.taxRatePercent,
      status: productData.status,
      sku: productData.sku,
      stock_quantity: productData.inventory.stockQuantity,
      is_featured: productData.features?.isFeatured || false,
      is_new: productData.features?.isNew || false,
      sale_price: productData.pricing.salePrice,
      service_work_hours: productData.serviceDetails?.serviceWorkHours || 0,
      work_hour_by_day: productData.serviceDetails?.workHourByDay,
      work_hours_per_day: productData.serviceDetails?.workHoursPerDay,
    }

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    })

    if (!response.ok) {
      throw new Error('Failed to create product')
    }

    const data = await response.json()
    return data.product
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }: { id: string | number, productData: ProductFormValues }) => {
    const apiData = {
      id: id,
      name: productData.name,
      description: productData.description,
      category: productData.category,
      price: productData.pricing.sellingPrice,
      tax_rate: productData.pricing.taxRatePercent,
      status: productData.status,
      sku: productData.sku,
      stock_quantity: productData.inventory.stockQuantity,
      is_featured: productData.features?.isFeatured || false,
      is_new: productData.features?.isNew || false,
      sale_price: productData.pricing.salePrice,
      service_work_hours: productData.serviceDetails?.serviceWorkHours || 0,
      work_hour_by_day: productData.serviceDetails?.workHourByDay,
      work_hours_per_day: productData.serviceDetails?.workHoursPerDay,
    }

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    })

    if (!response.ok) {
      throw new Error('Failed to update product')
    }

    const data = await response.json()
    return data.product
  }
)

export const getProductDetails = createAsyncThunk(
  'products/getProductDetails',
  async (productId: string | number) => {
    const response = await fetch('/api/products/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: productId }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch product details')
    }

    const data = await response.json()
    return data.product
  }
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: string | number) => {
    // Note: You might want to create a DELETE endpoint, but for now using the existing pattern
    const response = await fetch('/api/products', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: productId }),
    })

    if (!response.ok) {
      throw new Error('Failed to delete product')
    }

    return productId
  }
)

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    updateStock: (state, action: PayloadAction<{ productId: string; newStock: number }>) => {
      const product = state.products.find((p) => p.id === action.payload.productId)
      if (product) {
        product.inventory.stockQuantity = action.payload.newStock
        product.lastUpdated = new Date().toISOString()
      }
    },
    setProductsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload.map((product: any) => ({
          id: product.id.toString(),
          name: product.name,
          description: product.description,
          sku: product.sku || '',
          category: product.category,
          pricing: {
            sellingPrice: parseFloat(product.price),
            taxRatePercent: parseFloat(product.tax_rate || '0'),
            salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
          },
          inventory: {
            stockQuantity: product.stock_quantity || 0,
            manageStock: true,
          },
          images: [],
          status: product.status,
          features: {
            isFeatured: product.is_featured,
            isNew: product.is_new,
          },
          serviceDetails: {
            serviceWorkHours: product.service_work_hours,
            workHourByDay: product.work_hour_by_day,
            workHoursPerDay: product.work_hours_per_day ? parseFloat(product.work_hours_per_day) : undefined,
          },
          dateAdded: product.created_at,
          lastUpdated: product.updated_at,
        }))
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch products'
      })
      // Add product
      .addCase(addProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const product = action.payload
        const newProduct: Product = {
          id: product.id.toString(),
          name: product.name,
          description: product.description,
          sku: product.sku || '',
          category: product.category,
          pricing: {
            sellingPrice: parseFloat(product.price),
            taxRatePercent: parseFloat(product.tax_rate || '0'),
            salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
          },
          inventory: {
            stockQuantity: product.stock_quantity || 0,
            manageStock: true,
          },
          images: [],
          status: product.status,
          features: {
            isFeatured: product.is_featured,
            isNew: product.is_new,
          },
          serviceDetails: {
            serviceWorkHours: product.service_work_hours,
            workHourByDay: product.work_hour_by_day,
            workHoursPerDay: product.work_hours_per_day ? parseFloat(product.work_hours_per_day) : undefined,
          },
          dateAdded: product.created_at,
          lastUpdated: product.updated_at,
        }
        state.products.unshift(newProduct)
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to add product'
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const product = action.payload
        const index = state.products.findIndex((p) => p.id === product.id.toString())
        if (index !== -1) {
          state.products[index] = {
            id: product.id.toString(),
            name: product.name,
            description: product.description,
            sku: product.sku || '',
            category: product.category,
            pricing: {
              sellingPrice: parseFloat(product.price),
              taxRatePercent: parseFloat(product.tax_rate || '0'),
              salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
            },
            inventory: {
              stockQuantity: product.stock_quantity || 0,
              manageStock: true,
            },
            images: [],
            status: product.status,
            features: {
              isFeatured: product.is_featured,
              isNew: product.is_new,
            },
            serviceDetails: {
              serviceWorkHours: product.service_work_hours,
              workHourByDay: product.work_hour_by_day,
              workHoursPerDay: product.work_hours_per_day ? parseFloat(product.work_hours_per_day) : undefined,
            },
            dateAdded: product.created_at,
            lastUpdated: product.updated_at,
          }
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to update product'
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = state.products.filter((product) => product.id !== action.payload.toString())
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to delete product'
      })
  },
})

export const { updateStock, setProductsLoading, clearError } = productsSlice.actions

// Selectors
export const selectAllProducts = (state: RootState): Product[] => state.products.products
export const selectProductById = (state: RootState, productId: string): Product | undefined =>
  state.products.products.find((product) => product.id === productId)
export const selectProductsLoading = (state: RootState): boolean => state.products.isLoading
export const selectProductsError = (state: RootState): string | null => state.products.error

export default productsSlice.reducer
