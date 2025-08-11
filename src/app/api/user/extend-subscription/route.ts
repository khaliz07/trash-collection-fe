import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addMonths, format } from "date-fns";
import { getUserId, validateUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate user exists
    const isValidUser = await validateUser(userId, prisma);
    if (!isValidUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User không tồn tại",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      packageId,
      duration, // in months
      price,
      paymentMethod,
      transactionId,
    } = JSON.parse(body.body);

    console.log(
      "Processing subscription extension for user:",
      packageId,
      duration,
      price,
      paymentMethod
    );

    // Validate required fields
    if (!packageId || !duration || !price || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: "Thiếu thông tin cần thiết",
        },
        { status: 400 }
      );
    }

    // Get current active subscription
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: "ACTIVE",
      },
    });

    if (!currentSubscription) {
      return NextResponse.json(
        {
          success: false,
          error: "Không tìm thấy gói dịch vụ hiện tại",
        },
        { status: 404 }
      );
    }

    // Calculate new end date
    const currentEndDate = currentSubscription.endMonth || new Date();
    const newEndDate = addMonths(currentEndDate, duration);
    const newNextBillingDate = addMonths(newEndDate, 0); // Same as end date for now

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          userId: userId,
          subscriptionId: currentSubscription.id,
          amount: price,
          currency: "VND",
          status: "COMPLETED",
          paymentMethod: mapPaymentMethod(paymentMethod),
          transactionId: transactionId || `ext-${Date.now()}`,
          paidAt: new Date(),
          metadata: {
            extensionDuration: duration,
            oldEndDate: currentSubscription.endMonth,
            newEndDate: newEndDate,
            packageId: packageId,
          },
        },
      });

      // Update subscription with new end date
      const updatedSubscription = await tx.subscription.update({
        where: { id: currentSubscription.id },
        data: {
          endMonth: newEndDate,
          nextBillingDate: newNextBillingDate,
          updatedAt: new Date(),
        },
      });

      return { payment, subscription: updatedSubscription };
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Gia hạn thành công",
      payment: {
        id: result.payment.id,
        amount: result.payment.amount,
        paidAt: result.payment.paidAt,
        transactionId: result.payment.transactionId,
      },
      subscription: {
        id: result.subscription.id,
        endMonth: result.subscription.endMonth,
        nextBillingDate: result.subscription.nextBillingDate,
      },
      extension: {
        duration: duration,
        newEndDate: format(newEndDate, "dd/MM/yyyy"),
        daysExtended: duration * 30, // Approximate
      },
    });
  } catch (error) {
    console.error("Error processing extension:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi xử lý gia hạn dịch vụ",
      },
      { status: 500 }
    );
  }
}

// Helper function to map payment method strings to enum values
function mapPaymentMethod(
  method: string
): "E_WALLET" | "BANK_TRANSFER" | "CARD" | "CASH" | "VNPAY" | "STRIPE" {
  const methodMap: Record<
    string,
    "E_WALLET" | "BANK_TRANSFER" | "CARD" | "CASH" | "VNPAY" | "STRIPE"
  > = {
    momo: "E_WALLET",
    zalopay: "E_WALLET",
    bank: "BANK_TRANSFER",
    credit: "CARD",
    cash: "CASH",
  };

  return methodMap[method] || "E_WALLET";
}
