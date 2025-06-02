import { PrismaClient } from '../lib/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Hash the admin password
  const hashedPassword = await bcrypt.hash('Mcodev@123', 12)

  // Create admin user
  const adminUser = await prisma.users.upsert({
    where: { email: 'mac@admin.com' },
    update: {},
    create: {
      first_name: 'Mac',
      last_name: 'Hadams',
      email: 'mac@admin.com',
      password_hash: hashedPassword,
      company_name: 'Invoice Hub Admin',
      role: 'admin',
      isfirstlogin: false,
    },
  })

  console.log('✅ Admin user created:', {
    id: adminUser.id,
    email: adminUser.email,
    name: `${adminUser.first_name} ${adminUser.last_name}`,
    role: adminUser.role,
  })

  // You can add more seed data here if needed
  // For example, sample clients, staff, or products

  console.log('🌱 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 