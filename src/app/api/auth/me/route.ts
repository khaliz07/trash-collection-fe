import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-make-it-long-and-random-123456789'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token không hợp lệ' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Người dùng không tồn tại' },
        { status: 404 }
      )
    }

    // Format response to match frontend expectations
    const formattedUser = {
      ...user,
      name: `${user.firstName} ${user.lastName}`.trim(),
    }

    return NextResponse.json({ user: formattedUser })
  } catch (error) {
    console.error('Get me error:', error)
    return NextResponse.json(
      { message: 'Token không hợp lệ' },
      { status: 401 }
    )
  }
}
