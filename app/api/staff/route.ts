import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

// GET /api/staff - Get all staff members
export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { created_at: 'desc' }
    })

    // Transform database response to match frontend expectations
    const transformedStaff = staff.map((staffMember) => ({
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
    }))

    return NextResponse.json({ data: transformedStaff, success: true })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff members', success: false },
      { status: 500 }
    )
  }
}

// POST /api/staff - Create new staff member
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
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

    const newStaff = await prisma.staff.create({
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
        join_date: joinDate ? new Date(joinDate) : new Date(),
        status: status || 'active',
        avatar: avatar || null,
        permissions: permissions || []
      }
    })

    // Transform response
    const transformedStaff = {
      id: newStaff.id.toString(),
      name: newStaff.name,
      email: newStaff.email,
      phone: newStaff.phone,
      address: newStaff.address_street ? {
        street: newStaff.address_street,
        city: newStaff.address_city || '',
        state: newStaff.address_state || '',
        zip: newStaff.address_zip || '',
        country: newStaff.address_country || ''
      } : undefined,
      position: newStaff.position,
      department: newStaff.department,
      role: newStaff.role,
      salary: newStaff.salary ? Number(newStaff.salary) : undefined,
      payment_rate: Number(newStaff.payment_rate),
      payment_frequency: newStaff.payment_frequency,
      payment_type: newStaff.payment_type,
      payment_duration: newStaff.payment_duration,
      payment_time: newStaff.payment_time,
      joinDate: newStaff.join_date.toISOString(),
      status: newStaff.status,
      avatar: newStaff.avatar,
      permissions: newStaff.permissions,
      created_at: newStaff.created_at?.toISOString(),
      updated_at: newStaff.updated_at?.toISOString()
    }

    return NextResponse.json({ data: transformedStaff, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating staff member:', error)
    
    // Handle unique constraint violation (email already exists)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email address is already in use', success: false },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create staff member', success: false },
      { status: 500 }
    )
  }
} 