import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/admin/schedules - Get all schedules from database
export async function GET(request: NextRequest) {
  try {
    // Get collections with related data (collector, schedule only - customer & subscription removed)
    const collections = await prisma.collection.findMany({
      include: {
        collector: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            rating: true,
            reviewCount: true,
            licensePlate: true,
          },
        },
        schedule: {
          select: {
            id: true,
            frequency: true,
            dayOfWeek: true,
            timeSlot: true,
            pickupAddress: true,
            latitude: true,
            longitude: true,
            instructions: true,
          },
        },
        feedback: true,
        payment: true,
        routeProgress: true,
      },
      orderBy: {
        scheduledDate: "desc",
      },
      take: 50, // Limit to recent 50 collections
    });

    // Transform to Schedule format for frontend
    const schedules = collections.map((collection) => ({
      id: collection.id,
      code: `COL-${collection.id.slice(-6).toUpperCase()}`,
      collector: collection.collector || {
        id: "unassigned",
        name: "Chưa phân công",
        email: "",
        phone: "",
        avatar: "/images/default-avatar.png",
        rating: 0,
        reviewCount: 0,
        licensePlate: "",
      },
      status: collection.status,
      scheduledDate: collection.scheduledDate,
      startTime: collection.scheduledDate,
      endTime: collection.completedAt || collection.scheduledDate,
      note: collection.notes || collection.schedule?.instructions || "",
      route: {
        points: collection.schedule
          ? [
              {
                id: "start",
                address: collection.pickupAddress,
                lat: collection.latitude,
                lng: collection.longitude,
                type: "pickup" as const,
              },
            ]
          : [],
      },
      attachments: [], // Collections don't have attachments in current schema
      estimatedDuration: collection.estimatedDuration || 60,
      actualDuration: collection.actualDuration,
      pickupAddress: collection.pickupAddress,
      latitude: collection.latitude,
      longitude: collection.longitude,
      basePrice: collection.basePrice,
      totalAmount: collection.totalAmount,
    }));

    return NextResponse.json({
      schedules,
      total: schedules.length,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch schedules",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
