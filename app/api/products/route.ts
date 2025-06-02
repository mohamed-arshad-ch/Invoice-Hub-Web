import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

// GET - Fetch all products
export async function GET() {
  try {
    const products = await prisma.products.findMany({
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST - Create or Update product
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...productData } = data

    // Common validation
    if (!productData.name || !productData.description || !productData.category || !productData.price) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, category, price" },
        { status: 400 }
      )
    }

    // If ID is provided, update existing product
    if (id) {
      const existingProduct = await prisma.products.findUnique({
        where: { id: parseInt(id) }
      })

      if (!existingProduct) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        )
      }

      const updatedProduct = await prisma.products.update({
        where: { id: parseInt(id) },
        data: {
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price: parseFloat(productData.price),
          tax_rate: productData.tax_rate ? parseFloat(productData.tax_rate) : 0,
          status: productData.status || 'active',
          sku: productData.sku,
          stock_quantity: productData.stock_quantity ? parseInt(productData.stock_quantity) : 0,
          is_featured: productData.is_featured || false,
          is_new: productData.is_new || false,
          sale_price: productData.sale_price ? parseFloat(productData.sale_price) : null,
          service_work_hours: productData.service_work_hours ? parseInt(productData.service_work_hours) : 0,
          work_hour_by_day: productData.work_hour_by_day || null,
          work_hours_per_day: productData.work_hours_per_day ? parseFloat(productData.work_hours_per_day) : null,
          updated_at: new Date(),
        },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      })

      return NextResponse.json({ product: updatedProduct }, { status: 200 })
    } else {
      // Create new product
      const newProduct = await prisma.products.create({
        data: {
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price: parseFloat(productData.price),
          tax_rate: productData.tax_rate ? parseFloat(productData.tax_rate) : 0,
          status: productData.status || 'active',
          sku: productData.sku,
          stock_quantity: productData.stock_quantity ? parseInt(productData.stock_quantity) : 0,
          is_featured: productData.is_featured || false,
          is_new: productData.is_new || false,
          sale_price: productData.sale_price ? parseFloat(productData.sale_price) : null,
          service_work_hours: productData.service_work_hours ? parseInt(productData.service_work_hours) : 0,
          work_hour_by_day: productData.work_hour_by_day || null,
          work_hours_per_day: productData.work_hours_per_day ? parseFloat(productData.work_hours_per_day) : null,
          created_by: productData.created_by || 1, // Default to admin user
          created_at: new Date(),
          updated_at: new Date(),
        },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      })

      return NextResponse.json({ product: newProduct }, { status: 201 })
    }
  } catch (error) {
    console.error("Error processing product:", error)
    return NextResponse.json(
      { error: "Failed to process product" },
      { status: 500 }
    )
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const existingProduct = await prisma.products.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    await prisma.products.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
} 