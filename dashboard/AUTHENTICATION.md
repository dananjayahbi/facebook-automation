# Authentication System Documentation

## Overview

This dashboard implements a secure, role-based authentication system using NextAuth.js with Prisma and PostgreSQL (Supabase). The system includes user registration with admin approval workflow, role-based access control, and session management.

## Features

- ✅ Secure password hashing with bcryptjs
- ✅ JWT-based session management
- ✅ Role-based access control (SUPERADMIN, ADMIN, STAFF)
- ✅ Registration request approval workflow
- ✅ User activation/deactivation
- ✅ Protected routes and API endpoints

## User Roles

### SUPERADMIN
- Full system access
- Approve/reject registration requests
- Manage all users (activate/deactivate)
- Cannot be deactivated

### ADMIN
- Access to most features
- Cannot manage users or approve registrations

### STAFF
- Basic access to the dashboard
- Limited permissions

## Initial Setup

### 1. Superadmin Account

A default superadmin account is created when you run the database seed:

```bash
npm run db:seed
```

**Default Credentials:**
- Email: `superadmin@dashboard.com`
- Password: `superadmin123`

⚠️ **IMPORTANT:** Change these credentials immediately after first login in production!

### 2. Environment Variables

Ensure these are set in your `.env.local`:

```bash
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production-minimum-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"
```

## User Registration Flow

### Step 1: User Submits Registration
1. User visits `/register`
2. Fills out registration form (name, email, password)
3. Password is validated (minimum 8 characters)
4. Request is created with `PENDING` status

### Step 2: Admin Reviews Request
1. SUPERADMIN logs in
2. Navigates to `/user-management`
3. Views pending registration requests
4. Selects role (ADMIN or STAFF) for the user
5. Approves or rejects the request

### Step 3: User Account Created
- If approved: User account is created with selected role
- If rejected: Request is marked as rejected
- User receives status update and can login if approved

## Authentication Routes

### Public Routes
- `/login` - User login page
- `/register` - New user registration

### Protected Routes
- `/dashboard` - Main dashboard (all authenticated users)
- `/user-management` - User management (SUPERADMIN only)
- All other dashboard pages (authenticated users)

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth authentication handler
- `POST /api/auth/register` - Create registration request

### Admin (SUPERADMIN only)
- `GET /api/admin/registration-requests` - Get pending requests
- `GET /api/admin/users` - Get all users
- `POST /api/admin/approve-registration` - Approve a request
- `POST /api/admin/reject-registration` - Reject a request
- `POST /api/admin/toggle-user-status` - Activate/deactivate user

## Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(STAFF)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### RegistrationRequest Model
```prisma
model RegistrationRequest {
  id          String             @id @default(cuid())
  email       String             @unique
  password    String
  name        String?
  status      RegistrationStatus @default(PENDING)
  processedAt DateTime?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}
```

## Using Authentication in Components

### Client Components

```tsx
"use client";

import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <p>Welcome, {session?.user?.name}</p>
      <p>Role: {session?.user?.role}</p>
    </div>
  );
}
```

### Server Components

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function MyServerComponent() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

### API Routes

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check role
  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  // Your logic here
}
```

## Security Best Practices

### Password Security
- Passwords are hashed using bcryptjs with salt rounds of 10
- Never store plain text passwords
- Minimum password length: 8 characters
- Consider implementing additional password requirements in production

### Session Security
- Sessions are JWT-based and stored client-side
- NEXTAUTH_SECRET must be a strong, random string
- Sessions expire automatically
- Use HTTPS in production

### Role-Based Access
- Always verify user role on the server side
- Don't rely on client-side role checks for security
- Protect API routes with proper authentication checks
- SUPERADMIN accounts cannot be deactivated

## Common Tasks

### Change User Role
Currently not implemented via UI. To change a user's role:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'user@example.com';
```

Consider adding this feature to the user management page if needed.

### Reset User Password
Not implemented. Options:
1. Add password reset functionality
2. Manually update in database:
   ```typescript
   const hashedPassword = await bcrypt.hash("newpassword", 10);
   // Update in database
   ```

### Add New User Without Approval
Use Prisma directly or create a special API endpoint:

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    role: "STAFF",
    isActive: true,
  },
});
```

## Troubleshooting

### "Invalid credentials" error
- Check email and password are correct
- Verify user exists in database
- Ensure user account is active (isActive: true)

### Cannot access user management
- Only SUPERADMIN role can access
- Verify your role in the database
- Check session is valid

### Registration not working
- Check API endpoint is accessible
- Verify database connection
- Check browser console for errors

## Production Checklist

- [ ] Change default superadmin password
- [ ] Generate strong NEXTAUTH_SECRET
- [ ] Set NEXTAUTH_URL to production domain
- [ ] Enable HTTPS
- [ ] Implement password reset functionality
- [ ] Add email notifications for registration status
- [ ] Set up proper error logging
- [ ] Add rate limiting to login/register endpoints
- [ ] Implement two-factor authentication (optional)
- [ ] Regular security audits

## Files Reference

### Configuration
- `src/lib/auth.ts` - NextAuth configuration
- `src/types/next-auth.d.ts` - TypeScript type definitions
- `src/components/wrappers/auth/AuthProvider.tsx` - Session provider

### Pages
- `src/app/(auth)/login/page.tsx` - Login page
- `src/app/(auth)/register/page.tsx` - Registration page
- `src/app/user-management/page.tsx` - User management (SUPERADMIN)

### API Routes
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `src/app/api/auth/register/route.ts` - Registration endpoint
- `src/app/api/admin/registration-requests/route.ts` - Get pending requests
- `src/app/api/admin/users/route.ts` - Get all users
- `src/app/api/admin/approve-registration/route.ts` - Approve registration
- `src/app/api/admin/reject-registration/route.ts` - Reject registration
- `src/app/api/admin/toggle-user-status/route.ts` - Toggle user status

### Database
- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - Database seeding script

### Components
- `src/components/layout/Header.tsx` - Header with user menu and logout
