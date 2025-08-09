import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-make-it-long-and-random-123456789'

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // TODO: Re-enable authentication later
    /*
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token không hợp lệ' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Không có quyền truy cập' },
        { status: 403 }
      )
    }
    */

    // Get collectors with pagination
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10')
    const search = request.nextUrl.searchParams.get('search') || ''
    const status = request.nextUrl.searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      role: 'COLLECTOR'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
        { cccd: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    // Get collectors and total count
    const [collectors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          status: true,
          role: true,
          avatar: true,
          address: true,
          licensePlate: true,
          // startDate: true,
          // rating: true,
          // reviewCount: true,
          // cccd: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    // Format response
    const formattedCollectors = collectors.map(collector => ({
      ...collector,
      startDate: '', // TODO: Add after schema sync
      rating: 0,
      reviewCount: 0,
      cccd: '',
      createdAt: collector.createdAt.toISOString(),
      updatedAt: collector.updatedAt.toISOString(),
      lastLoginAt: collector.lastLoginAt?.toISOString() || null,
    }))

    return NextResponse.json({
      collectors: formattedCollectors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })

  } catch (error) {
    console.error('Get collectors error:', error)
    return NextResponse.json(
      { message: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// POST endpoint for creating new collectors
export async function POST(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // TODO: Re-enable authentication later
    /*
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token không hợp lệ' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Không có quyền truy cập' },
        { status: 403 }
      )
    }
    */

    const body = await request.json()
    const {
      email,
      password,
      name,
      phone,
      address,
      licensePlate,
      cccd,
      startDate
    } = body

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email đã tồn tại' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create collector
    const collector = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        address,
        licensePlate,
        role: 'COLLECTOR',
        status: 'ACTIVE',
        // cccd,
        // startDate: startDate ? new Date(startDate) : null,
        // rating: 0,
        // reviewCount: 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        role: true,
        avatar: true,
        address: true,
        licensePlate: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Format response
    const formattedCollector = {
      ...collector,
      startDate: startDate || '',
      rating: 0,
      reviewCount: 0,
      cccd: cccd || '',
      createdAt: collector.createdAt.toISOString(),
      updatedAt: collector.updatedAt.toISOString(),
      lastLoginAt: null,
    }

    return NextResponse.json({
      message: 'Tạo nhân viên thu gom thành công',
      collector: formattedCollector
    })

  } catch (error) {
    console.error('Create collector error:', error)
    return NextResponse.json(
      { message: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// PUT endpoint for updating collectors
export async function PUT(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // TODO: Re-enable authentication later

    const body = await request.json()
    const {
      id,
      email,
      name,
      phone,
      address,
      licensePlate,
      cccd,
      startDate,
      status
    } = body

    // Validate required fields
    if (!id || !name) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    // Check if collector exists
    const existingCollector = await prisma.user.findUnique({
      where: { id, role: 'COLLECTOR' }
    })

    if (!existingCollector) {
      return NextResponse.json(
        { message: 'Không tìm thấy nhân viên thu gom' },
        { status: 404 }
      )
    }

    // Check email uniqueness (if email is being changed)
    if (email && email !== existingCollector.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { message: 'Email đã tồn tại' },
          { status: 400 }
        )
      }
    }

    // Update collector
    const updatedCollector = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        name,
        phone,
        address,
        licensePlate,
        ...(status && { status }),
        // cccd,
        // startDate: startDate ? new Date(startDate) : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        role: true,
        avatar: true,
        address: true,
        licensePlate: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Format response
    const formattedCollector = {
      ...updatedCollector,
      startDate: startDate || '',
      rating: 0,
      reviewCount: 0,
      cccd: cccd || '',
      createdAt: updatedCollector.createdAt.toISOString(),
      updatedAt: updatedCollector.updatedAt.toISOString(),
      lastLoginAt: null,
    }

    return NextResponse.json({
      message: 'Cập nhật nhân viên thu gom thành công',
      collector: formattedCollector
    })

  } catch (error) {
    console.error('Update collector error:', error)
    return NextResponse.json(
      { message: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// DELETE endpoint for deleting collectors
export async function DELETE(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // TODO: Re-enable authentication later

    const body = await request.json()
    const { id } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { message: 'Thiếu ID nhân viên' },
        { status: 400 }
      )
    }

    // Check if collector exists
    const existingCollector = await prisma.user.findUnique({
      where: { id, role: 'COLLECTOR' }
    })

    if (!existingCollector) {
      return NextResponse.json(
        { message: 'Không tìm thấy nhân viên thu gom' },
        { status: 404 }
      )
    }

    // Check if collector can be deleted (not ACTIVE)
    if (existingCollector.status === 'ACTIVE') {
      return NextResponse.json(
        { message: 'Không thể xóa nhân viên đang hoạt động. Vui lòng tạm ngưng trước khi xóa.' },
        { status: 400 }
      )
    }

    // Delete collector
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Xóa nhân viên thu gom thành công'
    })

  } catch (error) {
    console.error('Delete collector error:', error)
    return NextResponse.json(
      { message: 'Lỗi server' },
      { status: 500 }
    )
  }
}
