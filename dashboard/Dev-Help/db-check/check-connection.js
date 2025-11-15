const path = require('path');

// Import Prisma Client from the custom generated location
const { PrismaClient } = require(path.resolve(__dirname, '../../src/generated/prisma'));

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...\n');
  
  try {
    // Test connection by running a simple query
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Try to fetch some data to verify full connectivity
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in the database`);
    
    const backgroundImageCount = await prisma.backgroundImage.count();
    console.log(`✅ Found ${backgroundImageCount} background images in the database`);
    
    console.log('\n📊 Database Status:');
    console.log('   - Connection: ✅ Connected');
    console.log('   - Queries: ✅ Working');
    console.log('   - Tables: ✅ Accessible');
    
  } catch (error) {
    console.error('❌ Database connection failed!\n');
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      
      // Check for common error types
      if (error.message.includes('Can\'t reach database server')) {
        console.error('\n💡 Possible solutions:');
        console.error('   1. Check if your database server is running');
        console.error('   2. Verify DATABASE_URL in .env file');
        console.error('   3. Check if Supabase instance is active');
        console.error('   4. Verify network connection');
      } else if (error.message.includes('authentication failed')) {
        console.error('\n💡 Possible solutions:');
        console.error('   1. Verify database credentials in .env');
        console.error('   2. Check if database user has proper permissions');
      }
    }
    
    console.error('\n📋 Current DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkDatabaseConnection()
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
