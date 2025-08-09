import { NextRequest, NextResponse } from 'next/server'
import { getPayment, getAllPayments } from '@/lib/payment-storage'

// Mock payment history data
const paymentHistory = new Map<string, any[]>()

// Initialize with sample data
paymentHistory.set('user-1', [
  {
    id: 'PAY_1754562163547_u31n468bt',
    invoiceId: 'INV-2025-001',
    packageName: 'Gói cơ bản - Hàng tuần',
    duration: '1 tháng',
    amount: 80000,
    paidAt: '2025-08-07T10:30:00.000Z',
    method: 'QR Code',
    status: 'success',
    description: 'Gia hạn gói dịch vụ thu gom rác',
    paymentGateway: 'Internal',
    transactionId: 'TXN_1754562163547',
    downloadUrl: '/api/invoices/INV-2025-001/download'
  },
  {
    id: 'PAY_1754462163547_x21m368at',
    invoiceId: 'INV-2025-002',
    packageName: 'Gói cơ bản - Hàng tuần', 
    duration: '1 tháng',
    amount: 80000,
    paidAt: '2025-07-07T14:20:00.000Z',
    method: 'QR Code',
    status: 'success',
    description: 'Gia hạn gói dịch vụ thu gom rác',
    paymentGateway: 'Internal',
    transactionId: 'TXN_1754462163547',
    downloadUrl: '/api/invoices/INV-2025-002/download'
  },
  {
    id: 'PAY_1754362163547_y11k268bt',
    invoiceId: 'INV-2025-003',
    packageName: 'Gói nâng cao - Hàng ngày',
    duration: '1 tháng',
    amount: 200000,
    paidAt: '2025-06-15T09:15:00.000Z',
    method: 'QR Code',
    status: 'success',
    description: 'Nâng cấp gói dịch vụ',
    paymentGateway: 'Internal',
    transactionId: 'TXN_1754362163547',
    downloadUrl: '/api/invoices/INV-2025-003/download'
  },
  {
    id: 'PAY_1754262163547_z01j168ct',
    invoiceId: 'INV-2025-004',
    packageName: 'Gói cơ bản - Hàng tuần',
    duration: '1 tháng',
    amount: 80000,
    paidAt: '2025-05-20T16:45:00.000Z',
    method: 'QR Code',
    status: 'failed',
    description: 'Gia hạn gói dịch vụ thu gom rác',
    paymentGateway: 'Internal',
    transactionId: 'TXN_1754262163547',
    failureReason: 'Timeout kết nối'
  },
  {
    id: 'PAY_1754162163547_w91i068dt',
    invoiceId: 'INV-2025-005',
    packageName: 'Gói cơ bản - Hàng tuần',
    duration: '1 tháng',
    amount: 80000,
    paidAt: '2025-04-25T11:30:00.000Z',
    method: 'QR Code',
    status: 'success',
    description: 'Gia hạn gói dịch vụ thu gom rác',
    paymentGateway: 'Internal',
    transactionId: 'TXN_1754162163547',
    downloadUrl: '/api/invoices/INV-2025-005/download'
  }
])

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'user-1'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') // success, failed, pending
    const method = searchParams.get('method') // QR Code, VNPay, Momo, etc.
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    let payments = paymentHistory.get(userId) || []
    
    // Add real-time payments from payment storage
    const realtimePayments = getAllPayments()
      .filter(p => p.status === 'success')
      .map(p => ({
        id: p.id,
        invoiceId: `INV-${Date.now()}`,
        packageName: p.packageName || 'Gia hạn dịch vụ',
        duration: p.duration || '1 tháng',
        amount: p.amount || 80000,
        paidAt: p.confirmedAt || p.updatedAt || p.createdAt,
        method: 'QR Code',
        status: 'success',
        description: 'Thanh toán qua QR Code',
        paymentGateway: 'Internal',
        transactionId: p.id,
        downloadUrl: `/api/invoices/${p.id}/download`
      }))

    // Merge and deduplicate
    const allPayments = [
      ...realtimePayments,
      ...payments.filter(p => !realtimePayments.some(rp => rp.id === p.id))
    ]

    // Apply filters
    let filteredPayments = allPayments

    if (status) {
      filteredPayments = filteredPayments.filter(p => p.status === status)
    }

    if (method) {
      filteredPayments = filteredPayments.filter(p => 
        p.method.toLowerCase().includes(method.toLowerCase())
      )
    }

    if (fromDate) {
      const from = new Date(fromDate)
      filteredPayments = filteredPayments.filter(p => 
        new Date(p.paidAt) >= from
      )
    }

    if (toDate) {
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999) // End of day
      filteredPayments = filteredPayments.filter(p => 
        new Date(p.paidAt) <= to
      )
    }

    // Sort by date (newest first)
    filteredPayments.sort((a, b) => 
      new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
    )

    // Pagination
    const total = filteredPayments.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex)

    // Calculate statistics
    const stats = {
      total: allPayments.length,
      successful: allPayments.filter(p => p.status === 'success').length,
      failed: allPayments.filter(p => p.status === 'failed').length,
      pending: allPayments.filter(p => p.status === 'pending').length,
      totalAmount: allPayments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + p.amount, 0),
      thisMonth: allPayments.filter(p => {
        const paymentDate = new Date(p.paidAt)
        const now = new Date()
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear()
      }).length
    }

    return NextResponse.json({
      success: true,
      payments: paginatedPayments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      statistics: stats,
      filters: {
        status,
        method,
        fromDate,
        toDate
      }
    })

  } catch (error) {
    console.error('Error fetching payment history:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = 'user-1', paymentData } = body

    const userPayments = paymentHistory.get(userId) || []
    
    const newPayment = {
      id: paymentData.id || `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      invoiceId: `INV-${Date.now()}`,
      ...paymentData,
      createdAt: new Date().toISOString()
    }

    userPayments.unshift(newPayment) // Add to beginning
    paymentHistory.set(userId, userPayments)

    return NextResponse.json({
      success: true,
      message: 'Payment added to history',
      payment: newPayment
    })

  } catch (error) {
    console.error('Error adding payment to history:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
