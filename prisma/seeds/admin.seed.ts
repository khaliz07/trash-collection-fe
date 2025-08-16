import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedAdmin(prisma: PrismaClient) {
  try {
    console.log("🔧 Creating admin user...");

    // Hash the password
    const hashedPassword = await bcrypt.hash("password123", 12);

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: "admin123@gmail.com" },
      update: {
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
      create: {
        email: "admin123@gmail.com",
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
        status: "ACTIVE",
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("ID:", admin.id);

    return admin;
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  }
}
