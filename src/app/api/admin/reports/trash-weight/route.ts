import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface TrashWeightStats {
  administrativeArea: string;
  areaType: "province" | "district" | "ward";
  totalWeight: number;
  timePeriod: string;
  assignmentCount: number;
}

interface TrashWeightFilters {
  provinceId?: string;
  districtId?: string;
  groupTime: "day" | "week" | "month" | "year";
  startDate?: string;
  endDate?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: TrashWeightFilters = {
      provinceId: searchParams.get("provinceId") || undefined,
      districtId: searchParams.get("districtId") || undefined,
      groupTime:
        (searchParams.get("groupTime") as "day" | "week" | "month" | "year") ||
        "month",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    // Build where clause for filtering
    const whereClause: any = {
      started_at: {
        not: null,
      },
    };

    if (filters.startDate) {
      whereClause.started_at = {
        ...whereClause.started_at,
        gte: new Date(filters.startDate),
      };
    }

    if (filters.endDate) {
      whereClause.started_at = {
        ...whereClause.started_at,
        lte: new Date(filters.endDate),
      };
    }

    // Add route address filters
    if (filters.provinceId || filters.districtId) {
      whereClause.route = {
        address: {
          not: null,
        },
      };
    }

    // Fetch assignments with routes and address information
    const assignments = await prisma.routeAssignment.findMany({
      where: whereClause,
      include: {
        route: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    // Process data and group by administrative areas and time
    const stats: TrashWeightStats[] = [];
    const groupedData: { [key: string]: TrashWeightStats } = {};

    for (const assignment of assignments) {
      if (!assignment.started_at || !assignment.route.address) continue;

      // Parse trash weight data
      const trashWeightData = assignment.trash_weight as any;
      let totalWeight = 0;

      if (Array.isArray(trashWeightData)) {
        totalWeight = trashWeightData.reduce((sum: number, entry: any) => {
          return sum + (parseFloat(entry.weight) || 0);
        }, 0);
      }

      // Skip if no weight data
      if (totalWeight === 0) continue;

      const address = assignment.route.address as any;

      // Determine administrative area based on filters
      let administrativeArea = "";
      let areaType: "province" | "district" | "ward" = "province";

      if (filters.districtId) {
        // Group by ward if district is selected
        areaType = "ward";
        administrativeArea = address.ward?.name || "Không xác định";
      } else if (filters.provinceId) {
        // Group by district if only province is selected
        areaType = "district";
        administrativeArea = address.district?.name || "Không xác định";
      } else {
        // Group by province if no specific area is selected
        areaType = "province";
        administrativeArea = address.province?.name || "Không xác định";
      }

      // Apply address filters
      if (filters.provinceId && address.province?.code !== filters.provinceId) {
        continue;
      }

      if (filters.districtId && address.district?.code !== filters.districtId) {
        continue;
      }

      // Group by time period
      const date = new Date(assignment.started_at);
      let timePeriod = "";

      switch (filters.groupTime) {
        case "day":
          timePeriod = date.toISOString().split("T")[0]; // YYYY-MM-DD
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          timePeriod = `Tuần ${weekStart.toISOString().split("T")[0]}`;
          break;
        case "month":
          timePeriod = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          break;
        case "year":
          timePeriod = date.getFullYear().toString();
          break;
      }

      // Create unique key for grouping
      const key = `${administrativeArea}-${timePeriod}`;

      if (!groupedData[key]) {
        groupedData[key] = {
          administrativeArea,
          areaType,
          totalWeight: 0,
          timePeriod,
          assignmentCount: 0,
        };
      }

      groupedData[key].totalWeight += totalWeight;
      groupedData[key].assignmentCount += 1;
    }

    // Convert to array and sort
    const result = Object.values(groupedData).sort((a, b) => {
      // Sort by time period first, then by administrative area
      if (a.timePeriod !== b.timePeriod) {
        return a.timePeriod.localeCompare(b.timePeriod);
      }
      return a.administrativeArea.localeCompare(b.administrativeArea);
    });

    return NextResponse.json({
      data: result,
      summary: {
        totalAssignments: assignments.length,
        totalWeightRecorded: result.reduce(
          (sum, item) => sum + item.totalWeight,
          0
        ),
        administrativeAreas: Array.from(
          new Set(result.map((item) => item.administrativeArea))
        ).length,
        timePeriods: Array.from(new Set(result.map((item) => item.timePeriod)))
          .length,
      },
    });
  } catch (error) {
    console.error("Error fetching trash weight statistics:", error);
    return NextResponse.json(
      { error: "Không thể lấy dữ liệu thống kê khối lượng rác" },
      { status: 500 }
    );
  }
}
