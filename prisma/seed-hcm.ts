import { PrismaClient } from "@prisma/client";
import { seedHCMAreas } from "./seeds/hcm-areas.seed";
import { seedHCMRoutes, seedHCMTrashWeightData } from "./seeds/hcm-routes.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🏙️ Starting HCM test data seed...");

  // Seed HCM test data only
  await seedHCMAreas(prisma);
  await seedHCMRoutes(prisma);
  await seedHCMTrashWeightData(prisma);

  console.log("✅ HCM test data seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding HCM test data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
