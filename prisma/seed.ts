import { PrismaClient } from "@prisma/client";
import { seedAdmin } from "./seeds/admin.seed";
import { seedPackages } from "./seeds/packages.seed";
import { seedCollectors } from "./seeds/collectors.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Seed initial data
  await seedAdmin(prisma);
  await seedPackages(prisma);
  await seedCollectors(prisma);

  // Create sample user for development
  console.log("👤 Creating sample user...");
  await prisma.user.upsert({
    where: { id: "user-1" },
    update: {},
    create: {
      id: "user-1",
      email: "user@example.com",
      password: "hashedpassword", // Note: In a real app, hash this password
      name: "Nguyễn Văn A",
      phone: "0901234567",
      role: "USER",
      address: "Phường Linh Trung, Quận Thủ Đức, TP. HCM",
    },
  });
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
