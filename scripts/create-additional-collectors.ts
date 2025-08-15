import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdditionalCollectors() {
  try {
    console.log("🔍 Checking existing collectors...");

    const existingCollectors = await prisma.user.findMany({
      where: { role: "COLLECTOR" },
      select: { id: true, name: true, email: true, phone: true },
    });

    console.log(`📊 Found ${existingCollectors.length} existing collectors:`);
    existingCollectors.forEach((collector, index) => {
      console.log(`${index + 1}. ${collector.name} - ${collector.phone}`);
    });

    // Create additional collectors
    const newCollectors = [
      {
        email: "collector.an@trash.com",
        name: "Nguyễn Văn An",
        phone: "0901234567",
        licensePlate: "TP-123456",
        address: "Quận 1, TP.HCM",
        cccd: "079087001234",
      },
      {
        email: "collector.binh@trash.com",
        name: "Trần Thị Bình",
        phone: "0901234568",
        licensePlate: "TP-234567",
        address: "Quận 3, TP.HCM",
        cccd: "079087001235",
      },
      {
        email: "collector.cuong@trash.com",
        name: "Lê Văn Cường",
        phone: "0901234569",
        licensePlate: "TP-345678",
        address: "Quận 5, TP.HCM",
        cccd: "079087001236",
      },
      {
        email: "collector.duc@trash.com",
        name: "Phạm Minh Đức",
        phone: "0901234570",
        licensePlate: "TP-456789",
        address: "Quận 7, TP.HCM",
        cccd: "079087001237",
      },
    ];

    const hashedPassword = await bcrypt.hash("123456", 12);

    console.log("\n🚀 Creating new collectors...");

    for (const collectorData of newCollectors) {
      // Check if collector already exists
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ email: collectorData.email }, { phone: collectorData.phone }],
        },
      });

      if (existing) {
        console.log(`⚠️  Skipping ${collectorData.name} - already exists`);
        continue;
      }

      const collector = await prisma.user.create({
        data: {
          ...collectorData,
          password: hashedPassword,
          role: "COLLECTOR",
          status: "ACTIVE",
          isEmailVerified: true,
        },
      });

      console.log(`✅ Created: ${collector.name} (${collector.phone})`);
    }

    // Show final count
    const finalCount = await prisma.user.count({
      where: { role: "COLLECTOR" },
    });

    console.log(`\n🎉 Total collectors in database: ${finalCount}`);
  } catch (error) {
    console.error("❌ Error creating collectors:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdditionalCollectors();
