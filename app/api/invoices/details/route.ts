import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

// Calculate totals
function calculateInvoiceTotals(lineItems: any[], taxRatePercent: number) {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const taxAmount = (subtotal * taxRatePercent) / 100
  const totalAmount = subtotal + taxAmount
  
  return {
    subtotal,
    taxAmount,
    totalAmount
  }
}

// POST /api/invoices/details - Get invoice details, Update invoice, or Delete invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, id, ...updateData } = body

    if (action === "get") {
      // Get invoice details
      const invoice = await prisma.invoices.findUnique({
        where: { id: parseInt(id) },
        include: {
          client: true,
          line_items: {
            include: {
              product: true
            }
          }
        }
      })

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        )
      }

      const formattedInvoice = {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        clientId: invoice.client_id,
        clientName: invoice.client_name,
        clientEmail: invoice.client_email,
        issueDate: invoice.issue_date.toISOString(),
        dueDate: invoice.due_date.toISOString(),
        paymentTerms: invoice.payment_terms,
        subtotal: Number(invoice.subtotal),
        taxRatePercent: Number(invoice.tax_rate_percent),
        taxAmount: Number(invoice.tax_amount),
        totalAmount: Number(invoice.total_amount),
        amountPaid: Number(invoice.amount_paid),
        balanceDue: Number(invoice.balance_due),
        status: invoice.status,
        notes: invoice.notes,
        paymentInstructions: invoice.payment_instructions,
        createdBy: invoice.created_by,
        createdAt: invoice.created_at.toISOString(),
        updatedAt: invoice.updated_at.toISOString(),
        client: invoice.client ? {
          id: invoice.client.id,
          client_id: invoice.client.client_id,
          business_name: invoice.client.business_name,
          contact_person: invoice.client.contact_person,
          email: invoice.client.email,
          phone: invoice.client.phone,
          street: invoice.client.street,
          city: invoice.client.city,
          state: invoice.client.state,
          zip: invoice.client.zip,
          payment_schedule: invoice.client.payment_schedule,
          payment_terms: invoice.client.payment_terms,
          status: invoice.client.status,
          notes: invoice.client.notes,
          total_spent: Number(invoice.client.total_spent),
          last_payment: invoice.client.last_payment?.toISOString(),
          upcoming_payment: invoice.client.upcoming_payment?.toISOString(),
          joined_date: invoice.client.joined_date.toISOString(),
          created_by: invoice.client.created_by,
          created_at: invoice.client.created_at.toISOString(),
          updated_at: invoice.client.updated_at.toISOString()
        } : undefined,
        lineItems: invoice.line_items.map((item: any) => ({
          id: item.id,
          invoiceId: item.invoice_id,
          productId: item.product_id,
          productName: item.product_name,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          amount: Number(item.amount)
        }))
      }

      return NextResponse.json({ invoice: formattedInvoice })
    
    } else if (action === "update") {
      // Update invoice
      const updateRequest = updateData

      // Get client details if clientId is being updated
      let clientData = {}
      if (updateRequest.clientId) {
        const client = await prisma.clients.findUnique({
          where: { id: updateRequest.clientId }
        })

        if (!client) {
          return NextResponse.json(
            { error: "Client not found" },
            { status: 404 }
          )
        }

        clientData = {
          client_id: updateRequest.clientId,
          client_name: client.business_name,
          client_email: client.email
        }
      }

      // Calculate totals if lineItems are provided
      let totalsData = {}
      if (updateRequest.lineItems) {
        const { subtotal, taxAmount, totalAmount } = calculateInvoiceTotals(
          updateRequest.lineItems,
          updateRequest.taxRatePercent || 0
        )
        
        const amountPaid = updateRequest.amountPaid || 0
        const balanceDue = totalAmount - amountPaid
        
        totalsData = {
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          amount_paid: amountPaid,
          balance_due: balanceDue
        }
      }

      // Update invoice
      const invoice = await prisma.invoices.update({
        where: { id: parseInt(id) },
        data: {
          ...clientData,
          ...(updateRequest.issueDate && { issue_date: new Date(updateRequest.issueDate) }),
          ...(updateRequest.dueDate && { due_date: new Date(updateRequest.dueDate) }),
          ...(updateRequest.paymentTerms && { payment_terms: updateRequest.paymentTerms }),
          ...(updateRequest.taxRatePercent !== undefined && { tax_rate_percent: updateRequest.taxRatePercent }),
          ...(updateRequest.amountPaid !== undefined && { amount_paid: updateRequest.amountPaid }),
          ...(updateRequest.status && { status: updateRequest.status }),
          ...(updateRequest.notes !== undefined && { notes: updateRequest.notes }),
          ...(updateRequest.paymentInstructions !== undefined && { payment_instructions: updateRequest.paymentInstructions }),
          ...totalsData,
          updated_at: new Date()
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

      // Update line items if provided
      if (updateRequest.lineItems) {
        // Delete existing line items
        await prisma.invoice_line_items.deleteMany({
          where: { invoice_id: parseInt(id) }
        })

        // Create new line items
        await prisma.invoice_line_items.createMany({
          data: updateRequest.lineItems.map((item: any) => ({
            invoice_id: parseInt(id),
            product_id: item.productId,
            product_name: item.productName,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            amount: item.quantity * item.unitPrice
          }))
        })
      }

      const formattedInvoice = {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        clientId: invoice.client_id,
        clientName: invoice.client_name,
        clientEmail: invoice.client_email,
        issueDate: invoice.issue_date.toISOString(),
        dueDate: invoice.due_date.toISOString(),
        paymentTerms: invoice.payment_terms,
        subtotal: Number(invoice.subtotal),
        taxRatePercent: Number(invoice.tax_rate_percent),
        taxAmount: Number(invoice.tax_amount),
        totalAmount: Number(invoice.total_amount),
        amountPaid: Number(invoice.amount_paid),
        balanceDue: Number(invoice.balance_due),
        status: invoice.status,
        notes: invoice.notes,
        paymentInstructions: invoice.payment_instructions,
        createdBy: invoice.created_by,
        createdAt: invoice.created_at.toISOString(),
        updatedAt: invoice.updated_at.toISOString(),
        client: invoice.client,
        lineItems: invoice.line_items.map((item: any) => ({
          id: item.id,
          invoiceId: item.invoice_id,
          productId: item.product_id,
          productName: item.product_name,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          amount: Number(item.amount)
        }))
      }

      return NextResponse.json({ invoice: formattedInvoice })
    
    } else if (action === "delete") {
      // Delete invoice
      const invoice = await prisma.invoices.findUnique({
        where: { id: parseInt(id) }
      })

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        )
      }

      // Delete line items first
      await prisma.invoice_line_items.deleteMany({
        where: { invoice_id: parseInt(id) }
      })

      // Delete invoice
      await prisma.invoices.delete({
        where: { id: parseInt(id) }
      })

      return NextResponse.json({ message: "Invoice deleted successfully" })
    
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'get', 'update', or 'delete'" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Invoice details API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 