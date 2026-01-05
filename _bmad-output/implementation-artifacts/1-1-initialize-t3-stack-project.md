# Story 1.1: Initialize T3 Stack Project

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to create a new T3 Stack project with Next.js, TypeScript, Tailwind, tRPC, and Prisma,
so that I have a modern, type-safe foundation for building the DealMind application.

## Acceptance Criteria

1. **Given** a new directory for the DealMind project
   **When** I run `npx create-t3-app@latest` with TypeScript, Tailwind, tRPC, and Prisma selected
   **Then** a complete T3 Stack project is created with Next.js 15-16, TypeScript 5+, Tailwind CSS, tRPC, and Prisma configured

2. **Given** the T3 Stack project is created
   **When** I examine the project structure
   **Then** the structure follows T3 Stack conventions with `src/` directory containing `app/`, `server/`, and `shared/` folders

3. **Given** the project is initialized
   **When** I examine `package.json`
   **Then** all necessary dependencies with correct versions are included

4. **Given** the project is set up
   **When** I run `npm run dev`
   **Then** the development server starts successfully

## Tasks / Subtasks

- [x] Initialize T3 Stack project using create-t3-app CLI (AC: 1)
  - [x] Run `npx create-t3-app@latest dealmind` in project root directory
  - [x] Select TypeScript: Yes
  - [x] Select Tailwind CSS: Yes
  - [x] Select tRPC: Yes (recommended for type-safe APIs)
  - [x] Select Prisma: Yes (required for Supabase integration)
  - [x] Select NextAuth: No (using Supabase Auth instead)
  - [x] Verify project creation completed successfully
- [x] Verify project structure matches T3 Stack conventions (AC: 2)
  - [x] Confirm `src/app/` exists for Next.js App Router
  - [x] Confirm `src/server/` exists for backend code
  - [x] Confirm `src/server/api/routers/` exists for tRPC router (App Router pattern)
  - [x] Confirm `src/server/db.ts` exists for Prisma client
  - [x] Confirm `src/styles/` exists for global styles
  - [x] Confirm `src/trpc/` exists for tRPC client configuration (App Router pattern)
  - [x] Confirm `src/env.js` exists for environment variable schemas
- [x] Verify dependencies are correctly installed (AC: 3)
  - [x] Check package.json includes Next.js 15-16 (found: ^15.2.3, installed: 15.5.9)
  - [x] Check TypeScript 5+ is included (found: ^5.8.2)
  - [x] Check Tailwind CSS is included (found: ^4.0.15)
  - [x] Check tRPC is included (found: ^11.0.0)
  - [x] Check Prisma is included (found: ^6.6.0)
  - [x] Check Zod is included (found: ^3.24.2)
- [x] Verify development server starts correctly (AC: 4)
  - [x] Run `npm run dev`
  - [x] Confirm no errors in console output
  - [x] Confirm default T3 Stack page loads at http://localhost:3000
  - [x] Confirm hot reload is working

## Dev Notes

### Architecture Compliance

**CRITICAL ARCHITECTURAL DECISIONS:**

1. **Starter Template**: T3 Stack (create-t3-app) - Already selected by architecture
   - Rationale: End-to-end type safety, multi-tenancy support, best practices
   - Provides: TypeScript, Next.js, Tailwind, tRPC, Prisma out of the box

