# 🤝 Contributing Guide

Thank you for considering contributing to this Next.js starter kit! This document provides guidelines and best practices for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Documentation](#documentation)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.2.16 (or Node.js >= 20)
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)
- Code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/digital-menu.git
   cd digital-menu
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start services**
   ```bash
   bun run docker:up
   bun run db:init
   ```

5. **Start development**
   ```bash
   bun run dev
   ```

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring

Example:
```bash
git checkout -b feature/add-user-roles
git checkout -b fix/login-redirect-issue
git checkout -b docs/update-readme
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow the [code standards](#code-standards) below.

### 3. Test Your Changes

```bash
# Run linter
bun run lint

# Check TypeScript
bunx tsc --noEmit

# Test build
bun run build
```

### 4. Commit Changes

Follow [commit conventions](#commit-conventions).

```bash
git add .
git commit -m "feat: add user roles feature"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Standards

### TypeScript

**✅ DO:**
```typescript
// Use explicit types
function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

// Use interfaces for objects
interface User {
  id: string;
  email: string;
  name: string;
}

// Use type for unions/primitives
type Status = 'active' | 'inactive';
```

**❌ DON'T:**
```typescript
// Avoid `any`
function process(data: any) { }  // Bad!

// Don't disable TypeScript
// @ts-ignore  // Avoid this
```

### React Components

**File Naming:**
- Components: `PascalCase.tsx` (UserProfile.tsx)
- Utilities: `kebab-case.ts` (user-utils.ts)
- Hooks: `use-hook-name.ts` (use-auth.ts)

**Component Structure:**
```typescript
// ✅ Good structure
'use client'; // If client component

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface UserCardProps {
  name: string;
  email: string;
  onDelete?: () => void;
}

export function UserCard({ name, email, onDelete }: UserCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    await onDelete?.();
    setIsDeleting(false);
  }

  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
      {onDelete && (
        <Button onClick={handleDelete} disabled={isDeleting}>
          Delete
        </Button>
      )}
    </div>
  );
}
```

### Styling

**Use Tailwind CSS:**
```typescript
// ✅ Good
<div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md">

// ❌ Bad (inline styles)
<div style={{ display: 'flex', padding: '16px' }}>
```

**Consistent Spacing:**
- Use Tailwind spacing scale: `p-4`, `gap-2`, `mb-6`
- Use `rem` units in custom CSS
- Avoid pixel values

### Prisma Schema

**Naming Conventions:**
```prisma
// ✅ Good
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  todos Todo[]

  @@index([email])
  @@map("users")
}

model Todo {
  id     String @id @default(cuid())
  title  String
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("todos")
}
```

**Rules:**
- `camelCase` for field names
- `PascalCase` for model names
- `snake_case` for table names (@@map)
- Always add indexes for foreign keys
- Use `onDelete: Cascade` for parent-child relations
- Include `createdAt` and `updatedAt`

### oRPC Procedures

```typescript
// ✅ Good structure
import { publicProcedure, protectedProcedure } from './base';
import { z } from 'zod';

export const userRouter = {
  // Public procedure
  getById: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .handler(async ({ input }) => {
      return await prisma.user.findUnique({
        where: { id: input.id },
      });
    }),

  // Protected procedure
  update: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
    }))
    .handler(async ({ input, ctx }) => {
      return await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { name: input.name },
      });
    }),
};
```

### File Organization

```
src/
├── app/                    # Routes
│   ├── (admin)/           # Protected routes
│   ├── (auth)/            # Auth pages
│   ├── api/               # API routes
│   └── rpc/               # oRPC endpoints
├── components/            # React components
│   ├── ui/                # Primitive components
│   ├── layout/            # Layout components
│   └── [feature]/         # Feature-specific
├── lib/                   # Core libraries
│   ├── [service]/         # Service-specific code
│   └── utils/             # Shared utilities
├── o-rpc/                 # oRPC procedures
└── prisma/                # Database
    └── schema/            # Schema files
```

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Build process or auxiliary tool changes
- `ci` - CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(auth): add OAuth support for GitHub"

