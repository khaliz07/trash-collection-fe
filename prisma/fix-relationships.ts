import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔗 Fixing subscription-package relationships...')

  // Get current subscription
  const subscription = await prisma.subscription.findFirst({
    where: { id: 'sub-1' }
  })

  if (!subscription) {
    console.log('❌ No subscription found')
    return
  }

  console.log('📋 Current subscription:', {
    id: subscription.id,
    planName: subscription.planName,
    price: subscription.price,
    packageId: subscription.packageId
  })

  // Determine which package this subscription should link to based on price and duration
  let targetPackageId = null
  const price = Number(subscription.price)
  const planName = subscription.planName.toLowerCase()

  if (price === 80000 && planName.includes('1 tháng')) {
    targetPackageId = 'pkg-monthly'
  } else if (price === 228000 && planName.includes('3 tháng')) {
    targetPackageId = 'pkg-quarterly'
  } else if (price === 864000 && planName.includes('1 năm')) {
    targetPackageId = 'pkg-annual'
  } else {
    // Default to monthly for existing subscriptions
    targetPackageId = 'pkg-monthly'
  }

  console.log(`🎯 Linking subscription to package: ${targetPackageId}`)

  // Update subscription with packageId
  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscription.id },
    data: { packageId: targetPackageId }
  })

  console.log('✅ Updated subscription:', {
    id: updatedSubscription.id,
    planName: updatedSubscription.planName,
    packageId: updatedSubscription.packageId
  })

  // Also update any existing payments to ensure consistency
  const payments = await prisma.payment.findMany({
    where: { subscriptionId: subscription.id }
  })

  console.log(`💳 Found ${payments.length} payments to update metadata`)

  for (const payment of payments) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        metadata: {
          ...payment.metadata as any,
          packageId: targetPackageId,
          planName: subscription.planName
        }
      }
    })
    console.log(`✅ Updated payment ${payment.id} metadata`)
  }

  // Verify the relationship
  const verifySubscription = await prisma.subscription.findFirst({
    where: { id: 'sub-1' },
    include: {
      package: true,
      payments: true
    }
  })

  console.log('🔍 Verification - Subscription with package:')
  console.log({
    subscription: {
      id: verifySubscription?.id,
      planName: verifySubscription?.planName,
      packageId: verifySubscription?.packageId
    },
    package: verifySubscription?.package ? {
      id: verifySubscription.package.id,
      name: verifySubscription.package.name,
      price: verifySubscription.package.price
    } : null,
    paymentsCount: verifySubscription?.payments?.length || 0
  })

  console.log('🎉 Subscription-package relationship fixed!')
}

main()
  .catch((e) => {
    console.error('❌ Error fixing relationships:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
