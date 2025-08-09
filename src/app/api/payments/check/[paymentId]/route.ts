import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Check if payment exists in database
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: paymentId
      },
      include: {
        package: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    if (!payment) {
      // Return pending status for unknown payments (they might be new QR scans)
      return NextResponse.json({
        success: true,
        payment: {
          id: paymentId,
          status: 'pending',
          message: 'Payment pending confirmation',
          createdAt: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        status: payment.status.toLowerCase(),
        amount: payment.amount,
        packageName: payment.package.name,
        packageDuration: payment.package.duration,
        coveredMonths: payment.coveredMonths,
        user: payment.user,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt
      }
    })

  } catch (error) {
    console.error('Error checking payment:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
