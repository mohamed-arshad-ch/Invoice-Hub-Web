import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// GET /api/clients - Get all clients
export async function GET() {
  try {
    const clients = await prisma.clients.findMany({
      include: {
        users_clients_created_byTousers: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({ success: true, data: clients }, { status: 200 })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

// POST /api/clients - Create or Update client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...clientData } = body

    // If ID is provided, update existing client
    if (id) {
      const updatedClient = await prisma.clients.update({
        where: { id: parseInt(id) },
        data: {
          business_name: clientData.business_name,
          contact_person: clientData.contact_person,
          email: clientData.email,
          phone: clientData.phone,
          street: clientData.street,
          city: clientData.city,
          state: clientData.state,
          zip: clientData.zip,
          payment_schedule: clientData.payment_schedule,
          payment_terms: clientData.payment_terms,
          status: clientData.status,
          notes: clientData.notes,
          updated_at: new Date(),
        }
      })

      return NextResponse.json({ 
        success: true, 
        data: updatedClient,
        message: 'Client updated successfully' 
      }, { status: 200 })
    }

    // Create new client
    // Generate client_id
    const clientCount = await prisma.clients.count()
    const clientId = `CLT${String(clientCount + 1).padStart(4, '0')}`

    const newClient = await prisma.clients.create({
      data: {
        client_id: clientId,
        business_name: clientData.business_name,
        contact_person: clientData.contact_person,
        email: clientData.email,
        phone: clientData.phone,
        street: clientData.street,
        city: clientData.city,
        state: clientData.state,
        zip: clientData.zip,
        payment_schedule: clientData.payment_schedule || 'monthly',
        payment_terms: clientData.payment_terms || 'net_30',
        status: clientData.status ?? true,
        notes: clientData.notes,
        created_by: clientData.created_by || 1, // This should come from session
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: newClient,
      message: 'Client created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save client' },
      { status: 500 }
    )
  }
} 