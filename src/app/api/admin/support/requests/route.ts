import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

const updateSupportRequestSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"]).optional(),
  adminNotes: z.string().optional(),
  priority: z.enum(["NORMAL", "HIGH", "URGENT"]).optional(),
});

// GET - Lấy danh sách tất cả support requests (chỉ admin)
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const where: any = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [supportRequests, total] = await Promise.all([
      prisma.supportRequest.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          handler: {
            select: { id: true, name: true, email: true },
          },
          feedback: true,
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supportRequest.count({ where }),
    ]);

    return NextResponse.json({
      data: supportRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin support requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
