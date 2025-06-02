import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Client, ClientFormData } from "@/lib/types/client"
import type { RootState } from "../store"

interface ClientsState {
  clients: Client[]
  isLoading: boolean
  error: string | null
}

const initialState: ClientsState = {
  clients: [],
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/clients')
      const result = await response.json()
      
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      
      return result.data
    } catch (error) {
      return rejectWithValue('Failed to fetch clients')
    }
  }
)

export const addClient = createAsyncThunk(
  'clients/addClient',
  async (clientData: ClientFormData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })
      const result = await response.json()
      
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      
      return result.data
    } catch (error) {
      return rejectWithValue('Failed to add client')
    }
  }
)

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, ...clientData }: ClientFormData & { id: number }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...clientData }),
      })
      const result = await response.json()
      
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      
      return result.data
    } catch (error) {
      return rejectWithValue('Failed to update client')
    }
  }
)

export const getClientDetails = createAsyncThunk(
  'clients/getClientDetails',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/clients/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      const result = await response.json()
      
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      
      return result.data
    } catch (error) {
      return rejectWithValue('Failed to get client details')
    }
  }
)

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setClientsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch clients
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false
        state.clients = action.payload
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Add client
      .addCase(addClient.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addClient.fulfilled, (state, action) => {
        state.isLoading = false
        state.clients.unshift(action.payload)
      })
      .addCase(addClient.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update client
      .addCase(updateClient.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.clients.findIndex((client) => client.id === action.payload.id)
        if (index !== -1) {
          state.clients[index] = action.payload
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setClientsLoading, clearError } = clientsSlice.actions

export const selectAllClients = (state: RootState) => state.clients.clients
export const selectClientById = (state: RootState, clientId: number) =>
  state.clients.clients.find((client) => client.id === clientId)
export const selectClientsLoading = (state: RootState) => state.clients.isLoading
export const selectClientsError = (state: RootState) => state.clients.error

export default clientsSlice.reducer
