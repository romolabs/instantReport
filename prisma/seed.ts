import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const defaultCategories = [
  {
    name: 'Hardware',
    description: 'Computers, monitors, keyboards, peripherals, and physical devices.',
  },
  {
    name: 'Software',
    description: 'Application issues, installation requests, and software errors.',
  },
  {
    name: 'Network',
    description: 'Connectivity, Wi-Fi, VPN, and internet access problems.',
  },
  {
    name: 'Access',
    description: 'Account access, permissions, password support, and login issues.',
  },
  {
    name: 'Printer',
    description: 'Printers, scanners, toner, and document output issues.',
  },
];

async function main() {
  const adminEmail = process.env['SEED_ADMIN_EMAIL']?.trim().toLowerCase();
  const adminPassword = process.env['SEED_ADMIN_PASSWORD']?.trim();
  const adminFullName = process.env['SEED_ADMIN_NAME']?.trim() || 'System Admin';
  const adminDepartment = process.env['SEED_ADMIN_DEPARTMENT']?.trim() || 'IT';

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {
        description: category.description,
        isActive: true,
      },
      create: {
        name: category.name,
        description: category.description,
      },
    });
  }

  if (!adminEmail || !adminPassword) {
    console.log('Seeded default categories. Skipped admin user because SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD is missing.');
    return;
  }

  const passwordHash = await argon2.hash(adminPassword);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: adminFullName,
      department: adminDepartment,
      role: UserRole.ADMIN,
      isActive: true,
      passwordHash,
    },
    create: {
      fullName: adminFullName,
      email: adminEmail,
      passwordHash,
      department: adminDepartment,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log(`Seeded default categories and admin user ${adminEmail}.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
