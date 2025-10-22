# 🏗️ Architecture Documentation

System architecture, design decisions, and technical overview of the Next.js starter kit.

## System Overview

This is a full-stack Next.js 15 application built with modern best practices, featuring authentication, database, file storage, job queues, analytics, and internationalization.

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App (Port 3000)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App Router (React 19 Server Components)             │  │
│  │  - (admin)/   Protected admin routes                 │  │
│  │  - (auth)/    Authentication pages                   │  │
│  │  - api/       API routes (Better Auth)               │  │
│  │  - rpc/       oRPC endpoints                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Client-Side                                          │  │
│  │  - PostHog (Analytics)                               │  │
│  │  - TanStack Query (Data fetching)                    │  │
│  │  - next-intl (i18n)                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────┬─────────────────┘
             │                            │
             ├────────────┐               ├────────────┐
             ▼            ▼               ▼            ▼
      ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
      │PostgreSQL│  │  Redis   │  │  MinIO   │  │ PostHog  │
      │(Port 5432│  │(Port 6379│  │(Port 9000│  │  Cloud   │
      │          │  │          │  │   9001)  │  │          │
      └──────────┘  └──────────┘  └──────────┘  └──────────┘
           │              │              │
           │              │              │
      Database      Cache & Jobs   File Storage
```

## Tech Stack Layers

### 1. Frontend Layer

**Framework**: Next.js 15 with Turbopack
- Server Components for server-side rendering
- Client Components for interactivity
- App Router for file-based routing
- React 19 for latest React features

**Styling**: Tailwind CSS 4
- Utility-first CSS framework
- PostCSS for processing
- Dark mode support
- Custom animations

**UI Components**: shadcn/ui + Radix UI
- Accessible components
- Customizable with Tailwind
- No runtime JS overhead
- Copy-paste component model

**State Management**:
- TanStack Query for server state
- React hooks for local state
- No global state management library needed

### 2. Backend Layer

**API**: oRPC
- Type-safe RPC framework
- No code generation
- TanStack Query integration
- Better than tRPC for App Router

**Authentication**: Better Auth
- Email/Password + OAuth
- Role-based access control
- Session management
- Rate limiting

**Database**: Prisma 6 + PostgreSQL 16
- Type-safe ORM
- Automatic migrations
- Multi-schema architecture
- Connection pooling

**Job Queue**: BullMQ
- Redis-backed job queue
- Worker processing
- Scheduled jobs (cron)
- Parent-child job flows

**File Storage**: MinIO
- S3-compatible object storage
- Self-hosted
- Bucket management
- Presigned URLs

**Cache & Sessions**: Redis 7
- Session storage
- Cache manager
- Rate limiting
- Job queue backend

**Analytics**: PostHog
- Event tracking
- User analytics
- Session recording
- Feature flags

**i18n**: next-intl
- Multi-language support
- Server & client translations
- RTL support
- Cookie persistence

### 3. Infrastructure Layer

**Runtime**: Bun
- Fast package manager
- JavaScript runtime
- Test runner
- Bundler

**Containerization**: Docker Compose
- PostgreSQL container
- Redis container
- MinIO container
- Network orchestration

**Type Safety**: TypeScript 5
- End-to-end type safety
- Strict mode enabled
- Path aliases
- Type inference

**Validation**: Zod
- Schema validation
- Type inference
- Error messages
- Environment validation

## Data Flow

### 1. User Request Flow

```
User → Next.js App → Middleware
                    ↓
              Route Handler
                    ↓
         ┌──────────┴──────────┐
         ▼                     ▼
    Server Component      API Route
         │                     │
         ├─ Better Auth ───────┤
         ├─ Prisma ────────────┤
         ├─ oRPC ──────────────┤
         └─ Redis ─────────────┘
                    ↓
              HTML Response
```

### 2. oRPC Request Flow

```
Client Component
    │
    └─ orpc.user.getById.useQuery({ id: '123' })
              │
              ▼
    TanStack Query (Cache check)
              │
              ▼
    HTTP POST /api/rpc
              │
              ▼
    oRPC Handler (src/o-rpc/user.ts)
              │
              ├─ Input validation (Zod)
              ├─ Session check (Better Auth)
              ├─ Database query (Prisma)
              └─ Return typed response
              │
              ▼
    Client receives typed data
```

### 3. Authentication Flow

```
Sign In Request
    │
    └─ POST /api/auth/sign-in/email
              │
              ▼
    Better Auth Handler
              │
              ├─ Validate credentials
              ├─ Check rate limit (Redis)
              ├─ Query user (Prisma)
              ├─ Create session (Redis)
              └─ Set session cookie
              │
              ▼
    Redirect to /dashboard
```

### 4. File Upload Flow

```
User selects file
    │
    └─ Client: orpc.files.upload.useMutation()
              │
              ▼
    Upload to /api/rpc (oRPC)
              │
              ├─ Validate file type/size
              ├─ Generate unique filename
              ├─ Upload to MinIO (S3)
              ├─ Save metadata (Prisma)
              └─ Return file URL
              │
              ▼
    Client displays uploaded file
```

### 5. Background Job Flow

```
Trigger Event
    │
    └─ queueManager.addJob('email', 'send-welcome', data)
              │
              ▼
    Job added to Redis queue
              │
              ▼
    Worker picks up job
              │
              ├─ Process job
              ├─ Update progress
              ├─ Retry on failure
              └─ Mark complete
              │
              ▼
    Job completed/failed
```

## Directory Structure Philosophy

### Route Organization

- `(admin)` - Protected admin routes with layout
- `(auth)` - Public authentication pages
- `(guest)` - Public guest pages (optional)
- `api` - API routes (Better Auth)
- `rpc` - oRPC endpoints

### Component Organization

```
components/
├── ui/              # Primitive components (shadcn/ui)
├── layout/          # Layout components (header, sidebar)
├── form/            # Form components
├── analytics/       # Analytics-specific components
├── file-upload/     # File upload components
└── queue/           # Queue management components
```

### Library Organization

```
lib/
├── auth.ts          # Better Auth config
├── auth-client.ts   # Auth client
├── orpc.ts          # oRPC client
├── orpc.server.ts   # oRPC server
├── bullmq/          # Job queue system
├── file-management/ # S3/MinIO client
├── react-query/     # TanStack Query setup
├── redis/           # Redis client & cache
└── utils/           # Utility functions
```

## Design Decisions

### Why Next.js 15?

- Latest React features (Server Components)
- Built-in optimizations
- Turbopack for fast builds
- Edge runtime support
- Image optimization

### Why oRPC over tRPC?

- Better App Router support
- No code generation needed
- Simpler setup
- TanStack Query integration
- Type inference without `typeof`

### Why Better Auth?

- Modern, TypeScript-first
- Redis session storage
- Flexible plugin system
- Built-in security features
- Easy to extend

### Why Prisma?

- Type-safe database queries
- Automatic migrations
- Great TypeScript support
- Multi-schema organization
- Prisma Studio for management

### Why BullMQ?

- Redis-backed (already using Redis)
- Advanced job management
- Cron scheduling
- Flow support (parent-child jobs)
- Active maintenance

### Why MinIO?

- Self-hosted (no cloud costs)
- S3-compatible API
- Easy to switch to AWS S3
- Full control over data
- Docker-friendly

### Why Bun?

- 50x faster than npm
- All-in-one tool
- Native TypeScript support
- Drop-in Node.js replacement
- Great DX

## Security Considerations

### 1. Environment Variables

- Type-safe validation with T3 Env
- Server-only secrets
- Client variables prefixed with `NEXT_PUBLIC_`

### 2. Authentication

- Session-based (not JWT for better security)
- Redis session storage
- Rate limiting on auth endpoints
- Password breach detection
- CSRF protection

### 3. Database

- Prepared statements (SQL injection protection)
- Row-level security ready
- Connection pooling
- Automatic migrations

### 4. API Security

- Input validation with Zod
- Session verification
- CORS configuration
- Rate limiting

### 5. File Uploads

- File type validation
- Size limits
- Virus scanning ready
- Presigned URLs for security

## Performance Optimizations

### 1. Caching Strategy

```
Browser Cache
    ↓
Next.js Cache (App Router)
    ↓
Redis Cache
    ↓
Database
```

### 2. Database Optimization

- Indexes on frequently queried fields
- Connection pooling
- Query optimization with Prisma
- Pagination for large datasets

### 3. Asset Optimization

- Next.js Image component
- Automatic image optimization
- WebP format
- Lazy loading

### 4. Code Splitting

- Automatic with Next.js
- Dynamic imports for large components
- Route-based splitting

### 5. Server Components

- Reduce client-side JavaScript
- Server-side data fetching
- No client state management needed

## Scalability Considerations

### Horizontal Scaling

- Stateless server design
- External session storage (Redis)
- Shared file storage (MinIO)
- Database connection pooling

### Vertical Scaling

- BullMQ concurrency control
- Database indexing
- Redis memory management
- MinIO storage expansion

### Monitoring

- PostHog analytics
- BullMQ job metrics
- Redis health checks
- Database performance monitoring

## Future Enhancements

### Potential Additions

- [ ] WebSocket support (Socket.io)
- [ ] Email service (Resend/Nodemailer)
- [ ] Payment integration (Stripe)
- [ ] Admin dashboard (React Admin)
- [ ] API rate limiting (Redis)
- [ ] Logging system (Winston/Pino)
- [ ] Testing setup (Vitest/Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Sentry)
- [ ] CDN integration

## Resources

- [Next.js Architecture](https://nextjs.org/docs/app/building-your-application)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [BullMQ Architecture](https://docs.bullmq.io/guide/architecture)
- [Redis Patterns](https://redis.io/docs/manual/patterns/)

---

[← Back to Main README](../README.md)
