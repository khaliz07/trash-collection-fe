import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/admin/routes/[id] - Get specific route
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const route = await prisma.route.findUnique({
      where: { id: params.id },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    return NextResponse.json({ route });
  } catch (error) {
    console.error("Error fetching route:", error);
    return NextResponse.json(
      { error: "Failed to fetch route" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/routes/[id] - Update route
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log("Updating route with ID:", params.id, "data:", body);

    // Validate required fields
    if (!body.name || !body.pickup_points || body.pickup_points.length < 2) {
      return NextResponse.json(
        {
          error: "Missing required fields: name, and at least 2 pickup_points",
        },
        { status: 400 }
      );
    }

    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id: params.id },
    });

    if (!existingRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Convert pickup points to track points format
    const trackPoints = body.pickup_points.map((point: any) => ({
      lat: point.lat,
      lng: point.lng,
      address: point.address,
      user_id: point.user_id || null,
    }));

    // Update route in database
    const updatedRoute = await prisma.route.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        startTime: body.schedule_time || body.startTime,
        estimated_duration: body.estimated_duration,
        status: body.status,
        total_distance_km: body.total_distance_km,
        trackPoints: trackPoints,
        address: body.address || null, // Administrative address information
      },
    });

    console.log("Route updated successfully:", updatedRoute);
    return NextResponse.json(updatedRoute);
  } catch (error) {
    console.error("Error updating route:", error);
    return NextResponse.json(
      { error: "Failed to update route" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/routes/[id] - Delete route
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id: params.id },
    });

    if (!existingRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Delete the route
    await prisma.route.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting route:", error);
    return NextResponse.json(
      { error: "Failed to delete route" },
      { status: 500 }
    );
  }
}
