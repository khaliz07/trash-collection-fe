import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-here-make-it-long-and-random-123456789";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporarily disable auth for testing
    // TODO: Re-enable authentication later
    /*
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token không hợp lệ' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Không có quyền truy cập' },
        { status: 403 }
      )
    }
    */

    const { id } = params;
    const { status, action } = await request.json();

    // Validate user exists and is not an admin
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, status: true, name: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        { message: "Không thể thay đổi trạng thái tài khoản admin" },
        { status: 403 }
      );
    }

    let newStatus = status;

    // Handle specific actions
    if (action) {
      switch (action) {
        case "suspend":
          newStatus = "SUSPENDED";
          break;
        case "activate":
          newStatus = "ACTIVE";
          break;
        case "deactivate":
          newStatus = "INACTIVE";
          break;
        default:
          return NextResponse.json(
            { message: "Hành động không hợp lệ" },
            { status: 400 }
          );
      }
    }

    // Validate status
    if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(newStatus)) {
      return NextResponse.json(
        { message: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    // Don't update if status is the same
    if (targetUser.status === newStatus) {
      return NextResponse.json(
        { message: "Trạng thái hiện tại đã là " + newStatus },
        { status: 400 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: newStatus as any,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: `Đã cập nhật trạng thái tài khoản thành ${newStatus}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { message: "Lỗi khi cập nhật trạng thái người dùng" },
      { status: 500 }
    );
  }
}
