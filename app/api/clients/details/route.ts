import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// POST /api/clients/details - Get client details by ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      )
    }

    const client = await prisma.clients.findUnique({
      where: { id: parseInt(id) },
      include: {
        users_clients_created_byTousers: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          }
        },
        transactions: {
          take: 10,
          orderBy: {
            created_at: 'desc'
          }
        },
        ledger: {
          take: 10,
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: client }, { status: 200 })
  } catch (error) {
    console.error('Error fetching client details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client details' },
      { status: 500 }
    )
  }
} 