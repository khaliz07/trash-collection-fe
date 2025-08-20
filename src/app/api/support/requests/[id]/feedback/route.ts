import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

const createFeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  images: z.array(z.string()).default([]), // Base64 encoded images
});

// POST - Tạo feedback cho support request
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = params.id;
    const body = await request.json();

    const validation = createFeedbackSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Kiểm tra support request có tồn tại và thuộc về user này không
    const supportRequest = await prisma.supportRequest.findUnique({
      where: { id: requestId },
      include: { feedback: true },
    });

    if (!supportRequest) {
      return NextResponse.json(
        { error: "Không tìm thấy yêu cầu hỗ trợ" },
        { status: 404 }
      );
    }

    if (supportRequest.userId !== authUser.userId) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    if (supportRequest.status !== "RESOLVED") {
      return NextResponse.json(
        { error: "Chỉ có thể đánh giá khi yêu cầu đã được giải quyết" },
        { status: 400 }
      );
    }

    if (supportRequest.feedback) {
      return NextResponse.json(
        { error: "Đã có đánh giá cho yêu cầu này" },
        { status: 400 }
      );
    }

    const { rating, comment, images } = validation.data;

    const feedback = await prisma.supportFeedback.create({
      data: {
        supportRequestId: requestId,
        rating,
        comment,
        images,
      },
    });

    return NextResponse.json({ data: feedback }, { status: 201 });
  } catch (error) {
    console.error("Error creating support feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
