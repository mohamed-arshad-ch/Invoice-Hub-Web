import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

// POST /api/staff/details - Get staff member details by ID
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Staff ID is required', success: false },
        { status: 400 }
      )
    }

    if (action === 'view') {
      // Get staff member details
      const staffMember = await prisma.staff.findUnique({
        where: { id: parseInt(id) }
      })

      if (!staffMember) {
        return NextResponse.json(
          { error: 'Staff member not found', success: false },
          { status: 404 }
        )
      }

      // Transform response
      const transformedStaff = {
        id: staffMember.id.toString(),
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone,
        address: staffMember.address_street ? {
          street: staffMember.address_street,
          city: staffMember.address_city || '',
          state: staffMember.address_state || '',
          zip: staffMember.address_zip || '',
          country: staffMember.address_country || ''
        } : undefined,
        position: staffMember.position,
        department: staffMember.department,
        role: staffMember.role,
        salary: staffMember.salary ? Number(staffMember.salary) : undefined,
        payment_rate: Number(staffMember.payment_rate),
        payment_frequency: staffMember.payment_frequency,
        payment_type: staffMember.payment_type,
        payment_duration: staffMember.payment_duration,
        payment_time: staffMember.payment_time,
        joinDate: staffMember.join_date.toISOString(),
        status: staffMember.status,
        avatar: staffMember.avatar,
        permissions: staffMember.permissions,
        created_at: staffMember.created_at?.toISOString(),
        updated_at: staffMember.updated_at?.toISOString()
      }

      return NextResponse.json({ data: transformedStaff, success: true })
    } 
    
    else if (action === 'update') {
      // Update staff member
      const {
        name,
        email,
        phone,
        address,
        position,
        department,
        role,
        salary,
        payment_rate,
        payment_frequency,
        payment_type,
        payment_duration,
        payment_time,
        joinDate,
        status,
        avatar,
        permissions
      } = body

      // Validate required fields
      if (!name || !email || !position || payment_rate === undefined || payment_rate === null) {
        return NextResponse.json(
          { error: 'Missing required fields: name, email, position, payment_rate', success: false },
          { status: 400 }
        )
      }

      const updatedStaff = await prisma.staff.update({
        where: { id: parseInt(id) },
        data: {
          name,
          email,
          phone: phone || null,
          address_street: address?.street || null,
          address_city: address?.city || null,
          address_state: address?.state || null,
          address_zip: address?.zip || null,
          address_country: address?.country || null,
          position,
          department: department || null,
          role: role || 'support',
          salary: salary ? Number(salary) : null,
          payment_rate: Number(payment_rate),
          payment_frequency: payment_frequency || 'hourly',
          payment_type: payment_type || 'hourly',
          payment_duration: payment_duration || 'hourly',
          payment_time: payment_time || 'daily',
          join_date: joinDate ? new Date(joinDate) : undefined,
          status: status || 'active',
          avatar: avatar || null,
          permissions: permissions || [],
          updated_at: new Date()
        }
      })

      // Transform response
      const transformedStaff = {
        id: updatedStaff.id.toString(),
        name: updatedStaff.name,
        email: updatedStaff.email,
        phone: updatedStaff.phone,
        address: updatedStaff.address_street ? {
          street: updatedStaff.address_street,
          city: updatedStaff.address_city || '',
          state: updatedStaff.address_state || '',
          zip: updatedStaff.address_zip || '',
          country: updatedStaff.address_country || ''
        } : undefined,
        position: updatedStaff.position,
        department: updatedStaff.department,
        role: updatedStaff.role,
        salary: updatedStaff.salary ? Number(updatedStaff.salary) : undefined,
        payment_rate: Number(updatedStaff.payment_rate),
        payment_frequency: updatedStaff.payment_frequency,
        payment_type: updatedStaff.payment_type,
        payment_duration: updatedStaff.payment_duration,
        payment_time: updatedStaff.payment_time,
        joinDate: updatedStaff.join_date.toISOString(),
        status: updatedStaff.status,
        avatar: updatedStaff.avatar,
        permissions: updatedStaff.permissions,
        created_at: updatedStaff.created_at?.toISOString(),
        updated_at: updatedStaff.updated_at?.toISOString()
      }

      return NextResponse.json({ data: transformedStaff, success: true })
    }
    
    else {
      return NextResponse.json(
        { error: 'Invalid action. Use "view" or "update"', success: false },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error processing staff request:', error)
    
    // Handle unique constraint violation (email already exists)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email address is already in use', success: false },
        { status: 409 }
      )
    }

    // Handle record not found for update
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Staff member not found', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process request', success: false },
      { status: 500 }
    )
  }
} 