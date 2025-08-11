import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      packages,
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tải danh sách gói dịch vụ",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Calculate monthly equivalent
    const monthlyEquivalent = Math.round(data.price / data.duration);

    const newPackage = await prisma.package.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        duration: data.duration,
        price: data.price,
        monthlyEquivalent: monthlyEquivalent,
        collectionsPerWeek: data.collectionsPerWeek,
        features: data.features,
        status: data.status || "ACTIVE",
        isPopular: data.isPopular || false,
        displayOrder: data.displayOrder || 0,
      },
    });

    return NextResponse.json({
      success: true,
      package: newPackage,
    });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tạo gói dịch vụ mới",
      },
      { status: 500 }
    );
  }
}
