import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

// GET - Fetch all invoices
export async function GET() {
  try {
    const invoices = await prisma.invoices.findMany({
      include: {
        client: true,
        creator: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        line_items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      clientId: invoice.client_id,
      clientName: invoice.client_name,
      clientEmail: invoice.client_email,
      issueDate: invoice.issue_date.toISOString(),
      dueDate: invoice.due_date.toISOString(),
      subtotal: Number(invoice.subtotal),
      taxRatePercent: Number(invoice.tax_rate_percent),
      taxAmount: Number(invoice.tax_amount),
      totalAmount: Number(invoice.total_amount),
      amountPaid: Number(invoice.amount_paid),
      balanceDue: Number(invoice.balance_due),
      status: invoice.status,
      paymentTerms: invoice.payment_terms,
      notes: invoice.notes,
      paymentInstructions: invoice.payment_instructions,
      createdAt: invoice.created_at.toISOString(),
      updatedAt: invoice.updated_at.toISOString(),
      client: {
        id: invoice.client.id,
        businessName: invoice.client.business_name,
        contactPerson: invoice.client.contact_person,
        email: invoice.client.email,
        phone: invoice.client.phone,
      },
      lineItems: invoice.line_items.map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        amount: Number(item.amount),
      })),
    }))

    return NextResponse.json({
      success: true,
      data: formattedInvoices,
    })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices" },
      { status: 500 }
    )
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientId,
      issueDate,
      dueDate,
      lineItems,
      taxRatePercent,
      notes,
      paymentInstructions,
      paymentTerms,
      status,
      amountPaid,
      createdBy,
    } = body

    // Get client information
    const client = await prisma.clients.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      )
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)

    const taxAmount = subtotal * (taxRatePercent / 100)
    const totalAmount = subtotal + taxAmount
    const balanceDue = totalAmount - (amountPaid || 0)

    // Generate invoice number
    const lastInvoice = await prisma.invoices.findFirst({
      orderBy: { id: 'desc' },
      select: { invoice_number: true },
    })

    let invoiceNumber = "INV-0001"
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[1])
      invoiceNumber = `INV-${String(lastNumber + 1).padStart(4, '0')}`
    }

    // Create invoice with line items
    const invoice = await prisma.invoices.create({
      data: {
        invoice_number: invoiceNumber,
        client_id: clientId,
        client_name: client.business_name,
        client_email: client.email,
        issue_date: new Date(issueDate),
        due_date: new Date(dueDate),
        subtotal,
        tax_rate_percent: taxRatePercent,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        amount_paid: amountPaid || 0,
        balance_due: balanceDue,
        status: status || 'draft',
        payment_terms: paymentTerms,
        notes,
        payment_instructions: paymentInstructions,
        created_by: createdBy || 1, // Default to user 1 for now
        line_items: {
          create: lineItems.map((item: any) => ({
            product_id: item.productId,
            product_name: item.productName,
            description: item.description || '',
            quantity: item.quantity,
            unit_price: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: true,
        line_items: {
          include: {
            product: true,
          },
        },
      },
    })

    const formattedInvoice = {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      clientId: invoice.client_id,
      clientName: invoice.client_name,
      clientEmail: invoice.client_email,
      issueDate: invoice.issue_date.toISOString(),
      dueDate: invoice.due_date.toISOString(),
      subtotal: Number(invoice.subtotal),
      taxRatePercent: Number(invoice.tax_rate_percent),
      taxAmount: Number(invoice.tax_amount),
      totalAmount: Number(invoice.total_amount),
      amountPaid: Number(invoice.amount_paid),
      balanceDue: Number(invoice.balance_due),
      status: invoice.status,
      paymentTerms: invoice.payment_terms,
      notes: invoice.notes,
      paymentInstructions: invoice.payment_instructions,
      createdAt: invoice.created_at.toISOString(),
      updatedAt: invoice.updated_at.toISOString(),
      lineItems: invoice.line_items.map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        amount: Number(item.amount),
      })),
    }

    return NextResponse.json({
      success: true,
      data: formattedInvoice,
    })
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create invoice" },
      { status: 500 }
    )
  }
}

// PUT - Update invoice
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      clientId,
      issueDate,
      dueDate,
      lineItems,
      taxRatePercent,
      notes,
      paymentInstructions,
      paymentTerms,
      status,
      amountPaid,
    } = body

    // Get client information
    const client = await prisma.clients.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      )
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)

    const taxAmount = subtotal * (taxRatePercent / 100)
    const totalAmount = subtotal + taxAmount
    const balanceDue = totalAmount - (amountPaid || 0)

    // Update invoice and replace line items
    const invoice = await prisma.invoices.update({
      where: { id },
      data: {
        client_id: clientId,
        client_name: client.business_name,
        client_email: client.email,
        issue_date: new Date(issueDate),
        due_date: new Date(dueDate),
        subtotal,
        tax_rate_percent: taxRatePercent,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        amount_paid: amountPaid || 0,
        balance_due: balanceDue,
        status,
        payment_terms: paymentTerms,
        notes,
        payment_instructions: paymentInstructions,
        updated_at: new Date(),
        line_items: {
          deleteMany: {},
          create: lineItems.map((item: any) => ({
            product_id: item.productId,
            product_name: item.productName,
            description: item.description || '',
            quantity: item.quantity,
            unit_price: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: true,
        line_items: {
          include: {
            product: true,
          },
        },
      },
    })

    const formattedInvoice = {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      clientId: invoice.client_id,
      clientName: invoice.client_name,
      clientEmail: invoice.client_email,
      issueDate: invoice.issue_date.toISOString(),
      dueDate: invoice.due_date.toISOString(),
      subtotal: Number(invoice.subtotal),
      taxRatePercent: Number(invoice.tax_rate_percent),
      taxAmount: Number(invoice.tax_amount),
      totalAmount: Number(invoice.total_amount),
      amountPaid: Number(invoice.amount_paid),
      balanceDue: Number(invoice.balance_due),
      status: invoice.status,
      paymentTerms: invoice.payment_terms,
      notes: invoice.notes,
      paymentInstructions: invoice.payment_instructions,
      createdAt: invoice.created_at.toISOString(),
      updatedAt: invoice.updated_at.toISOString(),
      lineItems: invoice.line_items.map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        amount: Number(item.amount),
      })),
    }

    return NextResponse.json({
      success: true,
      data: formattedInvoice,
    })
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update invoice" },
      { status: 500 }
    )
  }
}

// DELETE - Delete invoice
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Invoice ID is required" },
        { status: 400 }
      )
    }

    await prisma.invoices.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({
      success: true,
      message: "Invoice deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete invoice" },
      { status: 500 }
    )
  }
} 