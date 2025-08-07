import { NextRequest, NextResponse } from 'next/server'
import { getBaseURL } from '@/lib/network'
import { createPayment, getPayment } from '@/lib/payment-storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, description, packageId, userId, packageName, duration, method } = body

    // Generate payment ID
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store payment record using shared storage
    const payment = createPayment(paymentId, {
      amount,
      packageName,
      duration,
      method: method || 'unknown'
    })

    // Auto-expire after 5 minutes
    setTimeout(() => {
      const currentPayment = getPayment(paymentId)
      if (currentPayment && currentPayment.status === 'pending') {
        // Update to failed status if still pending
        import('@/lib/payment-storage').then(({ updatePaymentStatus }) => {
          updatePaymentStatus(paymentId, 'failed', { expiredAt: new Date().toISOString() })
        })
      }
    }, 5 * 60 * 1000)

    return NextResponse.json({
      success: true,
      paymentId,
      amount,
      description,
      packageName,
      duration,
      qrUrl: `${getBaseURL(3000)}/api/payments/confirm/${paymentId}`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    })

  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi tạo thanh toán' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('id')

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: 'Missing payment ID' },
        { status: 400 }
      )
    }

    const payment = getPayment(paymentId)
    
    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
      }
    })

  } catch (error) {
    console.error('Get payment error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    )
  }
}
