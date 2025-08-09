import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchema() {
  try {
    // Try to get first payment to see what fields are available
    const payment = await prisma.payment.findFirst({
      include: {
        user: true,
        package: true,
        subscription: true
      }
    });
    
    console.log('Payment fields:', Object.keys(payment || {}));
    console.log('Payment object:', payment);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
