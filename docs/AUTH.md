# 🔐 Authentication with Better Auth

Complete authentication system using Better Auth with email/password, social login, and role-based access control.

## Overview

Better Auth provides a modern, type-safe authentication solution with built-in security features like rate limiting, breach detection, and session management.

## Features

✅ Email/Password authentication with OTP verification  
✅ Social authentication (Google, GitHub)  
✅ Role-based access control (Admin plugin)  
✅ Session management with Redis  
✅ Rate limiting and breach detection  
✅ CORS protection  
✅ Automatic session refresh  
✅ TypeScript-first with full type safety

## Configuration

### Environment Variables

```env
# Required
BETTER_AUTH_SECRET=your_32_char_secret_key_here  # Generate with: openssl rand -base64 32
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
DATABASE_URL=postgresql://...

# OAuth Providers (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Redis (for sessions)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### Server Configuration

Located in `src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [
    admin(), // Adds role-based access control
  ],
});
```

### Client Configuration

Located in `src/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
});
```

## Usage

### Sign Up (Email/Password)

```typescript
import { authClient } from "@/lib/auth-client";

async function signUp() {
  try {
    await authClient.signUp.email({
      email: "user@example.com",
      password: "SecurePassword123!",
      name: "John Doe",
    });
    // User created and signed in
  } catch (error) {
    console.error("Sign up failed:", error);
  }
}
```

### Sign In (Email/Password)

```typescript
async function signIn() {
  try {
    await authClient.signIn.email({
      email: "user@example.com",
      password: "SecurePassword123!",
    });
    // User signed in
  } catch (error) {
    console.error("Sign in failed:", error);
  }
}
```

### Social Authentication

```typescript
// GitHub
await authClient.signIn.social({
  provider: "github",
  callbackURL: "/dashboard",
});

// Google
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});
```

### Get Current Session

```typescript
'use client';

import { authClient } from '@/lib/auth-client';

export function UserProfile() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <p>Email: {session.user.email}</p>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

### Sign Out

```typescript
async function signOut() {
  await authClient.signOut();
  // User signed out
}
```

### Server-Side Session

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}
```

### Protected Routes

Use middleware to protect routes:

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Protect authenticated routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
```

## Database Schema

Better Auth automatically generates the required tables. Run:

```bash
bun run auth:generate
```

This creates `src/prisma/schema/auth.prisma` with:

- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth accounts
- `verification` - Email verification tokens

## OAuth Provider Setup

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Your App Name
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy **Client ID** and **Client Secret** to `.env`

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen
6. Create OAuth client:
   - **Application type**: Web application
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret** to `.env`

## Security Features

### Rate Limiting

Better Auth includes built-in rate limiting for:

- Sign in attempts: 5 per minute
- Sign up attempts: 3 per minute
- Password reset: 3 per hour

### Password Breach Detection

Automatically checks passwords against HaveIBeenPwned database during sign up.

### Session Security

- Sessions stored in Redis (not JWT)
- Automatic session refresh
- Configurable expiration
- CSRF protection

## Admin Plugin

### Check if User is Admin

```typescript
const { data: session } = authClient.useSession();

if (session?.user.role === "admin") {
  // User is admin
}
```

### Server-Side Admin Check

```typescript
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession();

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return session;
}
```

## Troubleshooting

### Session Not Persisting

1. Check Redis is running: `docker compose ps`
2. Verify `REDIS_HOST` and `REDIS_PASSWORD` in `.env`
3. Clear browser cookies and try again

### OAuth Not Working

1. Verify callback URLs match exactly (including protocol)
2. Check client IDs and secrets are correct
3. Ensure OAuth provider is enabled in auth config

### "Invalid session" Error

1. Generate new `BETTER_AUTH_SECRET`: `openssl rand -base64 32`
2. Clear all sessions in Redis: `redis-cli FLUSHDB`
3. Sign in again

## API Endpoints

Better Auth exposes these endpoints automatically:

- `POST /api/auth/sign-up/email` - Email sign up
- `POST /api/auth/sign-in/email` - Email sign in
- `POST /api/auth/sign-in/social` - Social sign in
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get session
- `POST /api/auth/reset-password` - Reset password

All endpoints are available at `/api/auth/*` and configured in `src/app/api/auth/[...all]/route.ts`.

## Best Practices

1. **Always use HTTPS in production**
2. **Generate strong `BETTER_AUTH_SECRET`** (at least 32 characters)
3. **Enable email verification** for production
4. **Use environment-specific OAuth credentials**
5. **Set secure session expiration** based on your needs
6. **Monitor failed login attempts** for security
7. **Implement 2FA** for sensitive applications (coming soon)

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [GitHub OAuth Setup](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Redis Session Store](https://redis.io/docs/manual/keyspace/)

---

[← Back to Main README](../README.md)
