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

    // Get query parameters
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");
    const search = request.nextUrl.searchParams.get("search") || "";
    const status = request.nextUrl.searchParams.get("status") || "";
    const paymentMethod =
      request.nextUrl.searchParams.get("paymentMethod") || "";
    const packageId = request.nextUrl.searchParams.get("packageId") || "";
    const startDate = request.nextUrl.searchParams.get("startDate") || "";
    const endDate = request.nextUrl.searchParams.get("endDate") || "";
    const province = request.nextUrl.searchParams.get("province") || "";
    const district = request.nextUrl.searchParams.get("district") || "";
    const ward = request.nextUrl.searchParams.get("ward") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Text search in user name, email, or transaction ID
    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: "insensitive" } },
        { externalId: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Payment method filter
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    // Package filter
    if (packageId) {
      where.packageId = packageId;
    }

    // Date range filter
    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) {
        where.paidAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.paidAt.lte = new Date(endDate);
      }
    }

    // Address filters - filter by user's address
    if (province || district || ward) {
      const addressFilters = [];
      if (province) addressFilters.push(province);
      if (district) addressFilters.push(district);
      if (ward) addressFilters.push(ward);

      where.user = {
        ...where.user,
        address: {
          contains: addressFilters.join(", "),
          mode: "insensitive",
        },
      };
    }

    // Get payments with related data
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
            },
          },
          package: {
            select: {
              id: true,
              name: true,
              type: true,
              price: true,
            },
          },
          subscription: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { paidAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    // Format payments data
    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      externalId: payment.externalId,
      receiptUrl: payment.receiptUrl,
      paidAt: payment.paidAt.toISOString(),
      failureReason: payment.failureReason,
      coveredMonths: payment.coveredMonths,
      expiresAt: payment.expiresAt?.toISOString(),
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      user: {
        id: payment.user.id,
        name: payment.user.name || "Chưa cập nhật",
        email: payment.user.email,
        phone: payment.user.phone || "Chưa cập nhật",
        address: payment.user.address || "Chưa cập nhật",
      },
      package: {
        id: payment.package.id,
        name: payment.package.name,
        type: payment.package.type,
        price: payment.package.price,
      },
      subscription: payment.subscription
        ? {
            id: payment.subscription.id,
            status: payment.subscription.status,
          }
        : null,
    }));

    return NextResponse.json({
      payments: formattedPayments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { message: "Lỗi khi lấy danh sách thanh toán" },
      { status: 500 }
    );
  }
}
