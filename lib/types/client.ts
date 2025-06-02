export interface Client {
  id: number
  client_id: string
  business_name: string
  contact_person: string
  email: string
  phone: string
  street?: string
  city?: string
  state?: string
  zip?: string
  payment_schedule: string
  payment_terms: string
  status: boolean
  notes?: string
  total_spent?: number
  last_payment?: Date | string
  upcoming_payment?: Date | string
  joined_date: Date | string
  created_by: number
  created_at: Date | string
  updated_at: Date | string
}

export interface ClientFormData {
  business_name: string
  contact_person: string
  email: string
  phone: string
  street?: string
  city?: string
  state?: string
  zip?: string
  payment_schedule: string
  payment_terms: string
  status: boolean
  notes?: string
  created_by?: number
}

export type ClientStatus = boolean
