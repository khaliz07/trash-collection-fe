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
      packageId, // The new package ID from packages table
      paymentMethod,
      transactionId,
    } = body;

    // Validate required fields
    if (!packageId || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: "Thiếu thông tin cần thiết",
        },
        { status: 400 }
      );
    }

    // Get the new package details
    const newPackage = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!newPackage || newPackage.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "Gói dịch vụ không tồn tại hoặc không còn hoạt động",
        },
        { status: 404 }
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

    // Determine extension logic based on current subscription
    const currentEndDate = currentSubscription.endDate || new Date();
    const now = new Date();

    let newEndDate: Date;
    let isUpgrade = false;

    // If current package hasn't expired yet, extend from current end date
    if (currentEndDate > now) {
      newEndDate = addMonths(currentEndDate, newPackage.duration);
      isUpgrade = true;
    } else {
      // If expired, start from today
      newEndDate = addMonths(now, newPackage.duration);
    }

    const newNextBillingDate = addMonths(newEndDate, 0);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          customerId: userId,
          subscriptionId: currentSubscription.id,
          amount: newPackage.price,
          currency: "VND",
          status: "COMPLETED",
          paymentMethod: mapPaymentMethod(paymentMethod),
          transactionId: transactionId || `pkg-${Date.now()}`,
          paidAt: new Date(),
          metadata: {
            packageChange: true,
            oldPackageId: currentSubscription.packageId,
            newPackageId: packageId,
            isUpgrade,
            oldEndDate: currentSubscription.endDate,
            newEndDate: newEndDate,
            packageDuration: newPackage.duration,
          },
        },
      });

      // Update subscription with new package and dates
      const updatedSubscription = await tx.subscription.update({
        where: { id: currentSubscription.id },
        data: {
          packageId: packageId,
          planName: newPackage.name,
          description: newPackage.description,
          price: newPackage.price,
          endDate: newEndDate,
          nextBillingDate: newNextBillingDate,
          updatedAt: new Date(),
        },
      });

      return { payment, subscription: updatedSubscription };
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: isUpgrade
        ? "Nâng cấp gói thành công"
        : "Đăng ký gói mới thành công",
      payment: {
        id: result.payment.id,
        amount: result.payment.amount,
        paidAt: result.payment.paidAt,
        transactionId: result.payment.transactionId,
      },
      subscription: {
        id: result.subscription.id,
        packageId: result.subscription.packageId,
        planName: result.subscription.planName,
        endDate: result.subscription.endDate,
        nextBillingDate: result.subscription.nextBillingDate,
      },
      package: {
        id: newPackage.id,
        name: newPackage.name,
        duration: newPackage.duration,
        price: newPackage.price,
        features: newPackage.features,
      },
      change: {
        isUpgrade,
        newEndDate: format(newEndDate, "dd/MM/yyyy"),
        daysAdded: newPackage.duration * 30, // Approximate
      },
    });
  } catch (error) {
    console.error("Error processing package change:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi xử lý thay đổi gói dịch vụ",
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
