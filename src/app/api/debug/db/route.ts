import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = (await prisma.$queryRaw`
      SELECT id, name, email FROM users LIMIT 5
    `) as any[];

    const packages = (await prisma.$queryRaw`
      SELECT id, name, price FROM packages LIMIT 5
    `) as any[];

    const payments = (await prisma.$queryRaw`
      SELECT id, "userId", "packageId", amount, status, "transactionId", "coveredMonths", "createdAt" 
      FROM payments 
      ORDER BY "createdAt" DESC 
      LIMIT 5
    `) as any[];

    const subscriptions = (await prisma.$queryRaw`
      SELECT id, "userId", "packageId", "queuePosition", status, "startMonth", "endMonth"
      FROM subscriptions 
      ORDER BY "createdAt" DESC 
      LIMIT 5
    `) as any[];

    return NextResponse.json({
      success: true,
      users,
      packages,
      payments,
      subscriptions,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
