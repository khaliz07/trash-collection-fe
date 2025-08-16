import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/collector/urgent-requests - Get urgent requests for collector
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has collector role
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { role: true },
    });

    if (!user || user.role !== "COLLECTOR") {
      return NextResponse.json(
        { error: "Access denied. Collector role required." },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build where condition based on status filter
    let whereCondition: any = {};

    if (status === "PENDING") {
      // Unassigned requests - available for pickup
      whereCondition = {
        status: "PENDING",
        assigned_collector_id: null,
      };
    } else if (status === "ASSIGNED") {
      // Requests assigned to this collector
      whereCondition = {
        assigned_collector_id: authUser.userId,
        status: {
          in: ["ASSIGNED", "IN_PROGRESS", "COMPLETED"],
        },
      };
    } else {
      // All relevant requests for this collector
      whereCondition = {
        OR: [
          {
            status: "PENDING",
            assigned_collector_id: null,
          },
          {
            assigned_collector_id: authUser.userId,
          },
        ],
      };
    }

    // Get total count for pagination
    const total = await prisma.urgentRequest.count({
      where: whereCondition,
    });

    // Get urgent requests with related data
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
        route: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { urgency_level: "desc" }, // Most urgent first
        { createdAt: "asc" }, // Oldest first for same urgency
      ],
      take: limit,
      skip: offset,
    });

    // Convert Decimal fields to numbers for JSON serialization
    const formattedRequests = urgentRequests.map((request) => ({
      ...request,
      pickup_lat: Number(request.pickup_lat),
      pickup_lng: Number(request.pickup_lng),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: formattedRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching collector urgent requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
