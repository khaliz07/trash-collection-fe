import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST: Collector accepts/assigns urgent request to themselves
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if urgent request exists and is available
    const existingRequest = await prisma.urgentRequest.findUnique({
      where: { id: params.id },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Urgent request not found" },
        { status: 404 }
      );
    }

    // Check if request is available for assignment
    if (
      existingRequest.status !== "PENDING" ||
      existingRequest.assigned_collector_id
    ) {
      return NextResponse.json(
        { error: "Request is not available for assignment" },
        { status: 400 }
      );
    }

    // Assign request to collector
    const assignedRequest = await prisma.urgentRequest.update({
      where: { id: params.id },
      data: {
        assigned_collector_id: authUser.userId,
        assigned_at: new Date(),
        status: "ASSIGNED",
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
        route: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const responseData = {
      ...assignedRequest,
      pickup_lat: Number(assignedRequest.pickup_lat),
      pickup_lng: Number(assignedRequest.pickup_lng),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error assigning urgent request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
