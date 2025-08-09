import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSubscriptionData() {
  try {
    console.log('=== CHECKING SUBSCRIPTION DATA ===');
    
    const usersToCheck = ['user-1', 'user-2'];
    
    for (const userId of usersToCheck) {
      console.log(`\n--- User: ${userId} ---`);
      
      // Get all subscriptions for this user
      const subscriptions = await prisma.subscription.findMany({
        where: { customerId: userId },
        include: { package: true },
        orderBy: { createdAt: 'asc' }
      });
      
      console.log(`Total subscriptions: ${subscriptions.length}`);
      
      subscriptions.forEach((sub, index) => {
        console.log(`  ${index + 1}. ${sub.id}: ${sub.planName} (${sub.packageId})`);
      });

      // Get payments for this user
      const payments = await prisma.payment.findMany({
        where: { 
          customerId: userId,
          subscriptionId: { not: null },
          status: 'COMPLETED'
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`Total payments: ${payments.length}`);
      
      payments.forEach((payment, index) => {
        console.log(`  Payment ${index + 1}. ${payment.id}: subscriptionId: ${payment.subscriptionId}`);
      });
    }

  } catch (error) {
    console.error('Check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscriptionData();
