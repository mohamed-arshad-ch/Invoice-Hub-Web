import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"
import type { UpdateOutgoingPaymentRequest } from "@/lib/types/outgoing-payment"

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

// POST /api/outgoing-payments/details - Get payment details, Update payment, or Delete payment
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { action, id, ...updateData } = body

    if (!action || !id) {
      return NextResponse.json(
        { error: "Action and ID are required", code: "VALIDATION_ERROR" },
        { status: 400 }
      )
    }

    const paymentId = parseInt(id)
    if (isNaN(paymentId)) {
      return NextResponse.json(
        { error: "Invalid payment ID", code: "VALIDATION_ERROR" },
        { status: 400 }
      )
    }

    if (action === "get") {
      // Get payment details
      const payment = await prisma.outgoing_payments.findUnique({
        where: { id: paymentId },
        include: {
          expense_category: true,
          staff: true,
          product: true,
          creator: true
        }
      })

      if (!payment) {
        return NextResponse.json(
          { error: "Payment not found", code: "NOT_FOUND" },
          { status: 404 }
        )
      }

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
        } : null,
        staff: payment.staff ? {
          id: payment.staff.id.toString(),
          name: payment.staff.name,
          email: payment.staff.email,
          phone: payment.staff.phone,
          address: {
            street: payment.staff.address_street,
            city: payment.staff.address_city,
            state: payment.staff.address_state,
            zip: payment.staff.address_zip,
            country: payment.staff.address_country
          },
          position: payment.staff.position,
          department: payment.staff.department,
          role: payment.staff.role as any,
          salary: payment.staff.salary ? Number(payment.staff.salary) : undefined,
          payment_rate: Number(payment.staff.payment_rate),
          payment_frequency: payment.staff.payment_frequency,
          payment_type: payment.staff.payment_type,
          payment_duration: payment.staff.payment_duration,
          payment_time: payment.staff.payment_time,
          joinDate: payment.staff.join_date.toISOString(),
          status: payment.staff.status as any,
          avatar: payment.staff.avatar,
          permissions: payment.staff.permissions,
          created_at: payment.staff.created_at?.toISOString(),
          updated_at: payment.staff.updated_at?.toISOString()
        } : null,
        product: payment.product ? {
          id: payment.product.id.toString(),
          name: payment.product.name,
          description: payment.product.description,
          sku: payment.product.sku || "",
          category: payment.product.category as any,
          pricing: {
            sellingPrice: Number(payment.product.price),
            salePrice: payment.product.sale_price ? Number(payment.product.sale_price) : undefined,
            taxRatePercent: payment.product.tax_rate ? Number(payment.product.tax_rate) : 0
          },
          inventory: {
            stockQuantity: payment.product.stock_quantity || 0,
            manageStock: true
          },
          images: [],
          status: payment.product.status as any,
          features: {
            isFeatured: payment.product.is_featured,
            isNew: payment.product.is_new
          },
          serviceDetails: {
            serviceWorkHours: payment.product.service_work_hours,
            workHourByDay: payment.product.work_hour_by_day,
            workHoursPerDay: payment.product.work_hours_per_day ? Number(payment.product.work_hours_per_day) : undefined
          },
          dateAdded: payment.product.created_at?.toISOString() || "",
          lastUpdated: payment.product.updated_at?.toISOString() || ""
        } : null
      }

      return NextResponse.json({ payment: formattedPayment })
    
    } else if (action === "update") {
      // Update payment
      const updateRequest: UpdateOutgoingPaymentRequest = updateData

      // Validate required fields based on payment category
      if (updateRequest.paymentCategory === "Staff Salary" && !updateRequest.staffId) {
        return NextResponse.json(
          { error: "Staff member is required for salary payments", code: "VALIDATION_ERROR" },
          { status: 400 }
        )
      }

      if (updateRequest.paymentCategory === "Cloud Subscription" && !updateRequest.productId) {
        return NextResponse.json(
          { error: "Product/Service is required for subscription payments", code: "VALIDATION_ERROR" },
          { status: 400 }
        )
      }

      if (updateRequest.paymentCategory === "Other Outgoing Payment" && !updateRequest.payeeName) {
        return NextResponse.json(
          { error: "Payee name is required for other payments", code: "VALIDATION_ERROR" },
          { status: 400 }
        )
      }

      // Validate that referenced records exist before updating
      if (updateRequest.staffId) {
        const staffExists = await prisma.staff.findUnique({
          where: { id: updateRequest.staffId }
        })
        if (!staffExists) {
          return NextResponse.json(
            { error: "Selected staff member does not exist", code: "VALIDATION_ERROR" },
            { status: 400 }
          )
        }
      }

      if (updateRequest.productId) {
        const productExists = await prisma.products.findUnique({
          where: { id: updateRequest.productId }
        })
        if (!productExists) {
          return NextResponse.json(
            { error: "Selected product/service does not exist", code: "VALIDATION_ERROR" },
            { status: 400 }
          )
        }
      }

      if (updateRequest.expenseCategoryId) {
        const categoryExists = await prisma.expense_categories.findUnique({
          where: { id: updateRequest.expenseCategoryId }
        })
        if (!categoryExists) {
          return NextResponse.json(
            { error: "Selected expense category does not exist", code: "VALIDATION_ERROR" },
            { status: 400 }
          )
        }
      }

      // Prepare update data - only include fields that are provided
      const paymentUpdateData: any = {
        payment_category: updateRequest.paymentCategory,
        amount: updateRequest.amount,
        payment_date: new Date(updateRequest.paymentDate),
        payment_method: updateRequest.paymentMethod,
        status: updateRequest.status,
        updated_at: new Date()
      }

      // Only update foreign keys if they're provided and valid, otherwise set to null
      paymentUpdateData.expense_category_id = updateRequest.expenseCategoryId || null
      paymentUpdateData.staff_id = updateRequest.staffId || null
      paymentUpdateData.product_id = updateRequest.productId || null
      paymentUpdateData.payee_name = updateRequest.payeeName || null
      paymentUpdateData.reference_number = updateRequest.referenceNumber || null
      paymentUpdateData.notes = updateRequest.notes || null
      paymentUpdateData.attachments = updateRequest.attachments || []

      const payment = await prisma.outgoing_payments.update({
        where: { id: paymentId },
        data: paymentUpdateData,
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

      return NextResponse.json({ payment: formattedPayment })
    
    } else if (action === "delete") {
      // Check if payment exists before deleting
      const existingPayment = await prisma.outgoing_payments.findUnique({
        where: { id: paymentId }
      })

      if (!existingPayment) {
        return NextResponse.json(
          { error: "Payment not found", code: "NOT_FOUND" },
          { status: 404 }
        )
      }

      // Delete payment
      await prisma.outgoing_payments.delete({
        where: { id: paymentId }
      })

      return NextResponse.json({ 
        message: "Payment deleted successfully",
        code: "DELETED_SUCCESSFULLY" 
      })
    
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'get', 'update', or 'delete'", code: "INVALID_ACTION" },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error("Error in outgoing payment details API:", error)
    
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

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: "Payment not found", code: "NOT_FOUND" },
        { status: 404 }
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
          error: "Invalid reference to staff, product, or expense category.",
          code: "FOREIGN_KEY_ERROR"
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: "Internal server error. Please try again later.",
        code: "INTERNAL_SERVER_ERROR"
      },
      { status: 500 }
    )
  }
} 