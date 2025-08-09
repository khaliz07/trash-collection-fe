import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSubscriptionData() {
  try {
    console.log('=== FIXING SUBSCRIPTION DATA ===');
    
    // Get all available packages
    const packages = await prisma.package.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { displayOrder: 'asc' }
    });

    console.log('Available packages:', packages.map(p => ({ id: p.id, name: p.name })));

    // Get users that need fixing
    const usersToFix = ['user-1', 'user-2'];
    
    for (const userId of usersToFix) {
      console.log(`\n--- Fixing user: ${userId} ---`);
      
      // Get current subscriptions
      const currentSubs = await prisma.subscription.findMany({
        where: { customerId: userId },
        include: { package: true },
        orderBy: { createdAt: 'asc' }
      });
      
      console.log('Current subscriptions:', currentSubs.map(s => ({ 
        id: s.id, 
        packageId: s.packageId,
        packageName: s.package?.name 
      })));

      // Update some subscriptions to use different packages
      if (currentSubs.length >= 3) {
        // Update first subscription to monthly package
        await prisma.subscription.update({
          where: { id: currentSubs[0].id },
          data: { 
            packageId: packages[0].id,
            planName: packages[0].name
          }
        });
        
        // Update second subscription to quarterly package  
        await prisma.subscription.update({
          where: { id: currentSubs[1].id },
          data: { 
            packageId: packages[1].id,
            planName: packages[1].name
          }
        });
        
        // Update third subscription to annual package
        await prisma.subscription.update({
          where: { id: currentSubs[2].id },
          data: { 
            packageId: packages[2].id,
            planName: packages[2].name
          }
        });

        console.log('Updated first 3 subscriptions to use different packages');
      }
    }

    console.log('\n=== VERIFICATION ===');
    
    // Verify the changes
    for (const userId of usersToFix) {
      const updatedSubs = await prisma.subscription.findMany({
        where: { customerId: userId },
        include: { package: true },
        orderBy: { createdAt: 'asc' }
      });
      
      console.log(`\n${userId} subscriptions after update:`);
      updatedSubs.forEach(sub => {
        console.log(`  ${sub.id}: ${sub.planName} (${sub.packageId})`);
      });
    }

    console.log('\n=== FIX COMPLETED ===');

  } catch (error) {
    console.error('Fix subscriptions error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSubscriptionData();
