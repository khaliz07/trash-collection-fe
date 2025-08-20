import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

const updateSupportRequestSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"]).optional(),
  adminNotes: z.string().optional(),
  priority: z.enum(["NORMAL", "HIGH", "URGENT"]).optional(),
  adminResponse: z.string().optional(), // Admin's response to user
});

// PUT - Cập nhật support request (chỉ admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = params.id;
    const body = await request.json();

    const validation = updateSupportRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (validation.data.status) {
      updateData.status = validation.data.status;
      if (
        validation.data.status === "RESOLVED" ||
        validation.data.status === "REJECTED"
      ) {
        updateData.resolvedAt = new Date();
        updateData.handlerId = authUser.userId;
      }
    }

    if (validation.data.adminNotes !== undefined) {
      updateData.adminNotes = validation.data.adminNotes;
    }

    if (validation.data.priority) {
      updateData.priority = validation.data.priority;
    }

    if (validation.data.adminResponse !== undefined) {
      updateData.adminResponse = validation.data.adminResponse;
      if (validation.data.adminResponse) {
        updateData.adminResponseAt = new Date();
        updateData.handlerId = authUser.userId;
      }
    }

    const supportRequest = await prisma.supportRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        handler: {
          select: { id: true, name: true, email: true },
        },
        feedback: true,
      },
    });

    // TODO: Tạo notification cho user khi status thay đổi
    // if (validation.data.status) {
    //   await createNotificationForUser({
    //     userId: supportRequest.userId,
    //     title: 'Cập nhật yêu cầu hỗ trợ',
    //     message: `Yêu cầu hỗ trợ của bạn đã được ${getStatusText(validation.data.status)}`,
    //   });
    // }

    return NextResponse.json({ data: supportRequest });
  } catch (error) {
    console.error("Error updating support request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
