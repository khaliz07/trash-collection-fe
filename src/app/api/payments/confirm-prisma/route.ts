import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to calculate end month
function calculateEndMonth(startDate: Date, duration: number): string {
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + duration)
  return endDate.toISOString().substring(0, 7) // YYYY-MM
}

// Helper function to calculate covered months
function calculateCoveredMonths(duration: number): string[] {
  const now = new Date()
  const months: string[] = []
  
  for (let i = 0; i < duration; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() + i, 1)
    months.push(month.toISOString().substring(0, 7)) // YYYY-MM format
  }
  
  return months
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      paymentId, 
      status, 
      transactionId, 
      userId,
      packageId,
      amount,
      paymentMethod = 'VNPAY'
    } = body

    if (!paymentId || !status || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if payment already exists using Prisma
    const existingPayment = await prisma.payment.findFirst({
      where: {
        transactionId: paymentId
      }
    })

    if (status === 'success' || status === 'completed') {
      if (!existingPayment) {
        // Get user and package info using Prisma
        const user = await prisma.user.findUnique({
          where: { id: userId }
        })

        const packageInfo = await prisma.package.findUnique({
          where: { id: packageId }
        })

        if (!user || !packageInfo) {
          return NextResponse.json(
            { success: false, message: 'User or package not found' },
            { status: 404 }
          )
        }

        // Find active subscriptions for this user
        const activeSubscriptions = await prisma.subscription.findMany({
          where: {
            userId: userId,
            status: 'ACTIVE'
          },
          orderBy: {
            queuePosition: 'asc'
          }
        })

        let subscription

        // Check if subscription exists for this package
        const existingSubscription = await prisma.subscription.findFirst({
          where: {
            userId: userId,
            packageId: packageId,
            status: 'ACTIVE'
          }
        })

        if (existingSubscription) {
          subscription = existingSubscription
        } else {
          // Create new subscription in queue
          const nextQueuePosition = activeSubscriptions.length
          const startMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
          const endMonth = calculateEndMonth(new Date(), packageInfo.duration)
          
          subscription = await prisma.subscription.create({
            data: {
              userId: userId,
              packageId: packageId,
              queuePosition: nextQueuePosition,
              status: 'ACTIVE',
              startMonth: startMonth,
              endMonth: endMonth,
              activatedAt: nextQueuePosition === 0 ? new Date() : null
            }
          })
        }

        // Calculate covered months based on package duration
        const coveredMonths = calculateCoveredMonths(packageInfo.duration)

        // Create payment record using Prisma
        const payment = await prisma.payment.create({
          data: {
            userId: userId,
            packageId: packageId,
            subscriptionId: subscription.id,
            amount: amount || packageInfo.price,
            currency: 'VND',
            status: 'COMPLETED',
            paymentMethod: paymentMethod as any,
            coveredMonths: coveredMonths,
            transactionId: paymentId,
            externalId: transactionId,
            paidAt: new Date()
          }
        })

        console.log('✅ Payment confirmed and saved to database:', payment.id)

        return NextResponse.json({ 
          success: true, 
          message: 'Payment status updated successfully',
          payment: {
            id: payment.id,
            status: 'COMPLETED',
            amount: payment.amount,
            coveredMonths: payment.coveredMonths
          }
        })

      } else {
        // Update existing payment using Prisma
        const updatedPayment = await prisma.payment.update({
          where: {
            id: existingPayment.id
          },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            externalId: transactionId
          }
        })

        console.log('✅ Payment updated:', updatedPayment.id)

        return NextResponse.json({ 
          success: true, 
          message: 'Payment status updated successfully',
          payment: {
            id: updatedPayment.id,
            status: 'COMPLETED',
            amount: updatedPayment.amount,
            coveredMonths: updatedPayment.coveredMonths
          }
        })
      }
    } else {
      // Failed payment - mark as failed if exists
      if (existingPayment) {
        await prisma.payment.update({
          where: {
            id: existingPayment.id
          },
          data: {
            status: 'FAILED'
          }
        })
      }

      return NextResponse.json(
        { success: false, message: `Payment ${status}` },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
