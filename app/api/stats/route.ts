import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

// GET - Fetch all counts for dashboard stats
export async function GET() {
  try {
    // Get counts for all entities in parallel
    const [clientsCount, staffCount, productsCount] = await Promise.all([
      prisma.clients.count(),
      prisma.staff.count(),
      prisma.products.count(),
    ])

    const stats = {
      clients: clientsCount,
      staff: staffCount,
      products: productsCount,
    }

    return NextResponse.json({ stats }, { status: 200 })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
} 