// Script to create test users and subscriptions for different user IDs
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('Creating test users and subscriptions...');

    // Create test users
    const users = [
      {
        id: 'user-1',
        email: 'an.nguyen@example.com',
        firstName: 'An',
        lastName: 'Nguyễn Văn',
        password: 'hashed_password_placeholder', // In real app, this would be hashed
        phone: '+84 912 345 678',
        address: '12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh',
        role: 'USER' as const,
      },
      {
        id: 'user-2',
        email: 'bich.tran@example.com',
        firstName: 'Bích',
        lastName: 'Trần Thị',
        password: 'hashed_password_placeholder',
        phone: '+84 913 456 789',
        address: '45 Lê Lợi, Quận Hải Châu, Đà Nẵng',
        role: 'USER' as const,
      },
      {
        id: 'user-3',
        email: 'dung.le@example.com',
        firstName: 'Dũng',
        lastName: 'Lê Quang',
        password: 'hashed_password_placeholder',
        phone: '+84 914 567 890',
        address: '78 Phan Đình Phùng, Ba Đình, Hà Nội',
        role: 'USER' as const,
      },
      {
        id: 'admin-1',
        email: 'admin@ecocollect.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'hashed_password_placeholder',
        phone: '+84 999 999 999',
        address: 'Công ty EcoCollect',
        role: 'ADMIN' as const,
      },
    ];

    // Create users with upsert (update if exists, create if not)
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
      console.log(`Created/updated user: ${user.firstName} ${user.lastName}`);
    }

    // Get available packages
    const packages = await prisma.package.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { price: 'asc' },
    });

    if (packages.length === 0) {
      console.log('No packages found. Creating default package...');
      
      const defaultPackage = await prisma.package.create({
        data: {
          name: 'Gói Cơ Bản',
          description: 'Thu gom rác 2 lần/tuần',
          type: 'monthly',
          duration: 1,
          price: 40000,
          collectionsPerWeek: 2,
          features: ['Thu gom rác sinh hoạt', 'Thu gom 2 lần/tuần', 'Hỗ trợ 24/7'],
          status: 'ACTIVE',
          isPopular: true,
          displayOrder: 1,
        },
      });
      packages.push(defaultPackage);
    }

    // Create subscriptions for each user
    const subscriptionData = [
      {
        customerId: 'user-1',
        packageId: packages[0].id,
        planName: packages[0].name,
        description: packages[0].description,
        price: packages[0].price,
        frequency: 'MONTHLY' as const,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-05-01'),
        nextBillingDate: new Date('2025-05-01'),
        status: 'ACTIVE' as const,
      },
      {
        customerId: 'user-2',
        packageId: packages[0].id,
        planName: packages[0].name,
        description: packages[0].description,
        price: packages[0].price,
        frequency: 'MONTHLY' as const,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-04-20'), // Expiring soon
        nextBillingDate: new Date('2025-04-20'),
        status: 'ACTIVE' as const,
      },
      {
        customerId: 'user-3',
        packageId: packages[0].id,
        planName: packages[0].name,
        description: packages[0].description,
        price: packages[0].price,
        frequency: 'MONTHLY' as const,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-03-15'), // Expired
        nextBillingDate: new Date('2025-03-15'),
        status: 'ACTIVE' as const, // Keep as active for demo
      },
    ];

    for (const sub of subscriptionData) {
      const existing = await prisma.subscription.findFirst({
        where: { 
          customerId: sub.customerId,
          status: 'ACTIVE' 
        },
      });

      if (!existing) {
        await prisma.subscription.create({
          data: sub,
        });
        console.log(`Created subscription for ${sub.customerId}`);
      } else {
        console.log(`Subscription already exists for ${sub.customerId}`);
      }
    }

    // Create some payment history for variety
    const payments = [
      {
        customerId: 'user-1',
        amount: 40000,
        currency: 'VND',
        status: 'COMPLETED' as const,
        paymentMethod: 'VNPAY' as const,
        transactionId: 'txn-user1-001',
        paidAt: new Date('2025-01-01'),
      },
      {
        customerId: 'user-2',
        amount: 40000,
        currency: 'VND',
        status: 'COMPLETED' as const,
        paymentMethod: 'E_WALLET' as const,
        transactionId: 'txn-user2-001',
        paidAt: new Date('2025-02-01'),
      },
      {
        customerId: 'user-3',
        amount: 40000,
        currency: 'VND',
        status: 'FAILED' as const,
        paymentMethod: 'BANK_TRANSFER' as const,
        transactionId: 'txn-user3-001',
        paidAt: new Date('2025-01-15'),
      },
    ];

    for (const payment of payments) {
      // Find subscription for this user
      const subscription = await prisma.subscription.findFirst({
        where: { customerId: payment.customerId },
      });

      if (subscription) {
        const existing = await prisma.payment.findFirst({
          where: { transactionId: payment.transactionId },
        });

        if (!existing) {
          await prisma.payment.create({
            data: {
              ...payment,
              subscriptionId: subscription.id,
            },
          });
          console.log(`Created payment for ${payment.customerId}`);
        }
      }
    }

    console.log('✅ Test data created successfully!');
    console.log('\nTest users:');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.id})`);
    });

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
