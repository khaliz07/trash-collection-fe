import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AssignmentStatus } from '@/types/route-assignment';

// GET - List all assignments
export async function GET() {
  try {
    const assignments = await prisma.routeAssignment.findMany({
      include: {
        route: {
          select: {
            id: true,
            name: true,
            description: true,
            estimated_duration: true,
            total_distance_km: true,
            trackPoints: true
          }
        },
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cccd: true,
            licensePlate: true,
            rating: true
          }
        }
      },
      orderBy: {
        assigned_date: 'desc'
      }
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST - Create new assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { route_id, collector_id, assigned_date, time_window_start, time_window_end, status, notes } = body;

    // Validate required fields
    if (!route_id || !collector_id || !assigned_date || !time_window_start || !time_window_end) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify route exists
    const route = await prisma.route.findUnique({
      where: { id: route_id }
    });

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    // Verify collector exists
    const collector = await prisma.user.findFirst({
      where: { 
        id: collector_id,
        role: 'COLLECTOR'
      }
    });

    if (!collector) {
      return NextResponse.json(
        { error: 'Collector not found' },
        { status: 404 }
      );
    }

    // Create assignment
    const assignment = await prisma.routeAssignment.create({
      data: {
        route_id,
        collector_id,
        assigned_date: new Date(assigned_date),
        time_window_start,
        time_window_end,
        status: status || AssignmentStatus.PENDING,
        notes
      },
      include: {
        route: {
          select: {
            id: true,
            name: true,
            description: true,
            estimated_duration: true,
            total_distance_km: true,
            trackPoints: true
          }
        },
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cccd: true,
            licensePlate: true,
            rating: true
          }
        }
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Failed to create route assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create route assignment', details: error },
      { status: 500 }
    );
  }
}

// PUT - Update assignment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const existingAssignment = await prisma.routeAssignment.findUnique({
      where: { id }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Update assignment
    const assignment = await prisma.routeAssignment.update({
      where: { id },
      data: {
        ...updateData,
        // Convert date strings to Date objects if present
        ...(updateData.assigned_date && { assigned_date: new Date(updateData.assigned_date) }),
        ...(updateData.started_at && { started_at: new Date(updateData.started_at) }),
        ...(updateData.completed_at && { completed_at: new Date(updateData.completed_at) }),
        updatedAt: new Date()
      },
      include: {
        route: {
          select: {
            id: true,
            name: true,
            description: true,
            estimated_duration: true,
            total_distance_km: true,
            trackPoints: true
          }
        },
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cccd: true,
            licensePlate: true,
            rating: true
          }
        }
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Failed to update assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update assignment', details: error },
      { status: 500 }
    );
  }
}

// DELETE - Delete assignment (only if PENDING)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    // Check if assignment exists and get its status
    const existingAssignment = await prisma.routeAssignment.findUnique({
      where: { id }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Only allow deletion if status is PENDING
    if (existingAssignment.status !== AssignmentStatus.PENDING) {
      return NextResponse.json(
        { 
          error: 'Cannot delete assignment', 
          message: 'Chỉ có thể xóa lịch trình ở trạng thái CHUẨN BỊ' 
        },
        { status: 400 }
      );
    }

    // Delete assignment
    await prisma.routeAssignment.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Assignment deleted successfully' 
    });
  } catch (error) {
    console.error('Failed to delete assignment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assignment', details: error },
      { status: 500 }
    );
  }
}
