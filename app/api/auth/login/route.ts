import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, getDashboardRoute } from '@/lib/auth'
import { generateToken, setTokenCookie } from '@/lib/jwt'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = loginSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid input',
          errors: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Authenticate user
    const authResult = await authenticateUser({ email, password })

    if (!authResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: authResult.message 
        },
        { status: 401 }
      )
    }

    // Generate JWT token
    const tokenPayload = {
      userId: authResult.user!.id,
      email: authResult.user!.email,
      role: authResult.user!.role,
    }
    
    const token = generateToken(tokenPayload)
    
    // Set HTTP-only cookie
    await setTokenCookie(token)

    // Get dashboard route based on user role
    const dashboardRoute = getDashboardRoute(authResult.user!.role)

    const response = NextResponse.json({
      success: true,
      message: authResult.message,
      user: {
        id: authResult.user!.id,
        firstName: authResult.user!.first_name,
        lastName: authResult.user!.last_name,
        email: authResult.user!.email,
        role: authResult.user!.role,
        companyName: authResult.user!.company_name,
        isFirstLogin: authResult.user!.isfirstlogin,
      },
      redirectUrl: dashboardRoute,
    })

    // Also set the cookie in response headers as fallback
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
} 