import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface AuthState {
  isAuthenticated: boolean
  user: {
    email: string | null
    role: string | null
  }
  rememberMe: boolean
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: {
    email: null,
    role: null,
  },
  rememberMe: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; role: string; rememberMe?: boolean }>) => {
      state.isAuthenticated = true
      state.user.email = action.payload.email
      state.user.role = action.payload.role
      state.rememberMe = action.payload.rememberMe || false
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user.email = null
      state.user.role = null
      state.rememberMe = false
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
