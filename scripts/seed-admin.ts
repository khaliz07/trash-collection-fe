import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminUser = {
    firstName: 'Admin',
    lastName: 'System',
    email: 'admin@trash-collection.com',
    phone: '0123456789',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  };

  const hashedPassword = await bcrypt.hash('admin123', 10);

  console.log('🌱 Creating admin user...');

  await prisma.user.upsert({
    where: { email: adminUser.email },
    update: {
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      phone: adminUser.phone,
      role: adminUser.role,
      status: adminUser.status,
    },
    create: {
      ...adminUser,
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created successfully');
  console.log('📧 Email: admin@trash-collection.com');
  console.log('🔑 Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
