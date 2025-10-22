# Copilot Instructions - Next.js Starter Kit

## Architecture Overview

This is a Next.js 15 full-stack app using **oRPC** (not tRPC) for type-safe API communication, Better Auth for authentication, Prisma with multi-schema organization, BullMQ for job queues, and MinIO for S3-compatible file storage.

### Critical: oRPC Pattern (Not tRPC)

**Server-side router** (`src/o-rpc/routes.ts`):
```typescript
export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
  todo: todoRouter,
  files: filesRoute,
  // Export analytics as namespace for nested procedures
  analytics,
};
```

**Client usage** (`src/lib/orpc.ts`):
- Server-side: Use `globalThis.$client` from `src/lib/orpc.server.ts`
- Client-side: Use `client` or `orpc` utils with TanStack Query
- Never use `RPCLink` on server-side - it throws intentionally

**Adding new procedures**:
1. Define in `src/o-rpc/[feature].ts` using `publicProcedure` or `protectedProcedure` from `base.ts`
2. Add middleware context extensions in `base.ts` (e.g., `requireAuthMiddleware`, `providePrismaMiddleware`)
3. Import into `routes.ts` and add to `appRouter`
4. Client auto-generates TypeScript types - no code generation needed

## Environment & Configuration

**Environment validation**: `src/lib/utils/env.ts` uses `@t3-oss/env-nextjs`
- Server vars: `NEXT_PUBLIC_PROJECT_NAME`, `DATABASE_URL`, `S3_*`, `REDIS_*`, OAuth credentials
- Client vars: Must have `NEXT_PUBLIC_*` prefix
- All vars validated with Zod schemas

**Docker naming**: All services use `${NEXT_PUBLIC_PROJECT_NAME}` prefix
- Containers: `${NEXT_PUBLIC_PROJECT_NAME}-postgres`, `${NEXT_PUBLIC_PROJECT_NAME}-minio`, `${NEXT_PUBLIC_PROJECT_NAME}-redis`
- Volumes: `${NEXT_PUBLIC_PROJECT_NAME}_postgres_data`, `${NEXT_PUBLIC_PROJECT_NAME}_minio_data`, etc.
- Network: `${NEXT_PUBLIC_PROJECT_NAME}_network`

## Database & Prisma

**Multi-schema architecture** (`src/prisma/schema/`):
- `schema.prisma` - Generator & datasource config only
- `auth.prisma` - Better Auth tables (auto-generated via `bun run auth:generate`)
- `todo.prisma`, `file.prisma` - Feature-specific schemas
- Custom output: `src/prisma/generated/` (not `node_modules/.prisma`)

**Critical config**: `prisma.config.ts` sets custom paths
- Schema: `src/prisma/schema/`
- Migrations: `src/prisma/migrations/`
- Generated client: `src/prisma/generated/`

**Database commands**:
```bash
bun run db:generate    # Generate Prisma client
bun run auth:generate  # Generate Better Auth schema
bun run db:migrate     # Run migrations
bun run db:init        # Full reset + regenerate (destructive)
```

**Import Prisma client**: Always use `import prisma from "@/prisma"`

## Authentication (Better Auth)

**Session handling** (`src/lib/auth.ts`):
- `auth.api.getSession()` - Server-side session retrieval
- `getSession(headers)` - Cached wrapper using React `cache()`
- Redis-based session storage via `@/lib/redis`

**Middleware protection** (`src/middleware.ts`):
- Public routes: `/`, `/venue(.*)`, `/sign-in`, `/sign-up`
- Protected routes redirect to `/sign-in`
- Auth routes redirect to `/dashboard` if already authenticated

**oRPC auth middleware**: Use `protectedProcedure` which runs `requireAuthMiddleware`
- Auto-redirects unauthenticated users to `/sign-in`
- Injects `session` into context
- Example: `protectedProcedure.handler(({ context }) => context.session.user)`

## File Storage (MinIO/S3)

**Client setup** (`src/lib/file-management/s3-file-client.ts`):
- `s3Client` - Minio client instance
- `createPresignedUrlToUpload()` - Generate upload URLs (default 1hr expiry)
- `createBucketIfNotExists()` - Auto-create buckets

