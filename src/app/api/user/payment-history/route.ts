import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get user ID from X-User-ID header (set by fetchWithUser or similar)
    const userIdHeader = request.headers.get('X-User-ID')
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')
    
    const userId = userIdHeader || userIdParam
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get payment history from database
    const payments = await prisma.payment.findMany({
      where: {
        userId: userId
      },
      include: {
        package: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to match expected format
    const paymentHistory = payments.map((payment: any) => ({
      id: payment.id,
      invoiceId: `INV-${payment.createdAt.getFullYear()}-${payment.id.slice(-3)}`,
      packageName: payment.package.name,
      duration: payment.package.duration,
      amount: payment.amount,
      paidAt: payment.updatedAt.toISOString(),
      method: 'QR Code',
      status: payment.status,
      description: `Thanh toán gói ${payment.package.name}`,
      paymentGateway: 'Internal',
      transactionId: `TXN_${payment.id}`,
      downloadUrl: `/api/invoices/INV-${payment.createdAt.getFullYear()}-${payment.id.slice(-3)}/download`
    }))

    return NextResponse.json({
      success: true,
      payments: paymentHistory
    })

  } catch (error) {
    console.error('Error fetching payment history:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
