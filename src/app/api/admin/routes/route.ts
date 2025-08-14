import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/admin/routes - List all routes
export async function GET(request: NextRequest) {
  try {
    const routes = await prisma.collectionRoute.findMany({
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

    // Simple route creation for now
    const route = {
      id: `route_${Date.now()}`,
      route_name: body.name,
      route_code: `R${Date.now().toString().slice(-6)}`,
      description: body.description,
      status: "DRAFT",
      total_distance_km: 0,
      estimated_time_min: body.estimated_duration || 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(route, { status: 201 });
  } catch (error) {
    console.error("Error creating route:", error);
    return NextResponse.json(
      { error: "Failed to create route" },
      { status: 500 }
    );
  }
}
