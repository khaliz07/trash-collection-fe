import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdditionalSubscriptions() {
  try {
    console.log('=== CREATING ADDITIONAL SUBSCRIPTIONS ===');
    
    // Get all available packages
    const packages = await prisma.package.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { displayOrder: 'asc' }
    });

    console.log('Available packages:');
    packages.forEach(p => console.log(`  ${p.id}: ${p.name}`));

    // Create additional subscriptions for user-1
    console.log('\n--- Creating subscriptions for user-1 ---');
    
    // Create monthly subscription for user-1
    const user1Monthly = await prisma.subscription.create({
      data: {
        id: 'sub-1-monthly',
        customerId: 'user-1',
        packageId: packages[0].id, // pkg-monthly
        planName: packages[0].name,
        description: packages[0].description,
        frequency: 'MONTHLY',
        price: packages[0].price,
        status: 'ACTIVE',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-02-01'),
        nextBillingDate: new Date('2025-02-01')
      }
    });
    console.log(`Created monthly subscription: ${user1Monthly.id}`);

    // Create annual subscription for user-1  
    const user1Annual = await prisma.subscription.create({
      data: {
        id: 'sub-1-annual',
        customerId: 'user-1',
        packageId: packages[2].id, // pkg-annual
        planName: packages[2].name,
        description: packages[2].description,
        frequency: 'YEARLY',
        price: packages[2].price,
        status: 'ACTIVE',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-01-01'),
        nextBillingDate: new Date('2026-01-01')
      }
    });
    console.log(`Created annual subscription: ${user1Annual.id}`);

    // Create additional subscriptions for user-2
    console.log('\n--- Creating subscriptions for user-2 ---');
    
    // Create quarterly subscription for user-2
    const user2Quarterly = await prisma.subscription.create({
      data: {
        id: 'sub-2-quarterly',
        customerId: 'user-2',
        packageId: packages[1].id, // pkg-quarterly
        planName: packages[1].name,
        description: packages[1].description,
        frequency: 'QUARTERLY',
        price: packages[1].price,
        status: 'ACTIVE',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-04-01'),
        nextBillingDate: new Date('2025-04-01')
      }
    });
    console.log(`Created quarterly subscription: ${user2Quarterly.id}`);

    // Create annual subscription for user-2
    const user2Annual = await prisma.subscription.create({
      data: {
        id: 'sub-2-annual',
        customerId: 'user-2',
        packageId: packages[2].id, // pkg-annual
        planName: packages[2].name,
        description: packages[2].description,
        frequency: 'ANNUAL',
        price: packages[2].price,
        status: 'ACTIVE',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-01-01'),
        nextBillingDate: new Date('2026-01-01')
      }
    });
    console.log(`Created annual subscription: ${user2Annual.id}`);

    // Now update some existing payments to reference new subscriptions
    console.log('\n--- Updating payments to reference new subscriptions ---');

    // Update some user-1 payments to reference different subscriptions
    const user1Payments = await prisma.payment.findMany({
      where: { customerId: 'user-1', subscriptionId: 'sub-1' },
      orderBy: { createdAt: 'desc' },
      take: 7
    });

    if (user1Payments.length >= 3) {
      // Update newest payment to monthly subscription
      await prisma.payment.update({
        where: { id: user1Payments[0].id },
        data: { subscriptionId: user1Monthly.id }
      });
      console.log(`Updated payment ${user1Payments[0].id} to monthly subscription`);

      // Update second payment to annual subscription
      await prisma.payment.update({
        where: { id: user1Payments[1].id },
        data: { subscriptionId: user1Annual.id }
      });
      console.log(`Updated payment ${user1Payments[1].id} to annual subscription`);
    }

    // Update some user-2 payments to reference different subscriptions
    const user2Payments = await prisma.payment.findMany({
      where: { customerId: 'user-2' },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    if (user2Payments.length >= 2) {
      // Update newest payment to quarterly subscription
      await prisma.payment.update({
        where: { id: user2Payments[0].id },
        data: { subscriptionId: user2Quarterly.id }
      });
      console.log(`Updated payment ${user2Payments[0].id} to quarterly subscription`);

      // Update second payment to annual subscription  
      await prisma.payment.update({
        where: { id: user2Payments[1].id },
        data: { subscriptionId: user2Annual.id }
      });
      console.log(`Updated payment ${user2Payments[1].id} to annual subscription`);
    }

    console.log('\n=== CREATION COMPLETED ===');

  } catch (error) {
    console.error('Create subscriptions error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdditionalSubscriptions();
