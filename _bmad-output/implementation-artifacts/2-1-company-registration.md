# Story 2.1: Company Registration

Status: review

## Story

As a new admin user,
I want to register a new company account with organization name and basic information,
so that my team can use DealMind with our own isolated tenant environment.

## Acceptance Criteria

**Given** I am not logged in and access the DealMind application
**When** I navigate to the registration page and submit company name, my email, and password
**Then** a new Tenant record is created with a unique tenant_id
**And** a new Company record is created linked to the tenant_id
**And** a new User record is created with ADMIN role linked to the tenant_id
**And** I am automatically logged in and redirected to the dashboard
**And** a success message confirms my company account is created
**And** all database records include the same tenant_id for isolation

## Tasks / Subtasks

- [x] Task 1: Create registration form component (AC: #)
  - [x] Subtask 1.1: Design registration form with company name, email, password fields
  - [x] Subtask 1.2: Add form validation (email format, password strength)
  - [x] Subtask 1.3: Style with Tailwind CSS following project patterns
- [x] Task 2: Implement Supabase Auth user creation (AC: #)
  - [x] Subtask 2.1: Call Supabase signUp API with email and password
  - [x] Subtask 2.2: Handle auth errors with user-friendly messages
- [x] Task 3: Create database records in transaction (AC: #)
  - [x] Subtask 3.1: Generate unique UUID for tenant_id
  - [x] Subtask 3.2: Create Tenant record with generated tenant_id
  - [x] Subtask 3.3: Create Company record linked to tenant_id
  - [x] Subtask 3.4: Create User record with ADMIN role and tenant_id
  - [x] Subtask 3.5: Use Prisma transaction for all-or-nothing creation
- [x] Task 4: Set up automatic login and redirect (AC: #)
  - [x] Subtask 4.1: Exchange auth code for session after successful registration
  - [x] Subtask 4.2: Redirect to dashboard after successful login
  - [x] Subtask 4.3: Display success message confirming account creation
- [x] Task 5: Configure tenant metadata in Supabase Auth (AC: #)
  - [x] Subtask 5.1: Set tenant_id in user app_metadata
  - [x] Subtask 5.2: Set role as ADMIN in user app_metadata

## Dev Notes

- Relevant architecture patterns and constraints
- Source tree components to touch
- Testing standards summary

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
- Detected conflicts or variances (with rationale)

### References

- [Source: planning-artifacts/epics.md#Story-2.1]
- [Source: planning-artifacts/architecture.md#Authentication-&-Security]
- [Source: planning-artifacts/architecture.md#Multi-Tenancy-Enforcement-Patterns]

## Dev Agent Record

### Agent Model Used

MiniMax-M2.1

### Debug Log References

### Completion Notes List

- Successfully implemented company registration flow
- Created registration page at `/register` with form validation using Zod
- Implemented Supabase Auth signUp with custom metadata (tenant_id, role: ADMIN)
- Created API route `/api/auth/register` that:
  - Generates unique tenant UUID
  - Creates Tenant, Company, User records in Prisma transaction
  - Updates Supabase Auth user metadata with tenant_id
- Updated middleware to redirect authenticated users away from /register
- Fixed TypeScript path aliases (`~/*` instead of `@/*`)
- Removed unused T3 scaffold files (post router, post component)
- Created example router for tRPC to prevent build errors
- Build completed successfully with no TypeScript errors

### File List

**New Files Created:**
- `src/app/(auth)/register/page.tsx` - Registration page component
- `src/app/api/auth/register/route.ts` - API route for registration
- `src/server/api/routers/example.ts` - Example tRPC router

**Modified Files:**
- `src/middleware.ts` - Added /register to auth routes
- `src/app/login/page.tsx` - Fixed path alias imports
- `src/app/dashboard/page.tsx` - Fixed path alias imports
- `src/app/auth/callback/route.ts` - Fixed path alias imports
- `src/app/api/auth/logout/route.ts` - Fixed path alias imports
- `src/app/page.tsx` - Updated home page with login/register links
- `src/server/api/root.ts` - Updated to use example router
- `prisma/schema.prisma` - Already exists (Epic 1)

**Removed Files:**
- `src/server/api/routers/post.ts` - Unused T3 scaffold
- `src/app/_components/post.tsx` - Unused T3 scaffold

---

## Developer Context Section

### STORY FOUNDATION

**User Story:** As a new admin user, I want to register a new company account with organization name and basic information, so that my team can use DealMind with our own isolated tenant environment.

**Business Value:**
- Enables new companies to onboard to DealMind platform
- Establishes multi-tenancy foundation with isolated tenant environments
- Creates first admin user for each company with full access
- Supports scalable SaaS model with multiple independent organizations

**Dependencies:**
- Epic 1 must be complete (1-1, 1-2, 1-3, 1-4)
- Supabase Auth configured via @supabase/ssr
- Prisma schema with Tenant, Company, User models defined

### ARCHITECTURE COMPLIANCE

**Critical Architecture Requirements:**

1. **Multi-Tenancy Pattern (MANDATORY):**
   - Every database query MUST include `tenantId` filter
   - Tenant ID generated as UUID for isolation
   - All records (Tenant, Company, User) share same tenant_id
   - See: [architecture.md#Multi-Tenancy-Enforcement-Patterns]

2. **Authentication:**
   - Use @supabase/ssr for SSR authentication
   - Call `supabase.auth.signUp()` for user registration
   - Set custom claims in `app_metadata`: `{ tenant_id, role: 'ADMIN' }`
   - JWT token must include `tenant_id` and `role` claims
   - See: [architecture.md#Authentication-&-Security]

3. **Database Transaction:**
   - Use Prisma `$transaction` for atomic operations
   - All-or-nothing creation: Tenant -> Company -> User
   - Rollback on any failure

4. **User-Facing Messages (Portuguese):**
   - All UI text in Portuguese
   - Error messages user-friendly and actionable
   - Examples:
     - "Conta criada com sucesso!"
     - "E-mail inválido"
     - "Senha deve ter pelo menos 8 caracteres"

### LIBRARY & FRAMEWORK REQUIREMENTS

**Required Libraries:**
- `@supabase/ssr` (latest for Next.js App Router)
- `@supabase/supabase-js` (Auth client)
- `zod` (validation - included with T3 Stack)
- `prisma` (ORM)

**tRPC Integration:**
- No tRPC procedure needed for registration (direct Supabase Auth)
- Client-side form submission with Supabase Auth
- Server-side session validation in middleware

### FILE STRUCTURE REQUIREMENTS

**New/Modified Files:**

```
src/
├── app/
│   ├── (auth)/                  # Auth layout group
│   │   ├── register/
│   │   │   └── page.tsx         # Registration page (NEW)
│   │   └── layout.tsx           # Auth layout (may need update)
│   └── dashboard/
│       └── page.tsx             # Dashboard (exists - may need auth check)
├── components/
│   └── ui/                      # Reusable UI components
├── server/
│   └── api/
│       └── routers/             # Example router for tRPC
└── lib/
    └── supabase/
        ├── server.ts            # Already exists
        └── client.ts            # Already exists
```

**Route Structure:**
- Registration page: `/register`
- Login page: `/login` (already exists)
- Dashboard: `/dashboard` (already exists)

### PROJECT CONTEXT REFERENCE

**DealMind is a multi-tenant SaaS B2B platform for sales conversation intelligence.**

Key context:
- 3-tier RBAC: VENDEDOR, LIDER, ADMIN
- Portuguese user-facing interface
- Tenant isolation via tenant_id + RLS
- AI-powered conversation analysis via N8N + OpenAI

---

## Implementation Details

### Registration Flow

1. User fills out registration form at `/register`
2. Client validates with Zod schema
3. Supabase Auth creates user with temporary metadata
4. API route `/api/auth/register`:
   - Generates unique tenant UUID
   - Creates Tenant, Company, User in Prisma transaction
   - Updates Supabase Auth user metadata with tenant_id
5. User is automatically logged in via session
6. Redirect to dashboard

### Error Messages (Portuguese)

| Error | Message |
|-------|---------|
| Invalid email | "E-mail inválido" |
| Weak password | "A senha deve ter pelo menos 8 caracteres" |
| Email already exists | "Este e-mail já está cadastrado" |
| Password mismatch | "As senhas não coincidem" |
| Registration failed | "Erro ao criar conta. Tente novamente." |
| Success | "Conta criada com sucesso! Redirecionando..." |

---

## Implementation Checklist

- [x] Registration page created at `/register`
- [x] Registration form with company name, email, password fields
- [x] Zod validation schema implemented
- [x] Supabase Auth signUp with custom claims
- [x] Prisma transaction for Tenant, Company, User creation
- [x] Automatic login after successful registration
- [x] Redirect to dashboard
- [x] Success message displayed
- [x] Portuguese error messages
- [x] Form styling with Tailwind CSS
- [ ] Unit tests for validation (pending)
- [ ] Integration tests for registration flow (pending)
- [ ] Multi-tenancy isolation verified (pending)
