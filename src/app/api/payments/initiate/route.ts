import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paymentId,
      userId,
      packageId,
      amount,
      paymentMethod = "VNPAY",
    } = body;

    if (!paymentId || !userId || !packageId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        transactionId: paymentId,
      },
    });

    if (existingPayment) {
      return NextResponse.json({
        success: true,
        message: "Payment already exists",
        payment: {
          id: existingPayment.id,
          transactionId: existingPayment.transactionId,
          status: existingPayment.status,
          amount: existingPayment.amount,
        },
      });
    }

    // Get user and package info
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const packageInfo = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!user || !packageInfo) {
      return NextResponse.json(
        { success: false, message: "User or package not found" },
        { status: 404 }
      );
    }

    // Find active subscriptions for this user
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        userId: userId,
        status: "ACTIVE",
      },
      orderBy: {
        queuePosition: "asc",
      },
    });

    // Check if subscription exists for this package
    let subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        packageId: packageId,
        status: "ACTIVE",
      },
    });

    if (!subscription) {
      // Create new subscription in queue
      const nextQueuePosition = activeSubscriptions.length;
      const startMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + packageInfo.duration);
      const endMonth = endDate.toISOString().substring(0, 7);

      subscription = await prisma.subscription.create({
        data: {
          userId: userId,
          packageId: packageId,
          queuePosition: nextQueuePosition,
          status: "ACTIVE",
          startMonth: startMonth,
          endMonth: endMonth,
          activatedAt: nextQueuePosition === 0 ? new Date() : null,
        },
      });
    }

    // Calculate covered months
    const now = new Date();
    const coveredMonths: string[] = [];
    for (let i = 0; i < packageInfo.duration; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
      coveredMonths.push(month.toISOString().substring(0, 7));
    }

    // Create PENDING payment record
    const payment = await prisma.payment.create({
      data: {
        userId: userId,
        packageId: packageId,
        subscriptionId: subscription.id,
        amount: amount || packageInfo.price,
        currency: "VND",
        status: "PENDING",
        paymentMethod: paymentMethod as any,
        coveredMonths: coveredMonths,
        transactionId: paymentId,
      },
    });

    console.log("✅ Payment initiated:", payment.id);

    return NextResponse.json({
      success: true,
      message: "Payment initiated successfully",
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        status: "PENDING",
        amount: payment.amount,
        packageName: packageInfo.name,
        coveredMonths: payment.coveredMonths,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
