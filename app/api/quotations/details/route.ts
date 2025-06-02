import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"
import type { UpdateQuotationRequest } from "@/lib/types/quotation"

const prisma = new PrismaClient()

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

// POST /api/quotations/details - Get quotation details or Update quotation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, id, ...updateData } = body

    if (action === "get") {
      // Get quotation details
      const quotation = await prisma.quotations.findUnique({
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

      if (!quotation) {
        return NextResponse.json(
          { error: "Quotation not found" },
          { status: 404 }
        )
      }

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
      }

      return NextResponse.json({ quotation: formattedQuotation })
    
    } else if (action === "update") {
      // Update quotation
      const updateRequest: UpdateQuotationRequest = updateData

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
        const { subtotal, discountAmount, taxAmount, totalAmount } = calculateQuotationTotals(
          updateRequest.lineItems,
          updateRequest.discountType || "percentage",
          updateRequest.discountValue || 0,
          updateRequest.taxRatePercent || 0
        )
        
        totalsData = {
          subtotal,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          total_amount: totalAmount
        }
      }

      // Update quotation
      const quotation = await prisma.quotations.update({
        where: { id: parseInt(id) },
        data: {
          ...clientData,
          ...(updateRequest.quotationDate && { quotation_date: new Date(updateRequest.quotationDate) }),
          ...(updateRequest.validUntilDate && { valid_until_date: new Date(updateRequest.validUntilDate) }),
          ...(updateRequest.discountType && { discount_type: updateRequest.discountType }),
          ...(updateRequest.discountValue !== undefined && { discount_value: updateRequest.discountValue }),
          ...(updateRequest.taxRatePercent !== undefined && { tax_rate_percent: updateRequest.taxRatePercent }),
          ...(updateRequest.status && { status: updateRequest.status }),
          ...(updateRequest.currency && { currency: updateRequest.currency }),
          ...(updateRequest.termsAndConditions !== undefined && { terms_and_conditions: updateRequest.termsAndConditions }),
          ...(updateRequest.notes !== undefined && { notes: updateRequest.notes }),
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
        await prisma.quotation_line_items.deleteMany({
          where: { quotation_id: parseInt(id) }
        })

        // Create new line items
        await prisma.quotation_line_items.createMany({
          data: updateRequest.lineItems.map((item: any) => ({
            quotation_id: parseInt(id),
            product_id: item.productId,
            product_name: item.productName,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            amount: item.quantity * item.unitPrice
          }))
        })
      }

      // Fetch updated quotation with line items
      const updatedQuotation = await prisma.quotations.findUnique({
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

      const formattedQuotation = {
        id: updatedQuotation!.id,
        quotationNumber: updatedQuotation!.quotation_number,
        clientId: updatedQuotation!.client_id,
        clientName: updatedQuotation!.client_name,
        clientEmail: updatedQuotation!.client_email,
        quotationDate: updatedQuotation!.quotation_date.toISOString(),
        validUntilDate: updatedQuotation!.valid_until_date.toISOString(),
        subtotal: Number(updatedQuotation!.subtotal),
        discountType: updatedQuotation!.discount_type as "percentage" | "fixed",
        discountValue: Number(updatedQuotation!.discount_value),
        discountAmount: Number(updatedQuotation!.discount_amount),
        taxRatePercent: Number(updatedQuotation!.tax_rate_percent),
        taxAmount: Number(updatedQuotation!.tax_amount),
        totalAmount: Number(updatedQuotation!.total_amount),
        status: updatedQuotation!.status,
        currency: updatedQuotation!.currency,
        termsAndConditions: updatedQuotation!.terms_and_conditions,
        notes: updatedQuotation!.notes,
        createdBy: updatedQuotation!.created_by,
        createdAt: updatedQuotation!.created_at.toISOString(),
        updatedAt: updatedQuotation!.updated_at.toISOString(),
        lineItems: updatedQuotation!.line_items.map((item: any) => ({
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

      return NextResponse.json({ quotation: formattedQuotation })
    
    } else if (action === "delete") {
      // Delete quotation
      await prisma.quotations.delete({
        where: { id: parseInt(id) }
      })

      return NextResponse.json({ message: "Quotation deleted successfully" })
    
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'get', 'update', or 'delete'" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Error in quotation details API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 