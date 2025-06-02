import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  company_name: string
  role: string
  client_id?: number | null
  staff_id?: number | null
  isfirstlogin: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  user?: User
  message?: string
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export async function authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const { email, password } = credentials

    // Find user by email
    const user = await prisma.users.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        password_hash: true,
        company_name: true,
        role: true,
        client_id: true,
        staff_id: true,
        isfirstlogin: true,
      },
    })

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
      }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash)

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password',
      }
    }

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Login successful',
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      message: 'An error occurred during authentication',
    }
  }
}

export function getDashboardRoute(role: string): string {
  switch (role.toLowerCase()) {
    case 'admin':
      return '/admin/dashboard'
    case 'client':
      return '/client/dashboard'
    case 'staff':
      return '/staff/dashboard'
    default:
      return '/dashboard' // fallback route
  }
} 