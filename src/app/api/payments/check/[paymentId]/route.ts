import { NextRequest, NextResponse } from 'next/server'
import { getPayment, updatePaymentStatus } from '@/lib/payment-storage'

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

    // Check if payment exists in storage
    const payment = getPayment(paymentId)
    
    if (!payment) {
      // Return pending status for unknown payments (they might be new)
      return NextResponse.json({
        success: true,
        payment: {
          id: paymentId,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({
      success: true,
      payment: payment
    })

  } catch (error) {
    console.error('Error checking payment:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
