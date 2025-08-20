import { NextRequest, NextResponse } from "next/server";
import { getBaseURL } from "@/lib/network";
import { PrismaClient } from "@prisma/client";
import { getUserId, validateUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Authenticate user from JWT token
    const authenticatedUserId = getUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Token không hợp lệ" },
        { status: 401 }
      );
    }

    // Validate user exists in database
    const isValidUser = await validateUser(authenticatedUserId, prisma);
    if (!isValidUser) {
      return NextResponse.json(
        { success: false, message: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      amount,
      description,
      packageId,
      packageName,
      duration,
      method,
      baseUrl,
    } = JSON.parse(body.body);

    // Use authenticated user ID instead of body userId
    const userId = authenticatedUserId;

    // Validate required fields
    if (!userId || !packageId) {
      return NextResponse.json(
        { success: false, message: "userId và packageId là bắt buộc" },
        { status: 400 }
      );
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    // Validate package exists
    const packageInfo = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!packageInfo) {
      return NextResponse.json(
        { success: false, message: "Gói dịch vụ không tồn tại" },
        { status: 404 }
      );
    }

    // Generate payment ID
    const paymentId = `PAY_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Calculate expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Create payment record in database with PENDING status
    // Subscription will be created only when payment is confirmed
    const payment = await prisma.payment.create({
      data: {
        transactionId: paymentId,
        amount: amount || packageInfo.price,
        currency: "VND",
        status: "PENDING",
        paymentMethod: (method === "momo"
          ? "E_WALLET"
          : method || "E_WALLET") as any,
        expiresAt: expiresAt,
        coveredMonths: [], // Will be updated when payment is confirmed
        // Connect to existing package
        package: {
          connect: { id: packageId },
        },
        // Connect to existing user
        user: {
          connect: { id: userId },
        },
        // Do NOT create subscription here - only create when payment confirmed
      },
    });

    console.log(
      "✅ Payment record created:",
      payment.id,
      "TransactionId:",
      paymentId
    );

    return NextResponse.json({
      success: true,
      paymentId,
      amount: payment.amount,
      packageName: packageInfo.name,
      duration: packageInfo.duration,
      qrUrl: `${baseUrl || getBaseURL(3000)}/api/payments/confirm/${paymentId}`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi tạo thanh toán" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: "Missing payment ID" },
        { status: 400 }
      );
    }

    // Get payment from database
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: paymentId,
      },
      include: {
        package: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if payment is expired
    if (
      payment.expiresAt &&
      new Date() > payment.expiresAt &&
      payment.status === "PENDING"
    ) {
      // Update status to expired
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json({
        success: true,
        payment: {
          ...payment,
          status: "FAILED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        packageName: payment.package.name,
        duration: payment.package.duration,
        user: payment.user,
        expiresAt: payment.expiresAt,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error("Get payment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
