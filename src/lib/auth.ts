import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "USER" | "COLLECTOR";
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const signJWT = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });
};

export const verifyJWT = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch {
    return null;
  }
};

// Extract user ID from JWT token in Authorization header
export function getUserId(request: NextRequest): string | null {
  // Try to get from Authorization header
  const authHeader = request.headers.get("Authorization");

  console.log("Auth header:", request.headers);

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = verifyJWT(token);
    if (payload) {
      return payload.userId;
    }
  }

  // Try to get from query params (for demo/testing purposes only)
  const { searchParams } = new URL(request.url);
  const userIdParam = searchParams.get("userId");
  if (userIdParam) {
    return userIdParam;
  }

  // Try to get from X-User-ID header (for demo/testing purposes only)
  const userIdHeader = request.headers.get("x-user-id");
  if (userIdHeader) {
    return userIdHeader;
  }

  // No valid authentication found
  return null;
}

// Validate if user exists in database
export async function validateUser(
  userId: string | null,
  prisma: any
): Promise<boolean> {
  if (!userId) return false;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return !!user;
  } catch {
    return false;
  }
}

export const getAuthUser = (request: NextRequest): JWTPayload | null => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyJWT(token);
};
