import { PrismaClient, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedUsers(prisma: PrismaClient) {
  console.log("👥 Creating sample users...");

  const users = [
    {
      id: "user-1",
      email: "nguyen.van.an@example.com",
      name: "Nguyễn Văn An",
      phone: "0912345678",
      address: "12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
      status: "ACTIVE" as UserStatus,
    },
    {
      id: "user-2",
      email: "tran.thi.bich@example.com",
      name: "Trần Thị Bích",
      phone: "0913456789",
      address: "45 Lê Lợi, Quận Hải Châu, Đà Nẵng",
      status: "ACTIVE" as UserStatus,
    },
    {
      id: "user-3",
      email: "le.quang.dung@example.com",
      name: "Lê Quang Dũng",
      phone: "0914567890",
      address: "78 Phan Đình Phùng, Ba Đình, Hà Nội",
      status: "SUSPENDED" as UserStatus,
    },
    {
      id: "user-4",
      email: "pham.minh.chau@example.com",
      name: "Phạm Minh Châu",
      phone: "0915678901",
      address: "23 Trần Hưng Đạo, TP. Nha Trang",
      status: "ACTIVE" as UserStatus,
    },
    {
      id: "user-5",
      email: "vo.thi.hanh@example.com",
      name: "Võ Thị Hạnh",
      phone: "0916789012",
      address: "56 Nguyễn Huệ, TP. Huế",
      status: "INACTIVE" as UserStatus,
    },
    {
      id: "user-6",
      email: "hoang.van.duc@example.com",
      name: "Hoàng Văn Đức",
      phone: "0917890123",
      address: "89 Hùng Vương, TP. Cần Thơ",
      status: "ACTIVE" as UserStatus,
    },
    {
      id: "user-7",
      email: "dao.thi.mai@example.com",
      name: "Đào Thị Mai",
      phone: "0918901234",
      address: "34 Lý Thường Kiệt, TP. Hải Phòng",
      status: "ACTIVE" as UserStatus,
    },
    {
      id: "user-8",
      email: "bui.thanh.son@example.com",
      name: "Bùi Thanh Sơn",
      phone: "0919012345",
      address: "67 Quang Trung, TP. Vinh",
      status: "SUSPENDED" as UserStatus,
    },
  ];

  const hashedPassword = await bcrypt.hash("123456", 10);

  for (const userData of users) {
    await prisma.user.upsert({
      where: { id: userData.id },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
        role: "USER",
        isEmailVerified: true,
        latitude: Math.random() * 0.1 + 10.762622, // Random coords around Ho Chi Minh City
        longitude: Math.random() * 0.1 + 106.660172,
      },
    });
  }

  console.log(`✅ Created ${users.length} sample users`);
}
