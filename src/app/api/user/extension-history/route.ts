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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get extension history from payments with new schema - use runtime query without TypeScript types
    const payments = await prisma.$queryRaw`
      SELECT 
        p.*,
        pkg.name as packageName,
        pkg.duration as packageDuration,
        pkg.tier as packageTier,
        s."queuePosition" as subscriptionQueuePosition
      FROM payments p
      LEFT JOIN packages pkg ON p."packageId" = pkg.id
      LEFT JOIN subscriptions s ON p."subscriptionId" = s.id
      WHERE p."userId" = ${userId} AND p.status = 'COMPLETED'
      ORDER BY p."paidAt" DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;

    const totalResult = (await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM payments 
      WHERE "userId" = ${userId} AND status = 'COMPLETED'
    `) as any[];

    const total = Number(totalResult[0]?.count || 0);

    // Transform payments to extension history format using new schema
    const extensions = (payments as any[]).map((payment) => {
      // Get package name with duration from package info
      let packageDisplayName = payment.packagename || "Gói dịch vụ";
      let duration = "1 tháng";

      // Calculate duration display based on package duration
      if (payment.packageduration === 3) {
        duration = "3 tháng (Quý)";
      } else if (payment.packageduration === 12) {
        duration = "1 năm";
      }

      // Calculate expiry date based on covered months
      let expiryDate = new Date();
      if (payment.coveredMonths && payment.coveredMonths.length > 0) {
        const lastMonth =
          payment.coveredMonths[payment.coveredMonths.length - 1];
        const [year, month] = lastMonth.split("-").map(Number);
        expiryDate = new Date(year, month, 0); // Last day of the month
      }

      // Map payment method to Vietnamese
      let paymentMethod = "Chuyển khoản ngân hàng";
      switch (payment.paymentMethod) {
        case "E_WALLET":
          paymentMethod = "Ví điện tử";
          break;
        case "VNPAY":
          paymentMethod = "VNPay";
          break;
        case "CARD":
          paymentMethod = "Thẻ tín dụng";
          break;
        case "CASH":
          paymentMethod = "Tiền mặt";
          break;
        case "STRIPE":
          paymentMethod = "Stripe";
          break;
        default:
          paymentMethod = "Chuyển khoản ngân hàng";
      }

      return {
        id: payment.id,
        packageName: packageDisplayName,
        price: Number(payment.amount),
        paymentDate:
          payment.paidAt?.toISOString() || payment.createdAt.toISOString(),
        expiryDate: expiryDate.toISOString(),
        paymentMethod: paymentMethod,
        status: "completed",
        duration: duration,
        // Additional info from new schema
        coveredMonths: payment.coveredMonths,
        tier: payment.packagetier,
        subscriptionActive: payment.subscriptionqueueposition === 0,
        queuePosition: payment.subscriptionqueueposition,
      };
    });

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);

    // Calculate statistics from all payments (not just paginated)
    const allPaymentsStats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END), 0) as totalAmount,
        COUNT(CASE WHEN status = 'COMPLETED' AND EXTRACT(MONTH FROM "paidAt") = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM "paidAt") = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 END) as thisMonth
      FROM payments 
      WHERE "userId" = ${userId}
    ` as any[];

    const statsRaw = allPaymentsStats[0] || {};
    const statistics = {
      total: Number(statsRaw.total || 0),
      successful: Number(statsRaw.successful || 0),
      failed: Number(statsRaw.failed || 0),
      pending: Number(statsRaw.pending || 0),
      totalAmount: Number(statsRaw.totalamount || 0),
      thisMonth: Number(statsRaw.thismonth || 0),
    };

    return NextResponse.json({
      success: true,
      extensions,
      statistics, // Add statistics to response
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching extension history:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
