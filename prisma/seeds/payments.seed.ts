import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedPayments() {
  console.log("🌱 Seeding payments...");

  try {
    // Get some users and packages for payments
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      take: 5,
    });

    const packages = await prisma.package.findMany({
      take: 3,
    });

    if (users.length === 0 || packages.length === 0) {
      console.log("❌ No users or packages found for payment seeding");
      return;
    }

    // Create payment data
    const paymentData = [
      {
        userId: users[0].id,
        packageId: packages[0].id,
        amount: packages[0].price,
        status: "COMPLETED" as const,
        paymentMethod: "VNPAY" as const,
        transactionId: "TXN-2025-001",
        externalId: "VNPAY-001",
        paidAt: new Date("2025-08-15"),
        coveredMonths: ["2025-08"],
        expiresAt: new Date("2025-09-15"),
      },
      {
        userId: users[1].id,
        packageId: packages[1].id,
        amount: packages[1].price,
        status: "COMPLETED" as const,
        paymentMethod: "BANK_TRANSFER" as const,
        transactionId: "TXN-2025-002",
        externalId: "BANK-002",
        paidAt: new Date("2025-08-16"),
        coveredMonths: ["2025-08"],
        expiresAt: new Date("2025-09-16"),
      },
      {
        userId: users[2].id,
        packageId: packages[0].id,
        amount: packages[0].price,
        status: "PENDING" as const,
        paymentMethod: "E_WALLET" as const,
        transactionId: "TXN-2025-003",
        paidAt: new Date("2025-08-17"),
        coveredMonths: ["2025-08"],
        expiresAt: new Date("2025-09-17"),
      },
      {
        userId: users[3].id,
        packageId: packages[2].id,
        amount: packages[2].price,
        status: "FAILED" as const,
        paymentMethod: "CARD" as const,
        transactionId: "TXN-2025-004",
        failureReason: "Thẻ hết hạn",
        paidAt: new Date("2025-08-18"),
        coveredMonths: ["2025-08"],
        expiresAt: new Date("2025-09-18"),
      },
      {
        userId: users[4].id,
        packageId: packages[1].id,
        amount: packages[1].price,
        status: "COMPLETED" as const,
        paymentMethod: "CASH" as const,
        transactionId: "TXN-2025-005",
        paidAt: new Date("2025-08-19"),
        coveredMonths: ["2025-08"],
        expiresAt: new Date("2025-09-19"),
      },
      {
        userId: users[0].id,
        packageId: packages[0].id,
        amount: packages[0].price,
        status: "COMPLETED" as const,
        paymentMethod: "VNPAY" as const,
        transactionId: "TXN-2025-006",
        externalId: "VNPAY-006",
        paidAt: new Date("2025-08-10"),
        coveredMonths: ["2025-07"],
        expiresAt: new Date("2025-08-10"),
      },
      {
        userId: users[1].id,
        packageId: packages[2].id,
        amount: packages[2].price,
        status: "REFUNDED" as const,
        paymentMethod: "BANK_TRANSFER" as const,
        transactionId: "TXN-2025-007",
        refundedAt: new Date("2025-08-12"),
        refundAmount: packages[2].price,
        paidAt: new Date("2025-08-11"),
        coveredMonths: ["2025-07"],
        expiresAt: new Date("2025-08-11"),
      },
      {
        userId: users[2].id,
        packageId: packages[1].id,
        amount: packages[1].price,
        status: "CANCELLED" as const,
        paymentMethod: "E_WALLET" as const,
        transactionId: "TXN-2025-008",
        paidAt: new Date("2025-08-20"),
        coveredMonths: ["2025-08"],
        expiresAt: new Date("2025-09-20"),
      },
    ];

    // Create payments
    for (const payment of paymentData) {
      await prisma.payment.upsert({
        where: { transactionId: payment.transactionId },
        update: payment,
        create: payment,
      });
    }

    console.log("✅ Payment seeding completed");
    console.log(`📊 Created ${paymentData.length} payments`);
  } catch (error) {
    console.error("❌ Error seeding payments:", error);
    throw error;
  }
}

if (require.main === module) {
  seedPayments()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
