import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Lấy danh sách FAQ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = { isActive: true };

    if (category && category !== "all") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { question: { contains: search, mode: "insensitive" } },
        { answer: { contains: search, mode: "insensitive" } },
      ];
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ data: faqs });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