**Key constants** (`constant.ts`):
- `MAX_FILE_SIZE_S3_ENDPOINT` - 20MB limit
- `bucketName` - From `NEXT_PUBLIC_S3_BUCKET_NAME` env var
- `LIMIT_FILES` - 10 files per upload

**Pattern**: Use presigned URLs for client-side uploads, not direct server uploads

## Job Queues (BullMQ)

**Queue management** (`src/lib/bullmq/`):
- `queue-manager.ts` - Create/manage queues with `QueueManager` class
- `worker-manager.ts` - Process jobs with `WorkerManager` class
- `flow-producer.ts` - Parent-child job dependencies
- `scheduler.ts` - Recurring jobs with cron patterns

**Configuration** (`config.ts`):
- `redisConnection` - Connection options for BullMQ
- `defaultQueueOptions` - 3 retries, exponential backoff, auto-cleanup
- `defaultWorkerOptions` - 10 concurrent jobs, rate limiting (100/sec)

**Example queues**: `EMAIL`, `NOTIFICATION`, `FILE_PROCESSING`, `DATABASE_BACKUP`

**Adding new queue**:
1. Create queue with `QueueManager.createQueue('QUEUE_NAME')`
2. Register worker processor in `init-workers.ts`
3. Add job via `addJob()` method

## Internationalization (next-intl)

**Locales** (`src/i18n/config.ts`):
- Supported: `ckb` (Kurdish/default), `en`, `ar`
- Cookie-based persistence: `NEXT_LOCALE`
- RTL support for Arabic

**Translation loading** (`src/i18n/request.ts`):
- Server-side: `getRequestConfig` auto-loads from `src/messages/[locale].json`
- Client-side: Use `useTranslations()` hook

**Adding translations**:
1. Add key to `src/messages/[locale].json` files
2. Use `t('key')` in components

## Component Patterns

**File naming**: kebab-case (`user-menu.tsx`, `file-manager.tsx`)
**Component names**: PascalCase (`UserMenu`, `FileManager`)
**Import aliases**: Always use `@/` prefix (configured in `tsconfig.json`)

**Server vs Client**:
- Add `"use server"` or `import "server-only"` for server-only code
- oRPC procedures are always server-side
- TanStack Query hooks are client-side

**shadcn/ui components**: Located in `src/components/ui/`
- Modified to work with Tailwind CSS 4
- Import from `@/components/ui/[component]`

## Development Workflow

**Start services**:
```bash
bun run docker:up    # Start PostgreSQL, Redis, MinIO
bun run db:init      # Initialize database (first time)
bun run dev          # Start Next.js dev server (port 3000)
```

**Service access**:
- App: http://localhost:3000
- MinIO Console: http://localhost:9001
- Prisma Studio: `bun run db:studio`
- PostgreSQL: localhost:5432

**Build & deploy**:
```bash
bun run build   # Production build with Turbopack
bun run start   # Start production server
```

## Common Gotchas

1. **oRPC is NOT tRPC** - Different API, no `useQuery` wrapping, procedures use `.handler()` not `.query()`
2. **Prisma schemas split** - Don't modify `auth.prisma` manually, regenerate with `bun run auth:generate`
3. **Environment vars** - Client vars MUST start with `NEXT_PUBLIC_`, validated by T3 Env
4. **Docker volumes** - Use `${NEXT_PUBLIC_PROJECT_NAME}` prefix to avoid conflicts across projects
5. **Server actions** - Use oRPC procedures instead of Next.js server actions
6. **Redis required** - BullMQ and Better Auth sessions both need Redis running
7. **MinIO setup** - Create bucket on first run via `createBucketIfNotExists()`

## Testing Patterns

**No test framework configured** - Add Jest/Vitest as needed for your use case

## Documentation

- `README.md` - Setup & quick start
- `docs/AUTH.md` - Better Auth & OAuth setup
- `docs/DATABASE.md` - Prisma & migrations
- `docs/FILE_STORAGE.md` - MinIO/S3 usage
- `docs/ANALYTICS.md` - PostHog integration
- `docs/I18N.md` - Internationalization
- `docs/ARCHITECTURE.md` - System design
- `docs/CONTRIBUTING.md` - Code standards
