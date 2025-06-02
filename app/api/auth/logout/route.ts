import { NextResponse } from 'next/server'
import { clearTokenCookie } from '@/lib/jwt'

export async function POST() {
  try {
    // Clear the JWT token cookie
    await clearTokenCookie()

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Also clear cookie in response headers as fallback
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
} 