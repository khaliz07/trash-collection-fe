import { PrismaClient } from "@prisma/client";

export async function seedPackages(prisma: PrismaClient) {
  console.log("Creating packages...");

  const packages = [
    {
      id: "pkg-monthly",
      name: "Gói cơ bản - 1 tháng",
      description: "Gói thu gom rác hàng tuần cơ bản",
      type: "monthly",
      duration: 1,
      price: 76000,
      monthlyEquivalent: 76000,
      collectionsPerWeek: 2,
      features: ["Thu gom 2 lần/tuần", "Hỗ trợ khách hàng"],
      tier: 1,
      status: "ACTIVE" as const,
      isPopular: false,
      displayOrder: 1,
    },
    {
      id: "pkg-quarterly",
      name: "Gói tiết kiệm - 3 tháng",
      description: "Gói thu gom rác 3 tháng với giá ưu đãi",
      type: "quarterly",
      duration: 3,
      price: 228000,
      monthlyEquivalent: 76000,
      collectionsPerWeek: 2,
      features: ["Thu gom 2 lần/tuần", "Hỗ trợ khách hàng", "Giảm giá 10%"],
      tier: 2,
      status: "ACTIVE" as const,
      isPopular: true,
      displayOrder: 2,
    },
    {
      id: "pkg-yearly",
      name: "Gói tiết kiệm - 12 tháng",
      description: "Gói thu gom rác 12 tháng với giá tốt nhất",
      type: "yearly",
      duration: 12,
      price: 912000,
      monthlyEquivalent: 76000,
      collectionsPerWeek: 2,
      features: [
        "Thu gom 2 lần/tuần",
        "Hỗ trợ khách hàng 24/7",
        "Giảm giá 20%",
        "Tư vấn môi trường",
      ],
      tier: 3,
      status: "ACTIVE" as const,
      isPopular: false,
      displayOrder: 3,
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { id: pkg.id },
      update: {},
      create: pkg,
    });
  }

  console.log("✅ Packages created successfully!");
}
