const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Import Prisma Client from the custom generated location
const { PrismaClient } = require(path.resolve(__dirname, '../../src/generated/prisma'));

const prisma = new PrismaClient();

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetBackgroundImages() {
  console.log('\n🗑️  Background Images Reset Tool');
  console.log('=' .repeat(50));
  console.log('\n⚠️  WARNING: This will:');
  console.log('   1. Delete ALL records from BackgroundImage table');
  console.log('   2. Delete ALL files from dashboard/src/assets/background-images');
  console.log('\n💀 This action CANNOT be undone!\n');

  try {
    // First, get current count
    const imageCount = await prisma.backgroundImage.count();
    
    // Get image directory path
    const imagesDir = path.resolve(__dirname, '../../src/assets/background-images');
    let fileCount = 0;
    
    // Count files in directory
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      fileCount = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      }).length;
    }

    console.log('📊 Current Status:');
    console.log(`   - Database records: ${imageCount}`);
    console.log(`   - Image files: ${fileCount}`);
    console.log();

    if (imageCount === 0 && fileCount === 0) {
      console.log('✅ Nothing to delete. Tables and directory are already empty.');
      await prisma.$disconnect();
      rl.close();
      return;
    }

    // Ask for confirmation
    rl.question('❓ Type "DELETE ALL" to proceed (or anything else to cancel): ', async (answer) => {
      if (answer.trim() !== 'DELETE ALL') {
        console.log('\n❌ Operation cancelled. No changes were made.');
        await prisma.$disconnect();
        rl.close();
        return;
      }

      console.log('\n🔄 Starting deletion process...\n');

      // Step 1: Delete database records
      try {
        console.log('1️⃣  Deleting database records...');
        const deletedRecords = await prisma.backgroundImage.deleteMany({});
        console.log(`   ✅ Deleted ${deletedRecords.count} records from database`);
      } catch (error) {
        console.error('   ❌ Error deleting database records:', error.message);
      }

      // Step 2: Delete image files
      if (fs.existsSync(imagesDir)) {
        try {
          console.log('\n2️⃣  Deleting image files...');
          const files = fs.readdirSync(imagesDir);
          let deletedFiles = 0;
          
          files.forEach(file => {
            const filePath = path.join(imagesDir, file);
            const ext = path.extname(file).toLowerCase();
            
            // Only delete image files
            if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
              try {
                fs.unlinkSync(filePath);
                deletedFiles++;
              } catch (err) {
                console.error(`   ⚠️  Failed to delete ${file}:`, err.message);
              }
            }
          });
          
          console.log(`   ✅ Deleted ${deletedFiles} image files`);
        } catch (error) {
          console.error('   ❌ Error deleting files:', error.message);
        }
      } else {
        console.log('\n2️⃣  Image directory does not exist. Skipping file deletion.');
      }

      console.log('\n' + '='.repeat(50));
      console.log('✅ Reset completed successfully!');
      console.log('='.repeat(50) + '\n');
      
      // Verify the cleanup
      const remainingCount = await prisma.backgroundImage.count();
      console.log('📊 Final Status:');
      console.log(`   - Database records: ${remainingCount}`);
      
      if (fs.existsSync(imagesDir)) {
        const remainingFiles = fs.readdirSync(imagesDir).filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        }).length;
        console.log(`   - Image files: ${remainingFiles}`);
      } else {
        console.log(`   - Image files: 0`);
      }

      await prisma.$disconnect();
      rl.close();
    });

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    await prisma.$disconnect();
    rl.close();
    process.exit(1);
  }
}

// Run the reset
resetBackgroundImages();
