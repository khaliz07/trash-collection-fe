import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserId } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User không tồn tại",
        },
        { status: 401 }
      );
    }

    // Get current active subscription from database
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: "ACTIVE",
      },
      include: {
        user: true,
        package: true,
        payments: {
          where: {
            status: "COMPLETED",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({
        success: false,
        message: "No active package found",
        package: null,
      });
    }

    // Calculate status based on dates
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM
    const endMonth = subscription.endMonth;

    let status = "active";
    let daysLeft = 30; // default

    if (endMonth) {
      const [endYear, endMonthNum] = endMonth.split("-").map(Number);
      const endDate = new Date(endYear, endMonthNum, 0); // Last day of end month
      daysLeft = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysLeft < 0) {
        status = "expired";
      } else if (daysLeft <= 7) {
        status = "expiring";
      }
    }

    // Get collections count for this user
    const totalCollections = await prisma.collection.count({
      where: {
        customerId: userId,
      },
    });

    const completedCollections = await prisma.collection.count({
      where: {
        customerId: userId,
        status: "COMPLETED",
      },
    });

    // Get next scheduled collection
    const nextCollection = await prisma.collection.findFirst({
      where: {
        customerId: userId,
        status: "SCHEDULED",
        scheduledDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });

    const packageData = {
      id: subscription.id,
      name: subscription.package?.name || "Gói dịch vụ",
      type: subscription.package?.type || "monthly",
      startDate:
        subscription.activatedAt?.toISOString() ||
        subscription.createdAt.toISOString(),
      endDate: endMonth ? `${endMonth}-28` : new Date().toISOString(),
      status,
      fee: Number(subscription.package?.price || 80000),
      area:
        subscription.user.address || "Phường Linh Trung, Quận Thủ Đức, TP. HCM",
      description:
        subscription.package?.description ||
        "Thu gom rác 2 lần/tuần (Thứ 3 và Thứ 6)",
      features: subscription.package?.features || [
        "Thu gom rác sinh hoạt",
        "Thu gom 2 lần/tuần",
        "Hỗ trợ 24/7",
        "Thông báo lịch thu gom",
      ],
      collectionsUsed: completedCollections,
      collectionsTotal:
        (subscription.package?.collectionsPerWeek || 2) *
        (subscription.package?.duration || 1) *
        4,
      collectionsPerWeek: subscription.package?.collectionsPerWeek || 2,
      nextCollection: nextCollection?.scheduledDate?.toISOString() || null,
      autoRenewal: true,
      daysLeft,
      isExpiringSoon: daysLeft <= 7 && daysLeft >= 0,
      canRenew: daysLeft <= 30,
      queuePosition: subscription.queuePosition,
    };

    return NextResponse.json({
      success: true,
      package: packageData,
    });
  } catch (error) {
    console.error("Error fetching current package:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
