export interface StaffAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export type StaffStatus = "active" | "inactive" | "on_leave"
export type StaffRole =
  | "admin"
  | "manager"
  | "developer"
  | "designer"
  | "support_specialist"
  | "hr_coordinator"
  | "sales_executive"
  | "support"

export interface Staff {
  id: string
  name: string
  email: string
  phone?: string
  address?: StaffAddress
  position: string
  department?: string
  role: StaffRole
  salary?: number
  payment_rate: number
  payment_frequency?: string
  payment_type?: string
  payment_duration?: string
  payment_time?: string
  joinDate: string // ISO string (maps to join_date)
  status: StaffStatus
  avatar?: string // maps to profilePictureUrl in forms
  permissions?: string[]
  created_at?: string
  updated_at?: string
}

// For API responses from database
export interface StaffFromDB {
  id: number
  name: string
  email: string
  phone?: string | null
  address_street?: string | null
  address_city?: string | null
  address_state?: string | null
  address_zip?: string | null
  address_country?: string | null
  position: string
  department?: string | null
  role: string
  salary?: number | null
  payment_rate: number
  payment_frequency?: string | null
  payment_type?: string | null
  payment_duration?: string | null
  payment_time?: string | null
  join_date: Date
  status: string
  avatar?: string | null
  permissions: string[]
  created_at?: Date | null
  updated_at?: Date | null
}
