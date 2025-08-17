import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/admin/routes - List all routes
export async function GET(request: NextRequest) {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ routes });
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      { error: "Failed to fetch routes" },
      { status: 500 }
    );
  }
}

// POST /api/admin/routes - Create new route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Creating route with data:", body);

    // Validate required fields
    if (!body.name || !body.pickup_points || body.pickup_points.length < 2) {
      return NextResponse.json(
        {
          error: "Missing required fields: name, and at least 2 pickup_points",
        },
        { status: 400 }
      );
    }

    // Prepare track points from pickup points
    const trackPoints = body.pickup_points.map((point: any) => ({
      lat: point.lat,
      lng: point.lng,
      address: point.address,
    }));

    // Prepare start time - for now, single time, later can be extended to multiple
    const startTime = body.schedule_time
      ? [
          {
            day: new Date(body.schedule_time)
              .toLocaleDateString("en-US", { weekday: "long" })
              .toLowerCase(),
            time: new Date(body.schedule_time).toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]
      : [];

    // Create route in database
    const route = await prisma.route.create({
      data: {
        name: body.name,
        description: body.description || "",
        startTime: startTime,
        status: body.status || "DRAFT",
        trackPoints: trackPoints,
        estimated_duration: body.estimated_duration || 60,
        total_distance_km: body.total_distance_km || 0,
        address: body.address || null, // Administrative address information
      },
    });

    console.log("Route created successfully:", route);
    return NextResponse.json(route, { status: 201 });
  } catch (error) {
    console.error("Error creating route:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error: "Failed to create route",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/routes - Update existing route
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Updating route with data:", body);

    // Validate required fields
    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: "Missing required fields: id and name" },
        { status: 400 }
      );
    }

    // Prepare track points from pickup points if provided
    const trackPoints = body.pickup_points
      ? body.pickup_points.map((point: any) => ({
          lat: point.lat,
          lng: point.lng,
          address: point.address,
        }))
      : undefined;

    // Prepare start time if provided
    const startTime = body.schedule_time
      ? [
          {
            day: new Date(body.schedule_time)
              .toLocaleDateString("en-US", { weekday: "long" })
              .toLowerCase(),
            time: new Date(body.schedule_time).toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]
      : undefined;

    // Update route in database
    const route = await prisma.route.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        startTime: startTime,
        status: body.status,
        trackPoints: trackPoints,
        estimated_duration: body.estimated_duration,
        total_distance_km: body.total_distance_km,
        address: body.address, // Update administrative address
      },
    });

    console.log("Route updated successfully:", route);
    return NextResponse.json(route, { status: 200 });
  } catch (error) {
    console.error("Error updating route:", error);
    return NextResponse.json(
      {
        error: "Failed to update route",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
