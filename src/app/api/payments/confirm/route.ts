import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Find the payment in database
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: paymentId,
      },
      include: {
        subscription: true,
        package: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    if (payment.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        message: "Payment already confirmed",
        payment: payment,
      });
    }

    // Update payment status to COMPLETED
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
        // Update covered months based on package duration
        coveredMonths: [new Date().toISOString().substring(0, 7)], // Current month
      },
      include: {
        subscription: true,
        package: true,
      },
    });

    // Create NEW subscription when payment is confirmed (only if not exists)
    let subscription = null;
    if (!payment.subscription) {
      // Check existing active subscriptions for queue management
      const activeSubscriptions = await prisma.subscription.findMany({
        where: {
          userId: payment.userId,
          status: "ACTIVE",
        },
        orderBy: { endMonth: "desc" },
      });

      // Calculate queue position (0 = immediate, 1+ = queued)
      const queuePosition = activeSubscriptions.length;

      // Calculate subscription period
      const currentDate = new Date();
      let startDate: Date;
      let startMonth: string;
      let endMonth: string;

      if (queuePosition === 0 || activeSubscriptions.length === 0) {
        // Start immediately if no active subscriptions
        startDate = currentDate;
        startMonth = currentDate.toISOString().substring(0, 7);
      } else {
        // Start after the last active subscription ends
        const lastSubscription = activeSubscriptions[0]; // Most recent end date
        const [year, month] = lastSubscription.endMonth.split("-").map(Number);
        startDate = new Date(year, month, 1); // Start at beginning of next month
        startMonth = startDate.toISOString().substring(0, 7);
      }

      // Calculate end month based on package duration
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + payment.package.duration);
      endMonth = endDate.toISOString().substring(0, 7);

      // Generate covered months array
      const coveredMonths: string[] = [];
      const current = new Date(startDate);
      while (current < endDate) {
        coveredMonths.push(current.toISOString().substring(0, 7));
        current.setMonth(current.getMonth() + 1);
      }

      subscription = await prisma.subscription.create({
        data: {
          userId: payment.userId,
          packageId: payment.packageId,
          status: "ACTIVE",
          activatedAt: queuePosition === 0 ? new Date() : null,
          startMonth,
          endMonth,
          queuePosition,
        },
      });

      // Update payment with subscription link and covered months
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          subscriptionId: subscription.id,
          coveredMonths,
        },
      });

      console.log(`✅ Subscription created:`, {
        subscriptionId: subscription.id,
        queuePosition,
        startMonth,
        endMonth,
        coveredMonths,
      });
    }

    console.log(`✅ Payment ${paymentId} confirmed successfully`);

    return NextResponse.json({
      success: true,
      message: "Payment confirmed successfully",
      payment: {
        ...updatedPayment,
        subscription: subscription || updatedPayment.subscription,
      },
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
