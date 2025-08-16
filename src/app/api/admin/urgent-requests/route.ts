import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Get all urgent requests for admin (all statuses)
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status"); // Optional status filter
    const urgencyLevel = searchParams.get("urgency_level"); // Optional urgency filter
    const skip = (page - 1) * limit;

    // Build where condition
    const whereCondition: any = {};

    // Add status filter if provided
    if (status && status !== "ALL") {
      whereCondition.status = status;
    }

    // Add urgency level filter if provided
    if (urgencyLevel && urgencyLevel !== "ALL") {
      whereCondition.urgency_level = urgencyLevel;
    }

    // Get total count
    const totalCount = await prisma.urgentRequest.count({
      where: whereCondition,
    });

    // Get all urgent requests with user and collector information
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
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // PENDING first, then ASSIGNED, etc.
        { urgency_level: 'desc' }, // CRITICAL first, then HIGH, then MEDIUM
        { createdAt: 'desc' }, // Newer requests first
      ],
      skip,
      take: limit,
    });

    // Convert Decimal fields to numbers for JSON serialization
    const responseData = urgentRequests.map(request => ({
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
    console.error("Error fetching urgent requests for admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
