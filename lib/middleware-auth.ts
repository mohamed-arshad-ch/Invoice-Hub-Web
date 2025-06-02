import { NextRequest } from 'next/server'
import { verifyToken, getTokenFromCookies, type JWTPayload } from './jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

/**
 * Extracts and verifies JWT token from either:
 * 1. Authorization header (for mobile apps): "Bearer <token>"
 * 2. HTTP-only cookies (for web browsers): "auth-token"
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    let token: string | null = null

    // Try to get token from Authorization header (mobile apps)
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7) // Remove "Bearer " prefix
    }

    // If no token in header, try to get from cookies (web browsers)
    if (!token) {
      token = await getTokenFromCookies()
    }

    if (!token) {
      return null
    }

    // Verify the token
    const payload = verifyToken(token)
    return payload
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Creates an authenticated response for unauthorized requests
 */
export function createUnauthorizedResponse() {
  return Response.json(
    { 
      success: false, 
      message: 'Unauthorized. Please provide a valid authentication token.',
      code: 'UNAUTHORIZED'
    },
    { status: 401 }
  )
}

/**
 * Middleware helper to protect API routes
 * Usage in API routes:
 * 
 * const user = await requireAuth(request)
 * if (!user) {
 *   return createUnauthorizedResponse()
 * }
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload | null> {
  return await getAuthenticatedUser(request)
}

/**
 * Role-based authorization helper
 */
export function hasRole(user: JWTPayload, requiredRoles: string[]): boolean {
  return requiredRoles.includes(user.role.toLowerCase())
}

/**
 * Admin-only authorization helper
 */
export function isAdmin(user: JWTPayload): boolean {
  return user.role.toLowerCase() === 'admin'
}

/**
 * Creates a forbidden response for insufficient permissions
 */
export function createForbiddenResponse() {
  return Response.json(
    { 
      success: false, 
      message: 'Forbidden. Insufficient permissions.',
      code: 'FORBIDDEN'
    },
    { status: 403 }
  )
} 