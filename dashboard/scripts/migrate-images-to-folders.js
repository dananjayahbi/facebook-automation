/**
 * Migration Script: Organize Existing Images into Page-Specific Folders
 * 
 * This script moves existing images from:
 *   src/assets/gen-images/*.jpg
 * to:
 *   src/assets/gen-images/default-page/*.jpg
 * 
 * Run this once after implementing the Facebook Pages multi-tenancy feature.
 * 
 * Usage: node scripts/migrate-images-to-folders.js
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_PAGE_ID = 'default-page';
const IMAGES_DIR = path.join(__dirname, '..', 'src', 'assets', 'gen-images');
const DEFAULT_PAGE_DIR = path.join(IMAGES_DIR, DEFAULT_PAGE_ID);

async function migrateImages() {
  try {
    console.log('🚀 Starting image migration...\n');
    
    // Check if images directory exists
    if (!fs.existsSync(IMAGES_DIR)) {
      console.log('❌ Images directory not found:', IMAGES_DIR);
      return;
    }

    // Create default page directory if it doesn't exist
    if (!fs.existsSync(DEFAULT_PAGE_DIR)) {
      fs.mkdirSync(DEFAULT_PAGE_DIR, { recursive: true });
      console.log('✓ Created default page directory:', DEFAULT_PAGE_DIR);
    }

    // Get all files in the images directory
    const files = fs.readdirSync(IMAGES_DIR);
    
    // Filter only .jpg files that are directly in the root (not in subdirectories)
    const imageFiles = files.filter(file => {
      const filePath = path.join(IMAGES_DIR, file);
      const isFile = fs.statSync(filePath).isFile();
      const isJpg = file.toLowerCase().endsWith('.jpg');
      return isFile && isJpg;
    });

    if (imageFiles.length === 0) {
      console.log('✓ No images to migrate. All images are already organized.\n');
      return;
    }

    console.log(`Found ${imageFiles.length} image(s) to migrate:\n`);

    let movedCount = 0;
    let errorCount = 0;

    // Move each image
    for (const file of imageFiles) {
      const sourcePath = path.join(IMAGES_DIR, file);
      const destPath = path.join(DEFAULT_PAGE_DIR, file);

      try {
        // Check if file already exists in destination
        if (fs.existsSync(destPath)) {
          console.log(`⚠️  Skipping ${file} - already exists in destination`);
          continue;
        }

        // Move the file
        fs.renameSync(sourcePath, destPath);
        movedCount++;
        console.log(`✓ Moved: ${file}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error moving ${file}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Total images found: ${imageFiles.length}`);
    console.log(`   Successfully moved: ${movedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Skipped: ${imageFiles.length - movedCount - errorCount}`);
    
    if (movedCount > 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log(`   Images are now in: ${DEFAULT_PAGE_DIR}`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateImages();
