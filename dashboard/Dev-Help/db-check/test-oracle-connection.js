const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Import Prisma Client from the custom generated location
const { PrismaClient } = require(path.resolve(__dirname, '../../src/generated/prisma'));

const prisma = new PrismaClient();

async function testOracleConnection() {
  console.log('🔍 Testing Oracle Cloud PostgreSQL connection...\n');
  
  console.log('📋 Connection Details:');
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    // Parse and display connection info (masking password)
    const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (urlMatch) {
      const [, user, , host, port, database] = urlMatch;
      console.log(`   - Host: ${host}`);
      console.log(`   - Port: ${port}`);
      console.log(`   - Database: ${database}`);
      console.log(`   - User: ${user}`);
      console.log(`   - Password: ****\n`);
    }
  } else {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
  }

  try {
    // Step 1: Test basic connection
    console.log('1️⃣  Testing basic connection...');
    await prisma.$connect();
    console.log('   ✅ Connection successful!\n');

    // Step 2: Check if migrations are applied
    console.log('2️⃣  Checking database schema...');
    try {
      const tableCheck = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      
      console.log(`   ✅ Found ${tableCheck.length} tables in the database`);
      
      if (tableCheck.length > 0) {
        console.log('   📋 Tables:');
        tableCheck.forEach((row) => {
          console.log(`      - ${row.table_name}`);
        });
      } else {
        console.log('   ⚠️  No tables found. You may need to run migrations.');
      }
    } catch (error) {
      console.error('   ⚠️  Could not check schema:', error.message);
    }

    console.log();

    // Step 3: Try to query data (if tables exist)
    try {
      console.log('3️⃣  Testing data queries...');
      
      const userCount = await prisma.user.count();
      console.log(`   ✅ Users table accessible: ${userCount} records`);
      
      const backgroundImageCount = await prisma.backgroundImage.count();
      console.log(`   ✅ BackgroundImage table accessible: ${backgroundImageCount} records`);
      
      console.log('\n📊 Database Status:');
      console.log('   - Connection: ✅ Connected');
      console.log('   - Schema: ✅ Exists');
      console.log('   - Queries: ✅ Working');
      console.log('   - Tables: ✅ Accessible');
      
      console.log('\n✅ Oracle Cloud PostgreSQL is ready to use!');
      
    } catch (error) {
      console.error('\n⚠️  Tables exist but cannot query data:', error.message);
      console.log('\n💡 You may need to:');
      console.log('   1. Run migrations: npx prisma migrate deploy');
      console.log('   2. Or reset the database: npx prisma migrate reset');
      console.log('   3. Then seed the database: npx prisma db seed');
    }

  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Possible issues:');
      console.error('   1. Database server is not running');
      console.error('   2. Firewall blocking port 5432');
      console.error('   3. Incorrect host or port in DATABASE_URL');
    } else if (error.message.includes('authentication failed') || error.message.includes('password')) {
      console.error('\n💡 Possible issues:');
      console.error('   1. Incorrect username or password');
      console.error('   2. User does not have access to the database');
      console.error('   3. Password needs to be URL-encoded if it contains special characters');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Possible issues:');
      console.error('   1. Network connectivity issues');
      console.error('   2. Database server is down');
      console.error('   3. Security group/firewall rules blocking access');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testOracleConnection();
