import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/admin/routes/[id]/urgent - Assign urgent request to route
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { urgentId } = body;

    console.log(`Assigning urgent request ${urgentId} to route ${params.id}`);

    // For now, return success without actually updating database
    // since we're using mock data
    const result = {
      success: true,
      routeId: params.id,
      urgentId: urgentId,
      assignedAt: new Date(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error assigning urgent request:", error);
    return NextResponse.json(
      { error: "Failed to assign urgent request" },
      { status: 500 }
    );
  }
}
