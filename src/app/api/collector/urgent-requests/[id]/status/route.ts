import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["ASSIGNED", "IN_PROGRESS", "COMPLETED"]),
});

// PATCH: Update urgent request status by collector
export async function PATCH(
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

    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    // Check if urgent request exists and is assigned to this collector
    const existingRequest = await prisma.urgentRequest.findFirst({
      where: {
        id: params.id,
        assigned_collector_id: authUser.userId,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Urgent request not found or not assigned to you" },
        { status: 404 }
      );
    }

    // Check valid status transitions
    const { status } = validatedData;
    const currentStatus = existingRequest.status;

    // Define valid transitions
    const validTransitions: Record<string, string[]> = {
      ASSIGNED: ["IN_PROGRESS", "COMPLETED"],
      IN_PROGRESS: ["COMPLETED"],
      COMPLETED: [], // No transitions from completed
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set completion date if marking as completed
    if (status === "COMPLETED") {
      updateData.completed_at = new Date();
    }

    // Update the urgent request
    const updatedRequest = await prisma.urgentRequest.update({
      where: { id: params.id },
      data: updateData,
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
      ...updatedRequest,
      pickup_lat: Number(updatedRequest.pickup_lat),
      pickup_lng: Number(updatedRequest.pickup_lng),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error updating urgent request status:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid status", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
