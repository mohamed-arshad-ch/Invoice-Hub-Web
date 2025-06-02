import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"
import type { CreateOutgoingPaymentRequest } from "@/lib/types/outgoing-payment"
import { requireAuth, createUnauthorizedResponse } from "@/lib/middleware-auth"

// Create a global Prisma instance with better error handling
let prisma: PrismaClient

declare global {
  var __prisma: PrismaClient | undefined
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  })
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['error', 'warn'],
    })
  }
  prisma = global.__prisma
}

// Generate payment number
function generatePaymentNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `OP-${timestamp}-${random}`
}

// Helper function to check database connection
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection check failed:", error)
    return false
  }
}

// GET /api/outgoing-payments - Get all outgoing payments
export async function GET(request: NextRequest) {
  try {
    // Authenticate user (supports both web cookies and mobile Authorization headers)
    const user = await requireAuth(request)
    if (!user) {
      return createUnauthorizedResponse()
    }

    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      return NextResponse.json(
        { 
          error: "Database connection unavailable. Please try again later.",
          code: "DATABASE_CONNECTION_ERROR"
        },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const method = searchParams.get('method')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { payment_number: { contains: search, mode: 'insensitive' } },
        { payee_name: { contains: search, mode: 'insensitive' } },
        { reference_number: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Status filter
    if (status && status !== 'All') {
      where.status = status
    }

    // Category filter
    if (category && category !== 'All') {
      where.payment_category = category
    }

    // Payment method filter
    if (method && method !== 'All') {
      where.payment_method = method
    }

    // Date range filter
    if (startDate && endDate) {
      where.payment_date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const payments = await prisma.outgoing_payments.findMany({
      where,
      include: {
        expense_category: true,
        staff: true,
        product: true,
        creator: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      paymentNumber: payment.payment_number,
      paymentCategory: payment.payment_category,
      expenseCategoryId: payment.expense_category_id,
      staffId: payment.staff_id,
      productId: payment.product_id,
      payeeName: payment.payee_name,
      amount: Number(payment.amount),
      paymentDate: payment.payment_date.toISOString(),
      paymentMethod: payment.payment_method,
      referenceNumber: payment.reference_number,
      status: payment.status,
      notes: payment.notes,
      attachments: payment.attachments as Array<{ name: string; url: string; type: string }> || [],
      createdBy: payment.created_by,
      createdAt: payment.created_at.toISOString(),
      updatedAt: payment.updated_at.toISOString(),
      expenseCategory: payment.expense_category ? {
        id: payment.expense_category.id,
        name: payment.expense_category.name,
        description: payment.expense_category.description,
        status: payment.expense_category.status,
        createdAt: payment.expense_category.created_at.toISOString(),
        updatedAt: payment.expense_category.updated_at.toISOString()
      } : null,
      staff: payment.staff ? {
        id: payment.staff.id.toString(),
        name: payment.staff.name,
        email: payment.staff.email,
        position: payment.staff.position,
        department: payment.staff.department
      } : null,
      product: payment.product ? {
        id: payment.product.id.toString(),
        name: payment.product.name,
        description: payment.product.description,
        category: payment.product.category
      } : null
    }))

    return NextResponse.json({ 
      success: true,
      payments: formattedPayments,
      user: {
        id: user.userId,
        email: user.email,
        role: user.role
      }
    })

  } catch (error: any) {
    console.error("Error fetching outgoing payments:", error)
    
    // Handle specific Prisma errors
    if (error?.code === 'P1001' || error?.message?.includes("Can't reach database server")) {
      return NextResponse.json(
        { 
          error: "Database connection unavailable. Please check your connection and try again.",
          code: "DATABASE_CONNECTION_ERROR"
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { 
        error: "Failed to fetch payments. Please try again later.",
        code: "INTERNAL_SERVER_ERROR"
      },
      { status: 500 }
    )
  }
}

// POST /api/outgoing-payments - Create new outgoing payment
export async function POST(request: NextRequest) {
  try {
    // Authenticate user (supports both web cookies and mobile Authorization headers)
    const user = await requireAuth(request)
    if (!user) {
      return createUnauthorizedResponse()
    }

    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      return NextResponse.json(
        { 
          error: "Database connection unavailable. Please try again later.",
          code: "DATABASE_CONNECTION_ERROR"
        },
        { status: 503 }
      )
    }

    const body: CreateOutgoingPaymentRequest = await request.json()

    // Validate required fields based on payment category
    if (body.paymentCategory === "Staff Salary" && !body.staffId) {
      return NextResponse.json(
        { error: "Staff member is required for salary payments", code: "VALIDATION_ERROR" },
        { status: 400 }
      )
    }

    if (body.paymentCategory === "Cloud Subscription" && !body.productId) {
      return NextResponse.json(
        { error: "Product/Service is required for subscription payments", code: "VALIDATION_ERROR" },
        { status: 400 }
      )
    }

    if (body.paymentCategory === "Other Outgoing Payment" && !body.payeeName) {
      return NextResponse.json(
        { error: "Payee name is required for other payments", code: "VALIDATION_ERROR" },
        { status: 400 }
      )
    }

    // Validate that referenced records exist before creating
    if (body.staffId) {
      const staffExists = await prisma.staff.findUnique({
        where: { id: body.staffId }
      })
      if (!staffExists) {
        return NextResponse.json(
          { error: "Selected staff member does not exist", code: "VALIDATION_ERROR" },
          { status: 400 }
        )
      }
    }

    if (body.productId) {
      const productExists = await prisma.products.findUnique({
        where: { id: body.productId }
      })
      if (!productExists) {
        return NextResponse.json(
          { error: "Selected product/service does not exist", code: "VALIDATION_ERROR" },
          { status: 400 }
        )
      }
    }

    if (body.expenseCategoryId) {
      const categoryExists = await prisma.expense_categories.findUnique({
        where: { id: body.expenseCategoryId }
      })
      if (!categoryExists) {
        return NextResponse.json(
          { error: "Selected expense category does not exist", code: "VALIDATION_ERROR" },
          { status: 400 }
        )
      }
    }

    // Use authenticated user ID instead of hardcoded value
    const createdBy = user.userId

    // Prepare data for creation - only include IDs that exist
    const paymentData: any = {
      payment_number: generatePaymentNumber(),
      payment_category: body.paymentCategory,
      amount: body.amount,
      payment_date: new Date(body.paymentDate),
      payment_method: body.paymentMethod,
      status: body.status,
      created_by: createdBy
    }

    // Only add foreign keys if they're provided and valid
    if (body.expenseCategoryId) {
      paymentData.expense_category_id = body.expenseCategoryId
    }
    if (body.staffId) {
      paymentData.staff_id = body.staffId
    }
    if (body.productId) {
      paymentData.product_id = body.productId
    }
    if (body.payeeName) {
      paymentData.payee_name = body.payeeName
    }
    if (body.referenceNumber) {
      paymentData.reference_number = body.referenceNumber
    }
    if (body.notes) {
      paymentData.notes = body.notes
    }
    if (body.attachments && body.attachments.length > 0) {
      paymentData.attachments = body.attachments
    }

    const payment = await prisma.outgoing_payments.create({
      data: paymentData,
      include: {
        expense_category: true,
        staff: true,
        product: true,
        creator: true
      }
    })

    const formattedPayment = {
      id: payment.id,
      paymentNumber: payment.payment_number,
      paymentCategory: payment.payment_category,
      expenseCategoryId: payment.expense_category_id,
      staffId: payment.staff_id,
      productId: payment.product_id,
      payeeName: payment.payee_name,
      amount: Number(payment.amount),
      paymentDate: payment.payment_date.toISOString(),
      paymentMethod: payment.payment_method,
      referenceNumber: payment.reference_number,
      status: payment.status,
      notes: payment.notes,
      attachments: payment.attachments as Array<{ name: string; url: string; type: string }> || [],
      createdBy: payment.created_by,
      createdAt: payment.created_at.toISOString(),
      updatedAt: payment.updated_at.toISOString(),
      expenseCategory: payment.expense_category ? {
        id: payment.expense_category.id,
        name: payment.expense_category.name,
        description: payment.expense_category.description,
        status: payment.expense_category.status,
        createdAt: payment.expense_category.created_at.toISOString(),
        updatedAt: payment.expense_category.updated_at.toISOString()
      } : null
    }

    return NextResponse.json({ 
      success: true, 
      payment: formattedPayment 
    }, { status: 201 })

  } catch (error: any) {
    console.error("Error creating outgoing payment:", error)
    
    // Handle specific Prisma errors
    if (error?.code === 'P1001' || error?.message?.includes("Can't reach database server")) {
      return NextResponse.json(
        { 
          error: "Database connection unavailable. Please check your connection and try again.",
          code: "DATABASE_CONNECTION_ERROR"
        },
        { status: 503 }
      )
    }

    if (error?.code === 'P2002') {
      return NextResponse.json(
        { 
          error: "Payment number already exists. Please try again.",
          code: "DUPLICATE_PAYMENT_NUMBER"
        },
        { status: 409 }
      )
    }

    if (error?.code === 'P2003') {
      return NextResponse.json(
        { 
          error: "Invalid reference to staff, product, or expense category. Please check your selections.",
          code: "FOREIGN_KEY_ERROR"
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: "Failed to create payment. Please try again later.",
        code: "INTERNAL_SERVER_ERROR"
      },
      { status: 500 }
    )
  }
} 