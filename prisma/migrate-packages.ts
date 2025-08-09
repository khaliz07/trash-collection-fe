import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📦 Starting package migration...')

  // Create 3 basic service packages
  const packages = [
    {
      id: 'pkg-monthly',
      name: 'Gói cơ bản - 1 tháng',
      description: 'Thu gom rác 2 lần/tuần (Thứ 3 và Thứ 6)',
      type: 'monthly',
      duration: 1,
      price: 80000,
      collectionsPerWeek: 2,
      features: [
        'Thu gom rác sinh hoạt',
        'Thu gom 2 lần/tuần',
        'Hỗ trợ 24/7',
        'Thông báo lịch thu gom'
      ],
      status: 'ACTIVE' as const,
      isPopular: true,
      displayOrder: 1
    },
    {
      id: 'pkg-quarterly',
      name: 'Gói tiết kiệm - 3 tháng',
      description: 'Thu gom rác 2 lần/tuần với ưu đãi 3 tháng',
      type: 'quarterly',
      duration: 3,
      price: 228000, // 80k * 3 * 0.95 (5% discount)
      collectionsPerWeek: 2,
      features: [
        'Thu gom rác sinh hoạt',
        'Thu gom 2 lần/tuần',
        'Hỗ trợ 24/7',
        'Thông báo lịch thu gom',
        'Tiết kiệm 5% so với thanh toán hàng tháng',
        'Ưu tiên hỗ trợ'
      ],
      status: 'ACTIVE' as const,
      isPopular: false,
      displayOrder: 2
    },
    {
      id: 'pkg-annual',
      name: 'Gói premium - 1 năm',
      description: 'Thu gom rác 2 lần/tuần với ưu đãi cả năm + tặng 1 tháng',
      type: 'annual',
      duration: 12,
      price: 864000, // 80k * 12 * 0.9 (10% discount)
      collectionsPerWeek: 2,
      features: [
        'Thu gom rác sinh hoạt',
        'Thu gom 2 lần/tuần',
        'Hỗ trợ 24/7',
        'Thông báo lịch thu gom',
        'Tiết kiệm 10% so với thanh toán hàng tháng',
        'Tặng thêm 1 tháng miễn phí',
        'Ưu tiên hỗ trợ VIP',
        'Thu gom đặc biệt khi cần'
      ],
      status: 'ACTIVE' as const,
      isPopular: false,
      displayOrder: 3
    }
  ]

  // Insert packages
  for (const packageData of packages) {
    await prisma.package.upsert({
      where: { id: packageData.id },
      update: packageData,
      create: packageData
    })
    console.log(`✅ Created package: ${packageData.name}`)
  }

  console.log('📦 Package migration completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error migrating packages:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
