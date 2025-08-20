import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

const createSupportRequestSchema = z.object({
  type: z.enum(["PAYMENT", "SCHEDULE", "ACCOUNT", "TECHNICAL_ISSUE", "OTHER"]),
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  priority: z.enum(["NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  attachments: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]), // Base64 encoded images
});

// GET - Lấy danh sách yêu cầu hỗ trợ của user
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.userId;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [supportRequests, total] = await Promise.all([
      prisma.supportRequest.findMany({
        where,
        include: {
          feedback: true,
          handler: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
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
    console.error("Error fetching support requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tạo yêu cầu hỗ trợ mới
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.userId;
    const body = await request.json();

    const validation = createSupportRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { type, title, description, priority, attachments, images } =
      validation.data;

    const supportRequest = await prisma.supportRequest.create({
      data: {
        userId,
        type,
        title,
        description,
        priority,
        attachments,
        images,
        status: "PENDING",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // TODO: Tạo notification cho admin
    // await createNotificationForAdmins({
    //   title: 'Yêu cầu hỗ trợ mới',
    //   message: `${supportRequest.user.name} đã gửi yêu cầu hỗ trợ: ${title}`,
    //   type: 'SUPPORT_REQUEST',
    // });

    return NextResponse.json({ data: supportRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating support request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
