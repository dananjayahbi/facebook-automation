import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Hash the superadmin password
  const hashedPassword = await bcrypt.hash('superadmin123', 10);

  // Create superadmin user
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@dashboard.com' },
    update: {},
    create: {
      email: 'superadmin@dashboard.com',
      password: hashedPassword,
      name: 'Super Administrator',
      role: 'SUPERADMIN',
      isActive: true,
    },
  });

  console.log('✓ Superadmin created successfully');
  console.log('  Email: superadmin@dashboard.com');
  console.log('  Password: superadmin123');
  console.log('  Role: SUPERADMIN\n');

  // Create default Facebook page
  const defaultPage = await prisma.facebookPage.upsert({
    where: { id: 'default-page' },
    update: {},
    create: {
      id: 'default-page',
      name: 'Default Page',
      description: 'Default Facebook page for initial setup',
      isActive: true,
    },
  });

  console.log('✓ Default Facebook page created successfully');
  console.log('  Name: Default Page');
  console.log('  Description: Default Facebook page for initial setup\n');

  // Seed some model configurations
  // Text generation models
  await prisma.textModel.upsert({
    where: { modelId: 'gemini-1.5-flash' },
    update: {},
    create: {
      name: 'Gemini 1.5 Flash',
      modelId: 'gemini-1.5-flash',
      isDefault: true,
      isActive: true,
    },
  });

  await prisma.textModel.upsert({
    where: { modelId: 'gemini-1.5-pro' },
    update: {},
    create: {
      name: 'Gemini 1.5 Pro',
      modelId: 'gemini-1.5-pro',
      isDefault: false,
      isActive: true,
    },
  });

  console.log('✓ Text generation models seeded\n');

  // Image generation models
  await prisma.imageModel.upsert({
    where: { modelId: 'imagen-3.0-generate-001' },
    update: {},
    create: {
      name: 'Imagen 3.0',
      modelId: 'imagen-3.0-generate-001',
      isDefault: true,
      isActive: true,
    },
  });

  console.log('✓ Image generation models seeded\n');

  // Image settings
  await prisma.imageSettings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      defaultAspectRatio: '3:4',
    },
  });

  console.log('✓ Image settings seeded\n');

  // Layout settings
  await prisma.layoutSettings.upsert({
    where: { id: 'default-layout' },
    update: {},
    create: {
      id: 'default-layout',
      showGenerateContent: true,
      showViewContent: true,
      showUploadContent: true,
    },
  });

  console.log('✓ Layout settings seeded\n');

  console.log('========================================');
  console.log('✅ Database seeding completed successfully!');
  console.log('========================================');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
