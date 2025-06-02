import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "redux-persist/lib/storage" // defaults to localStorage for web
import authReducer from "./slices/authSlice"
import clientsReducer from "./slices/clientsSlice"
import staffReducer from "./slices/staffSlice"
import productsReducer from "./slices/productsSlice"
import invoicesReducer from "./slices/invoicesSlice"
import quotationsReducer from "./slices/quotationsSlice"
import paymentsReducer from "./slices/paymentsSlice"

const persistConfig = {
  key: "invoicehub-root", // Changed key to be more specific
  storage,
  whitelist: ["auth"], // Only persist auth slice
}

const rootReducer = combineReducers({
  auth: authReducer,
  clients: clientsReducer,
  staff: staffReducer,
  products: productsReducer,
  invoices: invoicesReducer,
  quotations: quotationsReducer,
  payments: paymentsReducer, // Add payments reducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          "invoices/setInvoiceFilters",
          "quotations/setQuotationFilters",
          "payments/setPaymentFilters",
        ],
        ignoredPaths: [
          "invoices.currentFilters.dateRange",
          "quotations.currentFilters.dateRange",
          "payments.currentFilters.dateRange",
          // Add other paths that might contain non-serializable data
        ],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