# Bug fix
git commit -m "fix(ui): resolve modal close button issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(db): simplify user query logic"

# Breaking change
git commit -m "feat(api)!: change user endpoint response structure

BREAKING CHANGE: User endpoint now returns { data: user } instead of direct user object"
```

## Pull Request Process

### Before Submitting

1. **Update from develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-branch
   git rebase develop
   ```

2. **Run checks**
   ```bash
   bun run lint
   bunx tsc --noEmit
   bun run build
   ```

3. **Test manually**
   - Test your changes thoroughly
   - Check responsive design
   - Test in different browsers
   - Verify database migrations work

### PR Title

Follow commit convention format:

```
feat(auth): add OAuth support for GitHub
fix(ui): resolve modal close button issue
docs(readme): update installation instructions
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List your changes
- Be specific

## Testing
- [ ] Manual testing completed
- [ ] Lint passed
- [ ] TypeScript check passed
- [ ] Build successful

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks** - CI/CD must pass
2. **Code Review** - At least one approval required
3. **Testing** - Reviewer tests changes locally
4. **Merge** - Squash and merge to develop

## Project Structure

### Adding New Features

1. **Create Prisma Schema** (if needed)
   ```prisma
   // src/prisma/schema/feature.prisma
   model Feature {
     id String @id @default(cuid())
     // ...
   }
   ```

2. **Create oRPC Procedures**
   ```typescript
   // src/o-rpc/feature.ts
   export const featureRouter = { ... };
   ```

3. **Add to Routes**
   ```typescript
   // src/o-rpc/routes.ts
   import { featureRouter } from './feature';

   export const appRouter = {
     // ...
     feature: featureRouter,
   };
   ```

4. **Create UI Components**
   ```typescript
   // src/components/feature/
   ```

5. **Add Pages**
   ```typescript
   // src/app/(admin)/feature/page.tsx
   ```

6. **Update Navigation** (if needed)
   ```typescript
   // src/components/layout/app-sidebar.tsx
   ```

## Testing

### Manual Testing Checklist

- [ ] Feature works as expected
- [ ] Error handling works
- [ ] Form validation works
- [ ] Responsive on mobile
- [ ] Dark mode looks good
- [ ] i18n translations present
- [ ] No console errors
- [ ] Database migrations work
- [ ] Authentication required (if protected)

### Future: Automated Testing

We plan to add:
- Unit tests (Vitest)
- Integration tests
- E2E tests (Playwright)

## Documentation

### When to Update Docs

Update documentation when you:
- Add new features
- Change APIs
- Add environment variables
- Modify database schema
- Change configuration

### Documentation Files

- `README.md` - Main documentation
- `docs/AUTH.md` - Authentication
- `docs/DATABASE.md` - Database & Prisma
- `docs/FILE_STORAGE.md` - File storage
- `docs/ANALYTICS.md` - Analytics
- `docs/I18N.md` - Internationalization
- `docs/ARCHITECTURE.md` - Architecture
- `src/lib/[service]/README.md` - Service-specific

### Code Comments

**When to Comment:**
- Complex algorithms
- Workarounds
- Non-obvious decisions
- Important notes

**When NOT to Comment:**
- Obvious code
- What code does (use descriptive names instead)

```typescript
// ❌ Bad comment
// Get user by ID
const user = await getUserById(id);

// ✅ Good comment
// We use a 24-hour cache here because user data rarely changes
// and reduces database load by 70%
const user = await getCachedUser(id, { ttl: 86400 });
```

## Getting Help

- **GitHub Issues** - Report bugs or request features
- **GitHub Discussions** - Ask questions
- **Documentation** - Read the docs in `/docs`

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Recognition

Contributors will be recognized in:
- README contributors section
- GitHub insights
- Release notes

---

Thank you for contributing! 🎉

[← Back to Main README](../README.md)
