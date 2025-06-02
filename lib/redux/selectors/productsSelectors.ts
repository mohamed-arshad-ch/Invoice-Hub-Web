// This is a placeholder for actual product selectors.
import type { RootState } from "../store"

export const productsSelector = (state: RootState) => state.products.products
export const selectProductById = (productId: string) => (state: RootState) =>
  state.products.products.find((product) => product.id === productId)
