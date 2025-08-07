import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create some test collectors with full data
  const collectors = [
    {
      firstName: 'Văn',
      lastName: 'Nguyễn',
      email: 'collector1@example.com',
      phone: '0123456789',
      role: UserRole.COLLECTOR,
      licensePlate: '29A-12345',
      status: UserStatus.ACTIVE,
      startDate: new Date('2023-01-15'),
      rating: 4.5,
      reviewCount: 32,
      cccd: '001234567890',
    },
    {
      firstName: 'Thị',
      lastName: 'Trần',
      email: 'collector2@example.com', 
      phone: '0987654321',
      role: UserRole.COLLECTOR,
      licensePlate: '29B-67890',
      status: UserStatus.ACTIVE,
      startDate: new Date('2023-03-20'),
      rating: 4.2,
      reviewCount: 28,
      cccd: '002234567890',
    },
    {
      firstName: 'Văn',
      lastName: 'Lê',
      email: 'collector3@example.com',
      phone: '0456789123',
      role: UserRole.COLLECTOR, 
      licensePlate: '29C-11111',
      status: UserStatus.INACTIVE,
      startDate: new Date('2023-06-10'),
      rating: 3.8,
      reviewCount: 15,
      cccd: '003234567890',
    },
    {
      firstName: 'Thị',
      lastName: 'Phạm',
      email: 'collector4@example.com',
      phone: '0789123456',
      role: UserRole.COLLECTOR,
      licensePlate: '29D-22222',
      status: UserStatus.SUSPENDED,
      startDate: new Date('2023-09-05'),
      rating: 3.5,
      reviewCount: 22,
      cccd: '004234567890',
    },
    {
      firstName: 'Văn',
      lastName: 'Hoàng',
      email: 'collector5@example.com',
      phone: '0321654987',
      role: UserRole.COLLECTOR,
      licensePlate: '29E-33333',
      status: UserStatus.ACTIVE,
      startDate: new Date('2024-05-01'),
      rating: 4.8,
      reviewCount: 45,
      cccd: '005234567890',
    }
  ];

  const hashedPassword = await bcrypt.hash('123456', 10);

  console.log('🌱 Starting to seed collectors...');

  for (const collector of collectors) {
    await prisma.user.upsert({
      where: { email: collector.email },
      update: {
        firstName: collector.firstName,
        lastName: collector.lastName,
        phone: collector.phone,
        role: collector.role,
        status: collector.status,
        licensePlate: collector.licensePlate,
        startDate: collector.startDate,
        rating: collector.rating,
        reviewCount: collector.reviewCount,
        cccd: collector.cccd,
      },
      create: {
        ...collector,
        password: hashedPassword,
      },
    });
    console.log(`✅ Created/Updated collector: ${collector.lastName} ${collector.firstName}`);
  }

  console.log('✅ Seeded collectors successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding collectors:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
