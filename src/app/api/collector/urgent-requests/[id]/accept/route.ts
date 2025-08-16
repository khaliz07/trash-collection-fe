import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST: Accept an urgent request by collector
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if urgent request exists and is available (PENDING status)
    const urgentRequest = await prisma.urgentRequest.findUnique({
      where: { id: params.id },
    });

    if (!urgentRequest) {
      return NextResponse.json(
        { error: "Urgent request not found" },
        { status: 404 }
      );
    }

    if (urgentRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request is no longer available" },
        { status: 400 }
      );
    }

    // Assign the request to the collector
    const updatedRequest = await prisma.urgentRequest.update({
      where: { id: params.id },
      data: {
        assigned_collector_id: user.id,
        status: "ASSIGNED",
        assigned_at: new Date(),
        updatedAt: new Date(),
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
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const responseData = {
      ...updatedRequest,
      pickup_lat: Number(updatedRequest.pickup_lat),
      pickup_lng: Number(updatedRequest.pickup_lng),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Urgent request accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting urgent request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
