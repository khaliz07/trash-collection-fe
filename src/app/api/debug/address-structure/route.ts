import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Get a few routes with address to see structure
    const routes = await prisma.route.findMany({
      where: {
        address: {
          not: Prisma.JsonNull,
        },
      },
      select: {
        id: true,
        name: true,
        address: true,
      },
      take: 5,
    });

    return NextResponse.json({
      message: "Route address structure debug",
      routes: routes.map((route) => ({
        id: route.id,
        name: route.name,
        address: route.address,
      })),
    });
  } catch (error) {
    console.error("Error debugging address structure:", error);
    return NextResponse.json({ error: "Debug failed" }, { status: 500 });
  }
}
