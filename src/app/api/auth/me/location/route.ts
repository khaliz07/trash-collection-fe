import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/auth/me/location - Update user location
export async function PATCH(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { address, latitude, longitude } = body;

    // Validation
    if (!address || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: address, latitude, longitude" },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: "Latitude and longitude must be numbers" },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: "Latitude must be between -90 and 90" },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Longitude must be between -180 and 180" },
        { status: 400 }
      );
    }

    // Update user location
    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        address: address.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User location updated successfully",
    });

  } catch (error) {
    console.error("Error updating user location:", error);
    return NextResponse.json(
      { error: "Failed to update user location" },
      { status: 500 }
    );
  }
}
