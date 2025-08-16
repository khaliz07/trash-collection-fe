import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateRequestSchema = z.object({
  urgency_level: z.enum(["MEDIUM", "HIGH", "CRITICAL"]).optional(),
  requested_date: z.string().transform((str) => new Date(str)).optional(),
  waste_description: z.string().min(10).max(500).optional(),
  pickup_address: z.string().min(5).optional(),
  pickup_lat: z.number().optional(),
  pickup_lng: z.number().optional(),
});

// PATCH: Update urgent request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateRequestSchema.parse(body);

    // Check if urgent request exists and belongs to user
    const existingRequest = await prisma.urgentRequest.findFirst({
      where: {
        id: params.id,
        user_id: authUser.userId,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Urgent request not found" },
        { status: 404 }
      );
    }

    // Check if request can be updated (only PENDING status)
    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: "Cannot update request with current status" },
        { status: 400 }
      );
    }

    // Update the urgent request
    const updatedRequest = await prisma.urgentRequest.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error updating urgent request:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Cancel urgent request (soft delete by changing status)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if urgent request exists and belongs to user
    const existingRequest = await prisma.urgentRequest.findFirst({
      where: {
        id: params.id,
        user_id: authUser.userId,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Urgent request not found" },
        { status: 404 }
      );
    }

    // Check if request can be cancelled (only PENDING status)
    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: "Cannot cancel request with current status" },
        { status: 400 }
      );
    }

    // Update status to CANCELLED instead of hard delete
    const cancelledRequest = await prisma.urgentRequest.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
      ...cancelledRequest,
      pickup_lat: Number(cancelledRequest.pickup_lat),
      pickup_lng: Number(cancelledRequest.pickup_lng),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error cancelling urgent request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
