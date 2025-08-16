import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Get available urgent requests for collectors (status = PENDING)
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
    const skip = (page - 1) * limit;

    // Get total count of pending requests
    const totalCount = await prisma.urgentRequest.count({
      where: {
        status: "PENDING",
      },
    });

    // Get pending urgent requests with user information
    const urgentRequests = await prisma.urgentRequest.findMany({
      where: {
        status: "PENDING",
      },
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
        { urgency_level: "desc" }, // CRITICAL first, then HIGH, then MEDIUM
        { createdAt: "asc" }, // Older requests first
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
    console.error("Error fetching available urgent requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
