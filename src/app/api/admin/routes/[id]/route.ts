import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/admin/routes/[id] - Get specific route
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const route = await prisma.collectionRoute.findUnique({
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

// PATCH /api/admin/routes/[id] - Update route
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log("Updating route with data:", body);

    // For now, return success without actually updating database
    // since we're using mock data
    const updatedRoute = {
      id: params.id,
      ...body,
      updatedAt: new Date(),
    };

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
    // For now, return success without actually deleting from database
    // since we're using mock data
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting route:", error);
    return NextResponse.json(
      { error: "Failed to delete route" },
      { status: 500 }
    );
  }
}
