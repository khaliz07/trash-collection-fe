import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-here-make-it-long-and-random-123456789";

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

    // Get users with pagination
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");
    const search = request.nextUrl.searchParams.get("search") || "";
    const status = request.nextUrl.searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      role: "USER", // Only get users, not admins or collectors
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Get users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          subscriptions: {
            where: {
              status: "ACTIVE",
            },
            include: {
              package: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    // Format users data
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name || "Chưa cập nhật",
      email: user.email,
      phone: user.phone || "Chưa cập nhật",
      address: user.address || "Chưa cập nhật",
      status: user.status,
      joinDate: user.createdAt.toLocaleDateString("vi-VN"),
      lastLoginAt:
        user.lastLoginAt?.toLocaleDateString("vi-VN") || "Chưa đăng nhập",
      plan: user.subscriptions[0]?.package?.name || "Chưa có gói",
      planType: user.subscriptions[0]?.package?.type || "NONE",
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Lỗi khi lấy danh sách người dùng" },
      { status: 500 }
    );
  }
}
