import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"
import type { CreateQuotationRequest } from "@/lib/types/quotation"

const prisma = new PrismaClient()

// Generate quotation number
function generateQuotationNumber(nextNumber: number): string {
  const year = new Date().getFullYear()
  const paddedNumber = String(nextNumber).padStart(4, "0")
  return `QUO-${year}-${paddedNumber}`
}

// Calculate totals
function calculateQuotationTotals(lineItems: any[], discountType: "percentage" | "fixed", discountValue: number, taxRatePercent: number) {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  
  let discountAmount = 0
  if (discountType === "percentage") {
    discountAmount = (subtotal * discountValue) / 100
  } else {
    discountAmount = discountValue
  }
  
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * taxRatePercent) / 100
  const totalAmount = taxableAmount + taxAmount
  
  return {
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount
  }
}

// GET /api/quotations - List quotations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")

    const where: any = {}
    
    if (status && status !== "all") {
      where.status = status
    }
    
    if (clientId) {
      where.client_id = parseInt(clientId)
    }

    const [quotations, total] = await Promise.all([
      prisma.quotations.findMany({
        where,
        include: {
          client: true,
          line_items: {
            include: {
              product: true
            }
          }
        },
        orderBy: {
          created_at: "desc"
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.quotations.count({ where })
    ])

    const formattedQuotations = quotations.map((quotation: any) => ({
      id: quotation.id,
      quotationNumber: quotation.quotation_number,
      clientId: quotation.client_id,
      clientName: quotation.client_name,
      clientEmail: quotation.client_email,
      quotationDate: quotation.quotation_date.toISOString(),
      validUntilDate: quotation.valid_until_date.toISOString(),
      subtotal: Number(quotation.subtotal),
      discountType: quotation.discount_type as "percentage" | "fixed",
      discountValue: Number(quotation.discount_value),
      discountAmount: Number(quotation.discount_amount),
      taxRatePercent: Number(quotation.tax_rate_percent),
      taxAmount: Number(quotation.tax_amount),
      totalAmount: Number(quotation.total_amount),
      status: quotation.status,
      currency: quotation.currency,
      termsAndConditions: quotation.terms_and_conditions,
      notes: quotation.notes,
      createdBy: quotation.created_by,
      createdAt: quotation.created_at.toISOString(),
      updatedAt: quotation.updated_at.toISOString(),
      client: quotation.client ? {
        id: quotation.client.id,
        client_id: quotation.client.client_id,
        business_name: quotation.client.business_name,
        contact_person: quotation.client.contact_person,
        email: quotation.client.email,
        phone: quotation.client.phone,
        street: quotation.client.street,
        city: quotation.client.city,
        state: quotation.client.state,
        zip: quotation.client.zip,
        payment_schedule: quotation.client.payment_schedule,
        payment_terms: quotation.client.payment_terms,
        status: quotation.client.status,
        notes: quotation.client.notes,
        total_spent: Number(quotation.client.total_spent),
        last_payment: quotation.client.last_payment?.toISOString(),
        upcoming_payment: quotation.client.upcoming_payment?.toISOString(),
        joined_date: quotation.client.joined_date.toISOString(),
        created_by: quotation.client.created_by,
        created_at: quotation.client.created_at.toISOString(),
        updated_at: quotation.client.updated_at.toISOString()
      } : undefined,
      lineItems: quotation.line_items.map((item: any) => ({
        id: item.id,
        quotationId: item.quotation_id,
        productId: item.product_id,
        productName: item.product_name,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        amount: Number(item.amount)
      }))
    }))

    const response = {
      quotations: formattedQuotations as any,
      total,
      page,
      limit
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching quotations:", error)
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 }
    )
  }
}

// POST /api/quotations - Create quotation
export async function POST(request: NextRequest) {
  try {
    const body: CreateQuotationRequest = await request.json()

    // Get client details
    const client = await prisma.clients.findUnique({
      where: { id: body.clientId }
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    // Get next quotation number
    const lastQuotation = await prisma.quotations.findFirst({
      orderBy: { created_at: "desc" }
    })

    const nextNumber = lastQuotation ? 
      parseInt(lastQuotation.quotation_number.split("-").pop() || "0") + 1 : 1
    const quotationNumber = generateQuotationNumber(nextNumber)

    // Calculate totals
    const { subtotal, discountAmount, taxAmount, totalAmount } = calculateQuotationTotals(
      body.lineItems,
      body.discountType,
      body.discountValue,
      body.taxRatePercent
    )

    // TODO: Get actual user ID from session/auth
    const createdBy = 1 // Placeholder

    // Create quotation with line items
    const quotation = await prisma.quotations.create({
      data: {
        quotation_number: quotationNumber,
        client_id: body.clientId,
        client_name: client.business_name,
        client_email: client.email,
        quotation_date: new Date(body.quotationDate),
        valid_until_date: new Date(body.validUntilDate),
        subtotal,
        discount_type: body.discountType,
        discount_value: body.discountValue,
        discount_amount: discountAmount,
        tax_rate_percent: body.taxRatePercent,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: body.status,
        currency: body.currency,
        terms_and_conditions: body.termsAndConditions,
        notes: body.notes,
        created_by: createdBy,
        line_items: {
          create: body.lineItems.map((item: any) => ({
            product_id: item.productId,
            product_name: item.productName,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            amount: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        client: true,
        line_items: {
          include: {
            product: true
          }
        }
      }
    })

    const formattedQuotation = {
      id: quotation.id,
      quotationNumber: quotation.quotation_number,
      clientId: quotation.client_id,
      clientName: quotation.client_name,
      clientEmail: quotation.client_email,
      quotationDate: quotation.quotation_date.toISOString(),
      validUntilDate: quotation.valid_until_date.toISOString(),
      subtotal: Number(quotation.subtotal),
      discountType: quotation.discount_type as "percentage" | "fixed",
      discountValue: Number(quotation.discount_value),
      discountAmount: Number(quotation.discount_amount),
      taxRatePercent: Number(quotation.tax_rate_percent),
      taxAmount: Number(quotation.tax_amount),
      totalAmount: Number(quotation.total_amount),
      status: quotation.status,
      currency: quotation.currency,
      termsAndConditions: quotation.terms_and_conditions,
      notes: quotation.notes,
      createdBy: quotation.created_by,
      createdAt: quotation.created_at.toISOString(),
      updatedAt: quotation.updated_at.toISOString(),
      lineItems: quotation.line_items.map((item: any) => ({
        id: item.id,
        quotationId: item.quotation_id,
        productId: item.product_id,
        productName: item.product_name,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        amount: Number(item.amount)
      }))
    }

    return NextResponse.json({ quotation: formattedQuotation }, { status: 201 })
  } catch (error) {
    console.error("Error creating quotation:", error)
    return NextResponse.json(
      { error: "Failed to create quotation" },
      { status: 500 }
    )
  }
} 