import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/admin/assignments/[id] - Get specific assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignment = await prisma.routeAssignment.findUnique({
      where: { id: params.id },
      include: {
        route: {
          select: {
            id: true,
            name: true,
            description: true,
            estimated_duration: true,
            total_distance_km: true,
            trackPoints: true,
          },
        },
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cccd: true,
            licensePlate: true,
            rating: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/assignments/[id] - Update assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log("Updating assignment with ID:", params.id, "data:", body);

    // Check if assignment exists
    const existingAssignment = await prisma.routeAssignment.findUnique({
      where: { id: params.id },
    });

    if (!existingAssignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // If updating route_id, verify route exists
    if (body.route_id) {
      const route = await prisma.route.findUnique({
        where: { id: body.route_id },
      });

      if (!route) {
        return NextResponse.json(
          { error: "Route not found" },
          { status: 400 }
        );
      }
    }

    // If updating collector_id, verify collector exists
    if (body.collector_id) {
      const collector = await prisma.user.findUnique({
        where: { id: body.collector_id },
      });

      if (!collector) {
        return NextResponse.json(
          { error: "Collector not found" },
          { status: 400 }
        );
      }
    }

    // Update assignment in database
    const updatedAssignment = await prisma.routeAssignment.update({
      where: { id: params.id },
      data: {
        ...(body.route_id && { route_id: body.route_id }),
        ...(body.collector_id && { collector_id: body.collector_id }),
        ...(body.assigned_date && { assigned_date: new Date(body.assigned_date) }),
        ...(body.status && { status: body.status }),
        ...(body.time_window_start && { time_window_start: body.time_window_start }),
        ...(body.time_window_end && { time_window_end: body.time_window_end }),
        ...(body.started_at !== undefined && { 
          started_at: body.started_at ? new Date(body.started_at) : null 
        }),
        ...(body.completed_at !== undefined && { 
          completed_at: body.completed_at ? new Date(body.completed_at) : null 
        }),
        ...(body.actual_distance !== undefined && { actual_distance: body.actual_distance }),
        ...(body.actual_duration !== undefined && { actual_duration: body.actual_duration }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: {
        route: {
          select: {
            id: true,
            name: true,
            description: true,
            estimated_duration: true,
            total_distance_km: true,
            trackPoints: true,
          },
        },
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cccd: true,
            licensePlate: true,
            rating: true,
          },
        },
      },
    });

    console.log("Assignment updated successfully:", updatedAssignment);
    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/assignments/[id] - Delete assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if assignment exists
    const existingAssignment = await prisma.routeAssignment.findUnique({
      where: { id: params.id },
    });

    if (!existingAssignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Delete the assignment
    await prisma.routeAssignment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
