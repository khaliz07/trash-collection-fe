import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample user
  const user = await prisma.user.upsert({
    where: { id: 'user-1' },
    update: {},
    create: {
      id: 'user-1',
      email: 'user@example.com',
      password: 'hashedpassword',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      role: 'USER',
      address: 'Phường Linh Trung, Quận Thủ Đức, TP. HCM'
    }
  })

  // Create sample subscription
  const subscription = await prisma.subscription.upsert({
    where: { id: 'sub-1' },
    update: {},
    create: {
      id: 'sub-1',
      userId: user.id,
      packageId: 'pkg-monthly', // Link to the monthly package
      queuePosition: 0,
      status: 'ACTIVE',
      startMonth: '2025-08',
      endMonth: '2025-09',
      activatedAt: new Date()
    }
  })

  // Create sample payments (extension history)
  const payments = [
    {
      id: 'pay-1',
      userId: user.id,
      packageId: 'pkg-monthly',
      subscriptionId: subscription.id,
      amount: 80000,
      status: 'COMPLETED' as const,
      paymentMethod: 'E_WALLET' as const,
      paidAt: new Date('2025-08-01T10:30:00.000Z'),
      createdAt: new Date('2025-08-01T10:30:00.000Z')
    },
    {
      id: 'pay-2',
      userId: user.id,
      packageId: 'pkg-quarterly',
      subscriptionId: subscription.id,
      amount: 228000, // 3 months with discount
      status: 'COMPLETED' as const,
      paymentMethod: 'BANK_TRANSFER' as const,
      paidAt: new Date('2025-05-01T14:20:00.000Z'),
      createdAt: new Date('2025-05-01T14:20:00.000Z')
    },
    {
      id: 'pay-3',
      userId: user.id,
      packageId: 'pkg-monthly',
      subscriptionId: subscription.id,
      amount: 80000,
      status: 'COMPLETED' as const,
      paymentMethod: 'VNPAY' as const,
      paidAt: new Date('2025-04-01T09:15:00.000Z'),
      createdAt: new Date('2025-04-01T09:15:00.000Z')
    }
  ]

  for (const payment of payments) {
    await prisma.payment.upsert({
      where: { id: payment.id },
      update: {},
      create: payment
    })
  }

  // Create sample collections
  await prisma.collection.upsert({
    where: { id: 'col-1' },
    update: {},
    create: {
      id: 'col-1',
      customerId: user.id,
      subscriptionId: subscription.id,
      status: 'SCHEDULED',
      scheduledDate: new Date('2025-08-08T07:00:00.000Z'),
      pickupAddress: 'Phường Linh Trung, Quận Thủ Đức, TP. HCM',
      latitude: 10.8700,
      longitude: 106.8030,
      wasteTypes: ['organic', 'recyclable']
    }
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
