import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'USER' | 'COLLECTOR'
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const signJWT = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '24h'
  })
}

export const verifyJWT = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch {
    return null
  }
}

// Simple user ID extraction from headers or query params
// In production, this would be from JWT token or session
export function getUserId(request: NextRequest): string {
  // Try to get from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In real app, decode JWT token here
    const token = authHeader.substring(7);
    if (token === 'user-1-token') return 'user-1';
    if (token === 'user-2-token') return 'user-2';
    if (token === 'admin-token') return 'admin-1';
  }
  
  // Try to get from query params (for demo purposes)
  const { searchParams } = new URL(request.url);
  const userIdParam = searchParams.get('userId');
  if (userIdParam) {
    return userIdParam;
  }
  
  // Try to get from X-User-ID header
  const userIdHeader = request.headers.get('x-user-id');
  if (userIdHeader) {
    return userIdHeader;
  }
  
  // Default fallback for demo
  return 'user-1';
}

// Validate if user exists in database
export async function validateUser(userId: string, prisma: any): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    return !!user;
  } catch {
    return false;
  }
}

export const getAuthUser = (request: NextRequest): JWTPayload | null => {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyJWT(token)
}
