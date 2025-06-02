import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createUnauthorizedResponse } from '@/lib/middleware-auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/auth/verify
 * Verifies JWT token and returns current user information
 * Supports both cookie-based (web) and Authorization header (mobile) authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication token
    const user = await requireAuth(request)
    
    if (!user) {
      return createUnauthorizedResponse()
    }

    // Optionally fetch fresh user data from database
    const currentUser = await prisma.users.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        company_name: true,
        role: true,
        client_id: true,
        staff_id: true,
        isfirstlogin: true,
        created_at: true,
        updated_at: true,
      },
    })

    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: currentUser.id,
        firstName: currentUser.first_name,
        lastName: currentUser.last_name,
        email: currentUser.email,
        role: currentUser.role,
        companyName: currentUser.company_name,
        clientId: currentUser.client_id,
        staffId: currentUser.staff_id,
        isFirstLogin: currentUser.isfirstlogin,
        createdAt: currentUser.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: currentUser.updated_at?.toISOString() || new Date().toISOString(),
      },
      tokenPayload: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error during token verification',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    )
  }
} 