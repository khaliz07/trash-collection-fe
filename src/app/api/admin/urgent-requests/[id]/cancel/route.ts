import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH: Cancel urgent request by admin
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an admin
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    // Check if urgent request exists
    const urgentRequest = await prisma.urgentRequest.findUnique({
      where: { id: params.id },
    });

    if (!urgentRequest) {
      return NextResponse.json(
        { error: "Urgent request not found" },
        { status: 404 }
      );
    }

    // Check if request can be cancelled (not already completed or cancelled)
    if (
      urgentRequest.status === "COMPLETED" ||
      urgentRequest.status === "CANCELLED"
    ) {
      return NextResponse.json(
        { error: "Cannot cancel request with current status" },
        { status: 400 }
      );
    }

    // Cancel the urgent request
    const updatedRequest = await prisma.urgentRequest.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
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
      message: "Urgent request cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling urgent request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
