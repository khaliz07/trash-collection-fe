import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      paymentId, 
      userId,
      packageId,
      amount,
      paymentMethod = 'VNPAY'
    } = body

    if (!paymentId || !userId || !packageId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if payment already exists
    const existingPayment = await prisma.$queryRaw`
      SELECT * FROM payments WHERE "transactionId" = ${paymentId}::text LIMIT 1
    ` as any[]

    if (existingPayment.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Payment already exists',
        payment: {
          id: existingPayment[0].id,
          transactionId: existingPayment[0].transactionId,
          status: existingPayment[0].status,
          amount: existingPayment[0].amount
        }
      })
    }

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
    const userData = user[0]

    // Create subscription if needed
    const activeSubscriptions = await prisma.$queryRaw`
      SELECT * FROM subscriptions 
      WHERE "userId" = ${userId}::text AND status = 'ACTIVE'
      ORDER BY "queuePosition" ASC
    ` as any[]

    let subscriptionId: string

    const existingSubscription = await prisma.$queryRaw`
      SELECT * FROM subscriptions 
      WHERE "userId" = ${userId}::text AND "packageId" = ${packageId}::text AND status = 'ACTIVE'
      LIMIT 1
    ` as any[]

    if (existingSubscription.length > 0) {
      subscriptionId = existingSubscription[0].id
    } else {
      // Create new subscription
      const nextQueuePosition = activeSubscriptions.length
      subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const startMonth = new Date().toISOString().substring(0, 7)
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + pkg.duration)
      const endMonth = endDate.toISOString().substring(0, 7)
      
      await prisma.$queryRaw`
        INSERT INTO subscriptions (
          id, "userId", "packageId", "queuePosition", status, "startMonth", "endMonth", 
          "activatedAt", "createdAt", "updatedAt"
        ) VALUES (
          ${subscriptionId}::text, ${userId}::text, ${packageId}::text, ${nextQueuePosition}::int, 
          'ACTIVE', ${startMonth}::text, ${endMonth}::text, 
          ${nextQueuePosition === 0 ? new Date() : null}, ${new Date()}, ${new Date()}
        )
      `
    }

    // Calculate covered months
    const now = new Date()
    const coveredMonths: string[] = []
    for (let i = 0; i < pkg.duration; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() + i, 1)
      coveredMonths.push(month.toISOString().substring(0, 7))
    }

    // Create PENDING payment record
    const paymentIdNew = `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    await prisma.$queryRaw`
      INSERT INTO payments (
        id, "userId", "packageId", "subscriptionId", amount, currency, status, 
        "paymentMethod", "coveredMonths", "transactionId", "createdAt", "updatedAt"
      ) VALUES (
        ${paymentIdNew}::text, ${userId}::text, ${packageId}::text, ${subscriptionId}::text, 
        ${amount || pkg.price}::numeric, 'VND', 'PENDING', ${paymentMethod}::"PaymentMethod", 
        ${coveredMonths}::text[], ${paymentId}::text, ${new Date()}, ${new Date()}
      )
    `

    console.log('✅ Payment initiated:', paymentIdNew)

    return NextResponse.json({
      success: true,
      message: 'Payment initiated successfully',
      payment: {
        id: paymentIdNew,
        transactionId: paymentId,
        status: 'PENDING',
        amount: amount || pkg.price,
        packageName: pkg.name,
        coveredMonths: coveredMonths,
        user: {
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email
        }
      }
    })

  } catch (error) {
    console.error('Error initiating payment:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
