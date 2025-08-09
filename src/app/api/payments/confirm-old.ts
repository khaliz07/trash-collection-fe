import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Check if payment already exists using raw query
    const existingPayment = await prisma.$queryRaw`
      SELECT * FROM payments WHERE "transactionId" = ${paymentId}::text LIMIT 1
    ` as any[]

    if (status === 'success' || status === 'completed') {
      if (existingPayment.length === 0) {
        // Get user and package info
        const user = await prisma.$queryRaw`
          SELECT * FROM users WHERE id = ${userId}::text LIMIT 1
        ` as any[]

        const packageInfo = await prisma.$queryRaw`
          SELECT * FROM packages WHERE id = ${packageId}::text LIMIT 1
        ` as any[]

        if (user.length === 0 || packageInfo.length === 0) {
          return NextResponse.json(
            { success: false, message: 'User or package not found' },
            { status: 404 }
          )
        }

        const pkg = packageInfo[0]

        // Find active subscription for this user+package
        const activeSubscriptions = await prisma.$queryRaw`
          SELECT * FROM subscriptions 
          WHERE "userId" = ${userId}::text AND status = 'ACTIVE'
          ORDER BY "queuePosition" ASC
        ` as any[]

        let subscriptionId: string

        // Check if subscription exists for this package
        const existingSubscription = await prisma.$queryRaw`
          SELECT * FROM subscriptions 
          WHERE "userId" = ${userId}::text AND "packageId" = ${packageId}::text AND status = 'ACTIVE'
          LIMIT 1
        ` as any[]

        if (existingSubscription.length > 0) {
          subscriptionId = existingSubscription[0].id
        } else {
          // Create new subscription in queue
          const nextQueuePosition = activeSubscriptions.length
          const subscriptionIdNew = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          const startMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
          const endMonth = calculateEndMonth(new Date(), pkg.duration)
          
          await prisma.$queryRaw`
            INSERT INTO subscriptions (
              id, "userId", "packageId", "queuePosition", status, "startMonth", "endMonth", "activatedAt", "createdAt", "updatedAt"
            ) VALUES (
              ${subscriptionIdNew}::text, ${userId}::text, ${packageId}::text, ${nextQueuePosition}::int, 'ACTIVE', 
              ${startMonth}::text, ${endMonth}::text, 
              ${nextQueuePosition === 0 ? new Date() : null}, 
              ${new Date()}, ${new Date()}
            )
          `
          
          subscriptionId = subscriptionIdNew
        }

        // Calculate covered months based on package duration
        const coveredMonths = calculateCoveredMonths(pkg.duration)
        const paymentIdNew = `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Create payment record using raw query
        await prisma.$queryRaw`
          INSERT INTO payments (
            id, "userId", "packageId", "subscriptionId", amount, currency, status, 
            "paymentMethod", "coveredMonths", "transactionId", "externalId", "paidAt", "createdAt", "updatedAt"
          ) VALUES (
            ${paymentIdNew}::text, ${userId}::text, ${packageId}::text, ${subscriptionId}::text, 
            ${amount || pkg.price}::numeric, 'VND', 'COMPLETED', ${paymentMethod}::"PaymentMethod", 
            ${JSON.stringify(coveredMonths)}::jsonb, ${paymentId}::text, ${transactionId}::text, 
            ${new Date()}, ${new Date()}, ${new Date()}
          )
        `

        console.log('✅ Payment confirmed and saved to database:', paymentIdNew)

        return NextResponse.json({ 
          success: true, 
          message: 'Payment status updated successfully',
          payment: {
            id: paymentIdNew,
            status: 'COMPLETED',
            amount: amount || pkg.price,
            coveredMonths: coveredMonths
          }
        })

      } else {
        // Update existing payment
        await prisma.$queryRaw`
          UPDATE payments 
          SET status = 'COMPLETED', "paidAt" = ${new Date()}, "externalId" = ${transactionId}::text, "updatedAt" = ${new Date()}
          WHERE "transactionId" = ${paymentId}::text
        `

        console.log('✅ Payment updated:', existingPayment[0].id)

        return NextResponse.json({ 
          success: true, 
          message: 'Payment status updated successfully',
          payment: {
            id: existingPayment[0].id,
            status: 'COMPLETED',
            amount: existingPayment[0].amount,
            coveredMonths: existingPayment[0].coveredMonths
          }
        })
      }
    } else if (status === 'failed') {
      if (existingPayment.length > 0) {
        // Update payment to failed status
        await prisma.$queryRaw`
          UPDATE payments 
          SET status = 'FAILED', "failureReason" = 'Payment gateway failure', "updatedAt" = ${new Date()}
          WHERE "transactionId" = ${paymentId}
        `

        return NextResponse.json({ 
          success: true, 
          message: 'Payment marked as failed',
          payment: {
            id: existingPayment[0].id,
            status: 'FAILED',
            amount: existingPayment[0].amount
          }
        })
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: 'No action taken'
    })

  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateEndMonth(startDate: Date, durationMonths: number): string {
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + durationMonths - 1)
  return endDate.toISOString().substring(0, 7) // YYYY-MM
}

function calculateCoveredMonths(durationMonths: number): string[] {
  const months = []
  const currentDate = new Date()
  
  for (let i = 0; i < durationMonths; i++) {
    const monthDate = new Date(currentDate)
    monthDate.setMonth(currentDate.getMonth() + i)
    months.push(monthDate.toISOString().substring(0, 7)) // YYYY-MM
  }
  
  return months
}
