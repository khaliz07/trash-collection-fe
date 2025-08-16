import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UrgencyLevel } from "@prisma/client";

// POST /api/urgent-requests - Create new urgent request
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user exists and get user details including location
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      requested_date,
      urgency_level,
      waste_description,
      pickup_address,
      pickup_lat,
      pickup_lng,
    } = body;

    // Validation
    if (!requested_date || !urgency_level || !waste_description) {
      return NextResponse.json(
        { error: "Missing required fields: requested_date, urgency_level, waste_description" },
        { status: 400 }
      );
    }

    // Validate urgency level
    if (!Object.values(UrgencyLevel).includes(urgency_level)) {
      return NextResponse.json(
        { error: "Invalid urgency level. Must be MEDIUM, HIGH, or CRITICAL" },
        { status: 400 }
      );
    }

    // Use provided location or fallback to user's location
    let finalPickupAddress = pickup_address;
    let finalPickupLat = pickup_lat;
    let finalPickupLng = pickup_lng;

    if (!pickup_address && !pickup_lat && !pickup_lng) {
      // Use user's existing location if available
      if (user.latitude && user.longitude) {
        finalPickupAddress = user.address || "User's registered address";
        finalPickupLat = user.latitude;
        finalPickupLng = user.longitude;
      } else {
        return NextResponse.json(
          { 
            error: "Location required. Please provide pickup location or update your profile with location information" 
          },
          { status: 400 }
        );
      }
    } else if (!pickup_address || pickup_lat === undefined || pickup_lng === undefined) {
      return NextResponse.json(
        { error: "Incomplete location data. Please provide pickup_address, pickup_lat, and pickup_lng" },
        { status: 400 }
      );
    }

    // Validate date is in the future
    const requestedDate = new Date(requested_date);
    if (requestedDate <= new Date()) {
      return NextResponse.json(
        { error: "Requested date must be in the future" },
        { status: 400 }
      );
    }

    // Create urgent request
    const urgentRequest = await prisma.urgentRequest.create({
      data: {
        user_id: authUser.userId,
        pickup_address: finalPickupAddress,
        pickup_lat: Number(finalPickupLat),
        pickup_lng: Number(finalPickupLng),
        requested_date: requestedDate,
        urgency_level: urgency_level as UrgencyLevel,
        waste_description,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const responseData = {
      ...urgentRequest,
      pickup_lat: Number(urgentRequest.pickup_lat),
      pickup_lng: Number(urgentRequest.pickup_lng),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Urgent request created successfully",
    });

  } catch (error) {
    console.error("Error creating urgent request:", error);
    return NextResponse.json(
      { error: "Failed to create urgent request" },
      { status: 500 }
    );
  }
}

// GET /api/urgent-requests - Get user's urgent requests
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get URL search params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      user_id: authUser.userId,
    };

    if (status) {
      where.status = status;
    }

    // Get urgent requests with pagination
    const [urgentRequests, total] = await Promise.all([
      prisma.urgentRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          collector: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          route: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.urgentRequest.count({ where }),
    ]);

    // Convert Decimal fields to numbers for JSON serialization
    const responseData = urgentRequests.map(request => ({
      ...request,
      pickup_lat: Number(request.pickup_lat),
      pickup_lng: Number(request.pickup_lng),
    }));

    return NextResponse.json({
      success: true,
      data: responseData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Error fetching urgent requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch urgent requests" },
      { status: 500 }
    );
  }
}
