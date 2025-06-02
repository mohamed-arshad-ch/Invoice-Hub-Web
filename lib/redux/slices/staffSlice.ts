import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Staff } from "@/lib/types/staff"
import type { RootState } from "@/lib/redux/store"

interface StaffState {
  staffMembers: Staff[]
  isLoading: boolean
  error: string | null
}

const initialState: StaffState = {
  staffMembers: [],
  isLoading: false,
  error: null,
}

// Async thunks for API calls
export const fetchStaffMembers = createAsyncThunk(
  'staff/fetchStaffMembers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/staff')
      const result = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to fetch staff members')
      }
      
      return result.data
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

export const addStaffMember = createAsyncThunk(
  'staff/addStaffMember',
  async (staffData: Omit<Staff, 'id'>, { rejectWithValue }) => {
    try {
      // Map form data to API format
      const apiData = {
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        address: staffData.address,
        position: staffData.position,
        department: staffData.department,
        role: staffData.role,
        salary: staffData.salary,
        payment_rate: staffData.payment_rate,
        payment_frequency: staffData.payment_frequency,
        payment_type: staffData.payment_type,
        payment_duration: staffData.payment_duration,
        payment_time: staffData.payment_time,
        joinDate: staffData.joinDate,
        status: staffData.status,
        avatar: staffData.avatar,
        permissions: staffData.permissions,
      }

      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to add staff member')
      }
      
      return result.data
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

export const updateStaffMember = createAsyncThunk(
  'staff/updateStaffMember',
  async (staffData: Staff, { rejectWithValue }) => {
    try {
      // Map form data to API format
      const apiData = {
        id: staffData.id,
        action: 'update',
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        address: staffData.address,
        position: staffData.position,
        department: staffData.department,
        role: staffData.role,
        salary: staffData.salary,
        payment_rate: staffData.payment_rate,
        payment_frequency: staffData.payment_frequency,
        payment_type: staffData.payment_type,
        payment_duration: staffData.payment_duration,
        payment_time: staffData.payment_time,
        joinDate: staffData.joinDate,
        status: staffData.status,
        avatar: staffData.avatar,
        permissions: staffData.permissions,
      }

      const response = await fetch('/api/staff/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to update staff member')
      }
      
      return result.data
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

export const deleteStaffMember = createAsyncThunk(
  'staff/deleteStaffMember',
  async (staffId: string, { rejectWithValue }) => {
    try {
      // For now, we'll just remove from the frontend since you didn't request a delete API
      // In the future, you can add a delete API endpoint
      return staffId
    } catch (error) {
      return rejectWithValue('Failed to delete staff member')
    }
  }
)

export const viewStaffDetails = createAsyncThunk(
  'staff/viewStaffDetails',
  async (staffId: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/staff/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: staffId, action: 'view' }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to fetch staff details')
      }
      
      return result.data
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    setStaffLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    clearStaffError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch staff members
      .addCase(fetchStaffMembers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStaffMembers.fulfilled, (state, action) => {
        state.isLoading = false
        state.staffMembers = action.payload
      })
      .addCase(fetchStaffMembers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Add staff member
      .addCase(addStaffMember.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addStaffMember.fulfilled, (state, action) => {
        state.isLoading = false
        state.staffMembers.unshift(action.payload)
      })
      .addCase(addStaffMember.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Update staff member
      .addCase(updateStaffMember.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateStaffMember.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.staffMembers.findIndex((staff) => staff.id === action.payload.id)
        if (index !== -1) {
          state.staffMembers[index] = action.payload
        }
      })
      .addCase(updateStaffMember.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Delete staff member
      .addCase(deleteStaffMember.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteStaffMember.fulfilled, (state, action) => {
        state.isLoading = false
        state.staffMembers = state.staffMembers.filter((staff) => staff.id !== action.payload)
      })
      .addCase(deleteStaffMember.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setStaffLoading, clearStaffError } = staffSlice.actions

// Export the selectors
export const selectAllStaff = (state: RootState): Staff[] => state.staff.staffMembers
export const selectStaffById = (state: RootState, staffId: string): Staff | undefined =>
  state.staff.staffMembers.find((staff) => staff.id === staffId)
export const selectStaffLoading = (state: RootState): boolean => state.staff.isLoading
export const selectStaffError = (state: RootState): string | null => state.staff.error

export default staffSlice.reducer
