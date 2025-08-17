import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AssignmentStatus } from "@/types/route-assignment";
import { getAuthUser, getUserId } from "@/lib/auth";

// GET - List assignments for the current collector
export async function GET(request: NextRequest) {
  console.log("=== Collector Assignments API Called ===");
  try {
    // Get current user from auth
    const authUser = getAuthUser(request);
    console.log("Auth user:", authUser);
    if (!authUser) {
      console.log("No auth user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a collector
    if (authUser.role !== "COLLECTOR") {
      console.log("User is not a collector, role:", authUser.role);
      return NextResponse.json(
        { error: "Access denied. Only collectors can access this endpoint." },
        { status: 403 }
      );
    }

    console.log("User is collector, proceeding...");
    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");
    console.log("Date param:", date);

    // Build where clause for filtering
    const where: any = {
      collector_id: authUser.userId, // Filter by current collector
    };

    // Filter by date (default to today if not provided)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.assigned_date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      where.assigned_date = {
        gte: today,
        lte: endOfToday,
      };
    }

    const assignments = await prisma.routeAssignment.findMany({
      where,
      include: {
        route: {
          select: {
            id: true,
            name: true,
            description: true,
            estimated_duration: true,
            total_distance_km: true,
            trackPoints: true,
            address: true, // Include administrative address
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
      orderBy: [
        { started_at: "asc" },
        { time_window_start: "asc" },
        { assigned_date: "asc" },
      ],
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Failed to fetch collector assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// PATCH - Update assignment status (for collector to mark progress)
export async function PATCH(request: NextRequest) {
  try {
    // Get current user from auth
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a collector
    if (authUser.role !== "COLLECTOR") {
      return NextResponse.json(
        { error: "Access denied. Only collectors can access this endpoint." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { assignmentId, status, notes, actual_distance, actual_duration, trash_weight } =
      body;

    // Validate the assignment belongs to this collector
    const assignment = await prisma.routeAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment || assignment.collector_id !== authUser.userId) {
      return NextResponse.json(
        { error: "Assignment not found or access denied" },
        { status: 404 }
      );
    }

    // Update assignment
    const updateData: any = {
      status,
      notes,
    };

    // Add trash_weight if provided
    if (trash_weight !== undefined) {
      updateData.trash_weight = trash_weight;
    }

    // Add timestamps based on status
    if (status === AssignmentStatus.IN_PROGRESS && !assignment.started_at) {
      updateData.started_at = new Date();
    } else if (status === AssignmentStatus.COMPLETED) {
      updateData.completed_at = new Date();
      if (actual_distance) updateData.actual_distance = actual_distance;
      if (actual_duration) updateData.actual_duration = actual_duration;
    }

    const updatedAssignment = await prisma.routeAssignment.update({
      where: { id: assignmentId },
      data: updateData,
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

    return NextResponse.json({ assignment: updatedAssignment });
  } catch (error) {
    console.error("Failed to update assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}
