/**
 * Database Migration Script: Update Image Paths for Default Page
 * 
 * This script updates the imageUrl field in the Background table from:
 *   src/assets/gen-images/{filename}.jpg
 * to:
 *   src/assets/gen-images/default-page/{filename}.jpg
 * 
 * Run this once after migrating physical image files.
 * 
 * Usage: node scripts/update-image-paths-in-db.js
 */

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();
const DEFAULT_PAGE_ID = 'default-page';

async function updateImagePaths() {
  try {
    console.log('🚀 Starting database image path update...\n');

    // Find all backgrounds with old path format (doesn't contain page folder)
    const backgrounds = await prisma.background.findMany({
      where: {
        AND: [
          {
            imageUrl: {
              startsWith: 'src/assets/gen-images/',
            },
          },
          {
            imageUrl: {
              not: {
                contains: '/default-page/',
              },
            },
          },
        ],
      },
    });

    if (backgrounds.length === 0) {
      console.log('✓ No image paths to update. All paths are already correct.\n');
      return;
    }

    console.log(`Found ${backgrounds.length} image path(s) to update:\n`);

    let updatedCount = 0;
    let errorCount = 0;

    // Update each background record
    for (const background of backgrounds) {
      try {
        // Extract filename from old path
        const filename = background.imageUrl.split('/').pop();
        const newPath = `src/assets/gen-images/${DEFAULT_PAGE_ID}/${filename}`;

        await prisma.background.update({
          where: { id: background.id },
          data: { imageUrl: newPath },
        });

        updatedCount++;
        console.log(`✓ Updated: ${background.id}`);
        console.log(`   Old: ${background.imageUrl}`);
        console.log(`   New: ${newPath}\n`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating ${background.id}:`, error.message);
      }
    }

    console.log('📊 Update Summary:');
    console.log(`   Total records found: ${backgrounds.length}`);
    console.log(`   Successfully updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);

    if (updatedCount > 0) {
      console.log('\n✅ Database update completed successfully!');
    }

  } catch (error) {
    console.error('\n❌ Database update failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run update
updateImagePaths();
