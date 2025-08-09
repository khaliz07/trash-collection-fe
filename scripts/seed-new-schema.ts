import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with new schema...');

  // 1. Create Packages with new structure
  console.log('📦 Creating packages...');
  
  const packages = await Promise.all([
    prisma.package.create({
      data: {
        id: 'pkg-monthly',
        name: 'Gói cơ bản - 1 tháng',
        description: 'Thu gom rác 2 lần/tuần (Thứ 3 và Thứ 6)',
        type: 'monthly',
        duration: 1,
        price: 80000,
        monthlyEquivalent: 80000,
        collectionsPerWeek: 2,
        features: [
          'Thu gom rác sinh hoạt',
          'Thu gom 2 lần/tuần',
          'Hỗ trợ 24/7',
          'Thông báo lịch thu gom'
        ],
        tier: 1,
        status: 'ACTIVE',
        isPopular: true,
        displayOrder: 1
      }
    }),
    
    prisma.package.create({
      data: {
        id: 'pkg-quarterly',
        name: 'Gói tiết kiệm - 3 tháng',
        description: 'Thu gom rác 2 lần/tuần với ưu đãi 3 tháng',
        type: 'quarterly',
        duration: 3,
        price: 228000, // 80000 * 3 - 5% discount
        monthlyEquivalent: 76000,
        collectionsPerWeek: 2,
        features: [
          'Thu gom rác sinh hoạt',
          'Thu gom 2 lần/tuần',
          'Hỗ trợ 24/7',
          'Thông báo lịch thu gom',
          'Tiết kiệm 5% so với thanh toán hàng tháng',
          'Ưu tiên hỗ trợ'
        ],
        tier: 2,
        status: 'ACTIVE',
        isPopular: false,
        displayOrder: 2
      }
    }),
    
    prisma.package.create({
      data: {
        id: 'pkg-annual',
        name: 'Gói premium - 1 năm',
        description: 'Thu gom rác 2 lần/tuần với ưu đãi cả năm + tặng 1 tháng',
        type: 'annual',
        duration: 12,
        price: 864000, // 80000 * 12 - 10% discount
        monthlyEquivalent: 72000,
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
        tier: 3,
        status: 'ACTIVE',
        isPopular: false,
        displayOrder: 3
      }
    })
  ]);

  console.log(`✅ Created ${packages.length} packages`);

  // 2. Create Users with debt tracking
  console.log('👥 Creating users...');
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user-1',
        email: 'user1@example.com',
        password: 'hashedpassword1',
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        phone: '+84901234567',
        role: 'USER',
        status: 'ACTIVE',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        totalDebt: 0,
        debtMonths: []
      }
    }),
    
    prisma.user.create({
      data: {
        id: 'user-2',
        email: 'user2@example.com',
        password: 'hashedpassword2',
        firstName: 'Trần',
        lastName: 'Thị B',
        phone: '+84901234568',
        role: 'USER',
        status: 'ACTIVE',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
        totalDebt: 0,
        debtMonths: []
      }
    }),
    
    prisma.user.create({
      data: {
        id: 'admin-1',
        email: 'admin@example.com',
        password: 'hashedpassword',
        firstName: 'Admin',
        lastName: 'System',
        phone: '+84901234569',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  // 3. Create Subscriptions with new queue system
  console.log('🎫 Creating subscriptions...');
  
  const subscriptions = await Promise.all([
    // User-1: Active quarterly subscription
    prisma.subscription.create({
      data: {
        id: 'sub-1-current',
        userId: 'user-1',
        packageId: 'pkg-quarterly',
        startMonth: '2025-08',
        endMonth: '2025-10',
        queuePosition: 0, // Currently active
        status: 'ACTIVE',
        activatedAt: new Date('2025-08-01')
      }
    }),
    
    // User-1: Queued annual subscription (will activate after quarterly ends)
    prisma.subscription.create({
      data: {
        id: 'sub-1-queue',
        userId: 'user-1',
        packageId: 'pkg-annual',
        startMonth: '2025-11',
        endMonth: '2026-10',
        queuePosition: 1, // Next in queue
        status: 'PENDING'
      }
    }),
    
    // User-2: Active monthly subscription
    prisma.subscription.create({
      data: {
        id: 'sub-2-current',
        userId: 'user-2',
        packageId: 'pkg-monthly',
        startMonth: '2025-08',
        endMonth: '2025-08',
        queuePosition: 0, // Currently active
        status: 'ACTIVE',
        activatedAt: new Date('2025-08-01')
      }
    })
  ]);

  console.log(`✅ Created ${subscriptions.length} subscriptions`);

  // 4. Create Payments with new structure
  console.log('💰 Creating payments...');
  
  const payments = await Promise.all([
    // User-1 payments for quarterly package
    prisma.payment.create({
      data: {
        id: 'pay-1-q1',
        userId: 'user-1',
        packageId: 'pkg-quarterly',
        subscriptionId: 'sub-1-current',
        amount: 228000,
        status: 'COMPLETED',
        paymentMethod: 'E_WALLET',
        coveredMonths: ['2025-08', '2025-09', '2025-10'],
        transactionId: 'txn-1-quarterly',
        paidAt: new Date('2025-08-01T10:00:00.000Z')
      }
    }),
    
    // User-1 payment for annual package (queue)
    prisma.payment.create({
      data: {
        id: 'pay-1-annual',
        userId: 'user-1',
        packageId: 'pkg-annual',
        subscriptionId: 'sub-1-queue',
        amount: 864000,
        status: 'COMPLETED',
        paymentMethod: 'BANK_TRANSFER',
        coveredMonths: [
          '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04',
          '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'
        ],
        transactionId: 'txn-1-annual',
        paidAt: new Date('2025-08-05T14:30:00.000Z')
      }
    }),
    
    // User-2 payments for monthly packages (multiple months)
    prisma.payment.create({
      data: {
        id: 'pay-2-m1',
        userId: 'user-2',
        packageId: 'pkg-monthly',
        subscriptionId: 'sub-2-current',
        amount: 80000,
        status: 'COMPLETED',
        paymentMethod: 'VNPAY',
        coveredMonths: ['2025-08'],
        transactionId: 'txn-2-m1',
        paidAt: new Date('2025-08-01T09:15:00.000Z')
      }
    }),
    
    prisma.payment.create({
      data: {
        id: 'pay-2-m2',
        userId: 'user-2',
        packageId: 'pkg-monthly',
        subscriptionId: 'sub-2-current',
        amount: 80000,
        status: 'COMPLETED',
        paymentMethod: 'E_WALLET',
        coveredMonths: ['2025-07'],
        transactionId: 'txn-2-m2',
        paidAt: new Date('2025-07-01T11:20:00.000Z')
      }
    })
  ]);

  console.log(`✅ Created ${payments.length} payments`);

  // 5. Create some debt records for demonstration
  console.log('💳 Creating debt records...');
  
  const debtRecords = await Promise.all([
    // User-2 has debt for June 2025 (before they started paying)
    prisma.debtRecord.create({
      data: {
        id: 'debt-user2-jun',
        userId: 'user-2',
        month: '2025-06',
        amount: 80000,
        dueDate: new Date('2025-07-01'),
        status: 'UNPAID'
      }
    })
  ]);

  console.log(`✅ Created ${debtRecords.length} debt records`);

  console.log('🎉 Database seeded successfully!');
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`- Packages: ${packages.length}`);
  console.log(`- Users: ${users.length}`);
  console.log(`- Subscriptions: ${subscriptions.length}`);
  console.log(`- Payments: ${payments.length}`);
  console.log(`- Debt Records: ${debtRecords.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
