import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, userId, packageId, amount } = body

    if (!paymentId || !userId || !packageId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Simulate payment confirmation by calling the confirm API
    const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentId: paymentId,
        status: 'success', // or 'completed'
        transactionId: `txn_${Date.now()}`,
        userId: userId,
        packageId: packageId,
        amount: amount,
        paymentMethod: 'VNPAY'
      })
    })

    const confirmResult = await confirmResponse.json()

    if (confirmResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Payment test successful - database updated!',
        data: confirmResult
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Payment confirmation failed',
        error: confirmResult.message
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error testing payment:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