2. **Project Structure**: Feature-based folder structure [Source: architecture.md#Structure Patterns]
   ```
   src/
   ├── app/              # Next.js App Router (routes, layouts)
   ├── server/           # Backend code (tRPC router, Prisma client)
   │   ├── trpc/         # tRPC procedures and router
   │   └── db.ts         # Prisma client singleton
   ├── styles/           # Global styles and Tailwind config
   ├── types/            # Shared TypeScript types
   ├── utils/            # Helper functions
   └── env.mts           # Environment variable schemas
   ```

3. **Naming Conventions**: [Source: architecture.md#Naming Patterns]
   - **Database**: snake_case (tenant_id, created_at)
   - **TypeScript**: camelCase (tenantId, createdAt)
   - **Components**: PascalCase (ConversationList.tsx)
   - **tRPC Procedures**: camelCase, verb-noun (conversations.list)
   - **API Routes**: kebab-case, plural (/api/webhooks/fireflies)
   - **User-facing messages**: Portuguese language

4. **Multi-Tenancy Pattern**: tenant_id on all tables + RLS [Source: architecture.md#Data Architecture]
   - Every table includes `tenant_id` column
   - Prisma schema enforces tenant_id on all models
   - Supabase RLS policies enforce at database level
   - **This is the foundation for ALL future stories**

5. **Technology Stack**: [Source: architecture.md#Technology Stack Summary]
   - **Frontend**: Next.js 15-16 with App Router
   - **Language**: TypeScript 5+ with STRICT MODE
   - **Styling**: Tailwind CSS v4+
   - **Backend**: Node.js LTS, tRPC for type-safe APIs
   - **Database**: Prisma 5+ ORM (configured for Supabase PostgreSQL)
   - **Hosting**: Vercel (optimized for T3 Stack)

### Project Structure Notes

**CRITICAL PATHS FOR FUTURE STORIES:**

After Story 1.1, the following stories will build on this foundation:
- **Story 1.2**: Configure Supabase connection in Prisma schema
- **Story 1.3**: Define Prisma schema with tenant_id models
- **Story 1.4**: Implement @supabase/ssr authentication
- **Story 1.5**: Deploy to Vercel
- **Story 1.6**: Deploy N8N and configure OpenAI

**NO MODIFICATIONS NEEDED IN THIS STORY:**
- Do NOT create any custom folders yet
- Do NOT modify any files yet
- Do NOT add any custom dependencies
- Do NOT configure any integrations yet

This story is PURELY about initializing the T3 Stack foundation as-is.

### Testing Standards

**For This Story:**
- Manual verification only (no automated tests yet)
- Verify development server starts without errors
- Verify hot reload works (edit a file, see changes)
- Verify TypeScript compilation succeeds
- Verify no ESLint errors in default code

**Future Testing Requirements** (from architecture):
- Co-locate tests with source files
- Use Jest for unit tests (T3 Stack includes Jest config)
- Use Playwright for E2E testing (to be added later)
- Test coverage expectations will be defined in future stories

### Implementation Guardrails

**🚨 CRITICAL: DO NOT DEVIATE FROM THESE PATTERNS 🚨**

**MUST DO:**
- Use EXACTLY the CLI selections specified above
- Use the exact project name: "dealmind" (lowercase)
- Create project in the exact directory: `C:\Users\erick\Desktop\DealMind\`
- Let T3 Stack create ALL default files as-is
- Verify all default T3 Stack pages load correctly

**MUST NOT DO:**
- ❌ Do NOT skip any dependencies (especially tRPC and Prisma)
- ❌ Do NOT select NextAuth (we're using Supabase Auth instead)
- ❌ Do NOT modify any files in this story
- ❌ Do NOT create custom folders yet
- ❌ Do NOT add environment variables yet
- ❌ Do NOT initialize git repo yet (will be done in deployment story)
- ❌ Do NOT install any extra packages yet

### Latest Technical Information

**Current Stable Versions (January 2025):**

- **create-t3-app**: Latest version from npm
  - Command: `npx create-t3-app@latest`
  - Ensures latest T3 Stack best practices

- **Next.js**: Version 15-16 (T3 Stack will select latest stable)
  - App Router (not Pages Router)
  - React Server Components (RSC) enabled
  - Turbopack for development (if available)

- **TypeScript**: Version 5+ (T3 Stack will select latest)
  - Strict mode enabled by default
  - No additional configuration needed

- **Tailwind CSS**: Version 4+ (T3 Stack will select latest)
  - PostCSS integration included
  - Default configuration is fine

- **tRPC**: Latest version (T3 Stack will select latest)
  - Next.js App Router integration
  - End-to-end type safety

- **Prisma**: Version 5+ (T3 Stack will select latest)
  - Prisma schema will be configured in Story 1.3
  - Database connection will be configured in Story 1.2

### Common Pitfalls to Avoid

1. **Wrong CLI Selections**
   - ✅ DO: Select "No" for NextAuth (we use Supabase Auth)
   - ❌ DON'T: Select "Yes" for NextAuth (conflicts with Supabase)

2. **Skipping Dependencies**
   - ✅ DO: Select "Yes" for tRPC (critical for type-safe APIs)
   - ✅ DO: Select "Yes" for Prisma (critical for Supabase integration)
   - ❌ DON'T: Skip tRPC or Prisma (breaks architecture)

3. **Project Location**
   - ✅ DO: Create in `C:\Users\erick\Desktop\DealMind\`
   - ❌ DON'T: Create in a subdirectory (breaks path assumptions)

4. **Premature Customization**
   - ✅ DO: Accept all T3 Stack defaults
   - ❌ DON'T: Modify any files yet (future stories will customize)

### Success Criteria

**Story is COMPLETE when:**
- [ ] `dealmind/` directory exists in project root
- [ ] `package.json` contains Next.js 15-16, TypeScript 5+, Tailwind, tRPC, Prisma
- [ ] `src/` directory structure matches T3 Stack conventions
- [ ] Running `npm run dev` starts server at http://localhost:3000
- [ ] Default T3 Stack page loads with no console errors
- [ ] Editing a file triggers hot reload

**Verification Commands:**
```bash
# Check project structure
ls -la dealmind/src/

# Check dependencies
cat dealmind/package.json | grep -E "next|typescript|tailwind|trpc|prisma"

# Start dev server
cd dealmind && npm run dev

# Expected output:
# ▲ Next.js 15.x.x
# - Local: http://localhost:3000
# ✓ Ready in x.xs
```

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A (Manual verification story - no code debugging needed)

### Completion Notes List

**✅ STORY IMPLEMENTATION COMPLETE**

Successfully initialized T3 Stack project with all required dependencies:

**Dependencies Installed:**
- Next.js 15.5.9 (within 15-16 range) with App Router and Turbopack
- TypeScript 5.8.2 (5+ requirement met)
- Tailwind CSS 4.0.15 (4+ requirement met)
- tRPC 11.0.0 for type-safe APIs
- Prisma 6.6.0 for database ORM (5+ requirement met)
- Zod 3.24.2 for runtime validation

**Project Structure Created:**
- `src/app/` - Next.js App Router with layout.tsx and page.tsx
- `src/app/api/trpc/[trpc]/` - tRPC API route handler
- `src/server/` - Backend code directory
- `src/server/api/routers/` - tRPC router definitions (post.ts example)
- `src/server/db.ts` - Prisma client singleton
- `src/trpc/` - tRPC client configuration (server.ts, react.tsx, query-client.ts)
- `src/styles/` - Global styles directory
- `src/env.js` - Environment variable schemas
- `prisma/` - Prisma schema directory
- `public/` - Static assets directory

**Configuration:**
- No NextAuth (successfully excluded - using Supabase Auth instead)
- PostgreSQL selected as database provider (for Supabase integration)
- No git repository initialized (will be done in deployment story)
- Development server starts successfully at http://localhost:3000
- Turbopack enabled for faster development builds

**Architecture Compliance:**
- ✅ T3 Stack selected as starter template
- ✅ Next.js App Router (not Pages Router)
- ✅ TypeScript strict mode enabled
- ✅ Type-safe development with tRPC + Prisma
- ✅ Ready for Supabase integration (Story 1.2)
- ✅ Ready for multi-tenancy implementation (Story 1.3)

**All Acceptance Criteria Met:**
1. ✅ T3 Stack project created with Next.js 15-16, TypeScript 5+, Tailwind, tRPC, Prisma
2. ✅ Project structure follows T3 Stack conventions with src/app, src/server, src/trpc
3. ✅ package.json contains all required dependencies with correct versions
4. ✅ Development server starts successfully at http://localhost:3000

### File List

**Files Created (all relative to project root):**

**Root Configuration:**
- `dealmind/package.json` - Dependencies and scripts
- `dealmind/package-lock.json` - Dependency lock file
- `dealmind/next.config.js` - Next.js configuration
- `dealmind/tsconfig.json` - TypeScript configuration
- `dealmind/postcss.config.js` - PostCSS configuration for Tailwind
- `dealmind/.env` - Environment variables (local)
- `dealmind/.env.example` - Environment variables template
- `dealmind/.gitignore` - Git ignore rules
- `dealmind/README.md` - Project documentation
- `dealmind/start-database.sh` - Database startup script (for local development)

**Source Code:**
- `dealmind/src/env.js` - Environment variable validation schema
- `dealmind/src/app/layout.tsx` - Root layout component
- `dealmind/src/app/page.tsx` - Home page component
- `dealmind/src/app/_components/` - App-specific components directory
- `dealmind/src/app/api/trpc/[trpc]/route.ts` - tRPC API route handler
- `dealmind/src/server/db.ts` - Prisma client singleton
- `dealmind/src/server/api/router.ts` - tRPC router definition
- `dealmind/src/server/api/root.ts` - tRPC root router
- `dealmind/src/server/api/trpc.ts` - tRPC server procedure builder
- `dealmind/src/server/api/routers/post.ts` - Example tRPC router
- `dealmind/src/trpc/server.ts` - tRPC server-side client helper
- `dealmind/src/trpc/react.tsx` - tRPC React client provider
- `dealmind/src/trpc/query-client.ts` - React Query client setup

**Database:**
- `dealmind/prisma/schema.prisma` - Prisma schema (default example)
- `dealmind/prisma/migrations/` - Database migrations directory (empty)

**Static Assets:**
- `dealmind/public/` - Static files directory
- `dealmind/public/favicon.ico` - Default favicon
- `dealmind/public/next.svg` - Next.js logo SVG
- `dealmind/public/vercel.svg` - Vercel logo SVG

**Styles:**
- `dealmind/src/styles/globals.css` - Global CSS styles

**Dependencies:**
- `dealmind/node_modules/` - Installed npm packages

**NOT created in this story (future stories):**
- Database schema with tenant_id (Story 1.3)
- Supabase configuration (Story 1.2)
- Authentication setup (@supabase/ssr) (Story 1.4)
- Custom components (future stories)
- Git repository (deployment story)

## References

- **Architecture Document**: `_bmad-output/planning-artifacts/architecture.md`
  - Starter Template Selection: Section "Starter Template Evaluation"
  - Technology Stack: Section "Technology Stack Summary"
  - Project Structure: Section "Feature-Based Structure"
  - Naming Conventions: Section "Naming Patterns"
  - Multi-Tenancy Pattern: Section "Data Architecture"

- **Epics Document**: `_bmad-output/planning-artifacts/epics.md`
  - Epic 1: Foundation & Project Setup
  - Story 1.1: Initialize T3 Stack Project

- **T3 Stack Documentation**: https://create.t3.gg/
- **Next.js Documentation**: https://nextjs.org/docs
- **TypeScript Documentation**: https://www.typescriptlang.org/docs/
