# Database Connection Checker & Background Images Reset

Utilities to verify database connectivity and manage background images for the Facebook Automation Dashboard.

## Tools Included

1. **check-connection.js/ts** - Verify database connectivity
2. **reset-background-images.js** - Reset BackgroundImage table and delete all image files

---

## Database Connection Checker

## Purpose

This tool checks if the database is reachable and accessible by:
- Testing the connection to the database server
- Verifying Prisma can query the database
- Counting records in key tables
- Providing diagnostic information

## How to Use

### Method 1: Using Node.js (Recommended - Fastest)

```bash
cd dashboard/Dev-Help/db-check
node check-connection.js
```

### Method 2: From dashboard root

```bash
cd dashboard
node Dev-Help/db-check/check-connection.js
```

### Method 3: Using TypeScript with tsx

```bash
cd dashboard/Dev-Help/db-check
npx tsx check-connection.ts
```

## What It Checks

1. **Database Connection**: Verifies the database server is reachable
2. **Query Execution**: Tests if Prisma can run queries
3. **Table Access**: Confirms tables exist and are accessible
4. **Record Counts**: Shows the number of users and background images

## Common Issues

### Can't reach database server

**Error**: `Can't reach database server at <host>:<port>`

**Solutions**:
1. Check if your Supabase instance is running and active
2. Verify the `DATABASE_URL` in your `.env` file
3. Ensure your network connection is stable
4. Check if the database server allows connections from your IP

### Authentication failed

**Error**: `Authentication failed`

**Solutions**:
1. Verify database credentials in `.env` file
2. Check if the database user exists and has proper permissions
3. Ensure the password is correct (no special characters causing issues)

### Missing environment variables

**Error**: `DATABASE_URL is not defined`

**Solution**: Create a `.env` file in the `dashboard` directory with:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

## Environment Variables

Required environment variables (defined in `dashboard/.env`):

- `DATABASE_URL`: PostgreSQL connection string for Supabase/Prisma

## Output Examples

### Successful Connection

```
🔍 Checking database connection...

✅ Database connection successful!
✅ Found 5 users in the database
✅ Found 12 background images in the database

📊 Database Status:
   - Connection: ✅ Connected
   - Queries: ✅ Working
   - Tables: ✅ Accessible
```

### Failed Connection

```
🔍 Checking database connection...

❌ Database connection failed!

Error details: Can't reach database server at `aws-1-ap-southeast-2.pooler.supabase.com:5432`

💡 Possible solutions:
   1. Check if your database server is running
   2. Verify DATABASE_URL in .env file
   3. Check if Supabase instance is active
   4. Verify network connection

📋 Current DATABASE_URL: postgresql://postgres.****@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

## Troubleshooting

1. **Ensure you're in the correct directory**: Run from `dashboard/` directory
2. **Check .env file exists**: The script reads from `dashboard/.env`
3. **Verify DATABASE_URL format**: Should be a valid PostgreSQL connection string
4. **Check Prisma Client is generated**: Run `npx prisma generate` if needed

## Related Commands

- Generate Prisma Client: `npx prisma generate`
- View database in browser: `npx prisma studio`
- Run migrations: `npx prisma migrate dev`
- Check migration status: `npx prisma migrate status`

---

## Background Images Reset Tool

### Purpose

This tool completely resets the background images system by:
- Deleting ALL records from the BackgroundImage table
- Deleting ALL image files from `dashboard/src/assets/background-images/`
- Providing confirmation before any destructive action

### ⚠️ WARNING

**This is a DESTRUCTIVE operation that CANNOT be undone!**

Use this tool when you need to:
- Clean up test data
- Free up Supabase storage space
- Reset the background images gallery

### How to Use

```bash
cd dashboard/Dev-Help/db-check
node reset-background-images.js
```

### Safety Features

1. **Preview**: Shows current record and file counts before deletion
2. **Confirmation Required**: Must type `DELETE ALL` exactly to proceed
3. **Summary**: Shows final status after deletion
4. **Smart Detection**: Only deletes image files (jpg, jpeg, png, webp, gif)

### Example Output

```
🗑️  Background Images Reset Tool
==================================================

⚠️  WARNING: This will:
   1. Delete ALL records from BackgroundImage table
   2. Delete ALL files from dashboard/src/assets/background-images

💀 This action CANNOT be undone!

📊 Current Status:
   - Database records: 167
   - Image files: 167

❓ Type "DELETE ALL" to proceed (or anything else to cancel): DELETE ALL

🔄 Starting deletion process...

1️⃣  Deleting database records...
   ✅ Deleted 167 records from database

2️⃣  Deleting image files...
   ✅ Deleted 167 image files

==================================================
✅ Reset completed successfully!
==================================================

📊 Final Status:
   - Database records: 0
   - Image files: 0
```

### When to Use This Tool

- **Supabase Free Tier Limits**: Clean up to stay within storage limits
- **Test Data Cleanup**: Remove test uploads during development
- **Fresh Start**: Reset the gallery to start over
- **Database Migration**: Before migrating or changing schema

### What Gets Deleted

**Database:**
- All rows in the `BackgroundImage` table
- Related foreign key references are handled automatically

**File System:**
- All image files in `dashboard/src/assets/background-images/`
- Only deletes files with extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- Other files (if any) are preserved

### What Doesn't Get Deleted

- User records
- Facebook page data
- Other uploaded content
- Quote content
- Layout settings

---

## Related Commands
