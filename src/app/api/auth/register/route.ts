import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, signJWT } from '@/lib/auth'
import { z } from 'zod'

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['USER', 'COLLECTOR']).default('USER')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Debug: Log the incoming request body
    console.log('🔍 Incoming request body:', JSON.stringify(body, null, 2))
    
    const { email, password, name, phone, address, role } = RegisterSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' }, 
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        address,
        role: role as any
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    
    // Generate JWT
    const token = signJWT({
      userId: user.id,
      email: user.email,
      role: user.role as any
    })
    
    return NextResponse.json({ 
      token, 
      user: user,
      message: 'Registration successful'
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      console.log('❌ Zod validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
