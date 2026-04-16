import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { Pool } from 'pg';

const connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed script');
}

const databaseUrl = connectionString;

const pool = new Pool({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

function isTruthy(value: string | undefined): boolean {
  return ['1', 'true', 'yes', 'on'].includes(value?.trim().toLowerCase() ?? '');
}

function isLocalDatabase(connectionUrl: string): boolean {
  try {
    const url = new URL(connectionUrl);
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

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
  const allowNonLocalSeed = isTruthy(process.env['SEED_ALLOW_NON_LOCAL_DATABASE']);
  const syncDefaultCategories = isTruthy(process.env['SEED_SYNC_DEFAULT_CATEGORIES']);
  const updateExistingAdmin = isTruthy(process.env['SEED_UPDATE_EXISTING_ADMIN']);
  const resetExistingAdminPassword = isTruthy(process.env['SEED_RESET_ADMIN_PASSWORD']);
  const adminEmail = process.env['SEED_ADMIN_EMAIL']?.trim().toLowerCase();
  const adminPassword = process.env['SEED_ADMIN_PASSWORD']?.trim();
  const adminFullName = process.env['SEED_ADMIN_NAME']?.trim() || 'System Admin';
  const adminDepartment = process.env['SEED_ADMIN_DEPARTMENT']?.trim() || 'IT';

  if (!isLocalDatabase(databaseUrl) && !allowNonLocalSeed) {
    throw new Error(
      'Refusing to seed a non-local database. Set SEED_ALLOW_NON_LOCAL_DATABASE=true to continue intentionally.',
    );
  }

  let createdCategories = 0;
  let updatedCategories = 0;

  for (const category of defaultCategories) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: category.name },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: {
          name: category.name,
          description: category.description,
        },
      });
      createdCategories += 1;
      continue;
    }

    if (!syncDefaultCategories) {
      continue;
    }

    await prisma.category.update({
      where: { id: existingCategory.id },
      data: {
        description: category.description,
        isActive: true,
      },
    });
    updatedCategories += 1;
  }

  if (!adminEmail || !adminPassword) {
    console.log(
      `Seeded categories (${createdCategories} created, ${updatedCategories} updated). Skipped admin user because SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD is missing.`,
    );
    return;
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await argon2.hash(adminPassword);

    await prisma.user.create({
      data: {
        fullName: adminFullName,
        email: adminEmail,
        passwordHash,
        department: adminDepartment,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    console.log(
      `Seeded categories (${createdCategories} created, ${updatedCategories} updated) and created admin user ${adminEmail}.`,
    );
    return;
  }

  const adminUpdateData: Prisma.UserUpdateInput = {};

  if (updateExistingAdmin) {
    adminUpdateData.fullName = adminFullName;
    adminUpdateData.department = adminDepartment;
    adminUpdateData.role = UserRole.ADMIN;
    adminUpdateData.isActive = true;
  }

  if (resetExistingAdminPassword) {
    adminUpdateData.passwordHash = await argon2.hash(adminPassword);
  }

  if (Object.keys(adminUpdateData).length > 0) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: adminUpdateData,
    });

    console.log(
      `Seeded categories (${createdCategories} created, ${updatedCategories} updated) and updated existing admin user ${adminEmail}.`,
    );
    return;
  }

  console.log(
    `Seeded categories (${createdCategories} created, ${updatedCategories} updated). Existing admin user ${adminEmail} was left unchanged.`,
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
