import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Get collector's assigned urgent requests
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a collector
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "COLLECTOR") {
      return NextResponse.json(
        { error: "Access denied. Collector role required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status"); // Optional status filter
    const skip = (page - 1) * limit;

    // Build where condition
    const whereCondition: any = {
      assigned_collector_id: user.id,
    };

    // Add status filter if provided
    if (status && status !== "ALL") {
      whereCondition.status = status;
    } else {
      // Default: show only assigned, in_progress, and completed
      whereCondition.status = {
        in: ["ASSIGNED", "IN_PROGRESS", "COMPLETED"],
      };
    }

    // Get total count
    const totalCount = await prisma.urgentRequest.count({
      where: whereCondition,
    });

    // Get collector's urgent requests with user information
    const urgentRequests = await prisma.urgentRequest.findMany({
      where: whereCondition,
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
      },
      orderBy: [
        { status: "asc" }, // ASSIGNED first, then IN_PROGRESS, then COMPLETED
        { createdAt: "desc" }, // Newer requests first
      ],
      skip,
      take: limit,
    });

    // Convert Decimal fields to numbers for JSON serialization
    const responseData = urgentRequests.map((request) => ({
      ...request,
      pickup_lat: Number(request.pickup_lat),
      pickup_lng: Number(request.pickup_lng),
    }));

    return NextResponse.json({
      success: true,
      data: responseData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching assigned urgent requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
