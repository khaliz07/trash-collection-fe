import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/admin/seed-schedules - Seed sample schedules data for testing
export async function POST(request: NextRequest) {
  try {
    console.log("Starting to seed schedules data...");

    // First, let's create a test user (customer)
    const customer = await prisma.user.upsert({
      where: { email: "customer@test.com" },
      update: {},
      create: {
        email: "customer@test.com",
        password: "hashedpassword",
        name: "Nguyễn Văn Test",
        phone: "0901234567",
        role: "USER",
        address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
        latitude: 10.7769,
        longitude: 106.7009,
      },
    });

    // Create a test collector
    const collector = await prisma.user.upsert({
      where: { email: "collector@test.com" },
      update: {},
      create: {
        email: "collector@test.com",
        password: "hashedpassword",
        name: "Trần Văn Collector",
        phone: "0901234568",
        role: "COLLECTOR",
        licensePlate: "59A-12345",
        rating: 4.5,
        reviewCount: 28,
      },
    });

    // Create a test package
    const testPackage = await prisma.package.upsert({
      where: { id: "test-package-1" },
      update: {},
      create: {
        id: "test-package-1",
        name: "Gói Cơ Bản",
        description: "Thu gom rác thải sinh hoạt 2 lần/tuần",
        type: "BASIC",
        duration: 30,
        price: 150000,
        monthlyEquivalent: 150000,
        collectionsPerWeek: 2,
        features: [
          "Thu gom 2 lần/tuần",
          "Hỗ trợ phân loại",
          "Báo cáo hàng tháng",
        ],
      },
    });

    // Create a test subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: customer.id,
        packageId: testPackage.id,
        startMonth: "2024-08",
        endMonth: "2024-12",
        status: "ACTIVE",
        activatedAt: new Date(),
      },
    });

    // Create a test schedule
    const schedule = await prisma.schedule.create({
      data: {
        customerId: customer.id,
        subscriptionId: subscription.id,
        frequency: "WEEKLY",
        dayOfWeek: 2, // Tuesday
        timeSlot: "08:00-12:00",
        pickupAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
        latitude: 10.7769,
        longitude: 106.7009,
        instructions: "Đặt thùng rác ở cửa chính",
      },
    });

    // Create sample collections
    const collections = [];
    for (let i = 0; i < 10; i++) {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() - i * 3); // Every 3 days back

      const collection = await prisma.collection.create({
        data: {
          customerId: customer.id,
          collectorId: i % 3 === 0 ? collector.id : null, // Some assigned, some not
          subscriptionId: subscription.id,
          scheduleId: schedule.id,
          status: i === 0 ? "SCHEDULED" : i < 3 ? "IN_PROGRESS" : "COMPLETED",
          scheduledDate: scheduledDate,
          startedAt: i < 8 ? scheduledDate : null,
          completedAt:
            i < 7
              ? new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000)
              : null, // +2 hours
          estimatedDuration: 60,
          actualDuration: i < 7 ? 45 + Math.floor(Math.random() * 30) : null,
          pickupAddress: `${123 + i} Nguyễn Huệ, Quận 1, TP.HCM`,
          latitude: 10.7769 + (Math.random() - 0.5) * 0.01,
          longitude: 106.7009 + (Math.random() - 0.5) * 0.01,
          wasteTypes: ["household", "recyclable"],
          estimatedWeight: 5 + Math.random() * 10,
          actualWeight: i < 7 ? 4 + Math.random() * 12 : null,
          itemsCount: Math.floor(2 + Math.random() * 5),
          notes: i === 0 ? "Khách hàng yêu cầu thu gom sớm" : null,
          basePrice: 50000,
          totalAmount: 50000,
        },
      });

      collections.push(collection);
    }

    console.log(`Created ${collections.length} sample collections`);

    return NextResponse.json({
      success: true,
      message: `Đã tạo ${collections.length} lịch trình mẫu`,
      data: {
        customer: customer.id,
        collector: collector.id,
        collections: collections.length,
      },
    });
  } catch (error) {
    console.error("Error seeding schedules:", error);
    return NextResponse.json(
      {
        error: "Failed to seed schedules",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
