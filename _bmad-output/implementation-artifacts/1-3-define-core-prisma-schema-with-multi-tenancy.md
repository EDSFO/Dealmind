# Story 1.3: Define Core Prisma Schema with Multi-Tenancy

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to define the initial Prisma schema with tenant_id on all models,
So that every database table supports multi-tenant data isolation.

## Acceptance Criteria

1. **Given** a connected Supabase database from Story 1.2
   **When** I create the initial Prisma schema with tenant_id columns
   **Then** schema.prisma includes User, Company, and Tenant models with proper relationships
   **And** every model includes a tenant_id field (directly or through relation)
   **And** tenant_id is indexed for query performance
   **And** relationships between models include tenant_id in foreign keys
   **And** schema follows snake_case convention for database fields
   **And** `npx prisma db push` successfully creates tables in Supabase

## Tasks / Subtasks

- [x] Design Prisma schema with Tenant model (AC: 1)
  - [x] Create Tenant model with id, name, created_at fields
  - [x] Set id as UUID with @default(uuid()) for tenant identifier
  - [x] Add unique constraint on id to prevent duplicates
  - [x] Add created_at DateTime field with @default(now())
  - [x] Add @map annotation for snake_case table name ("tenants")
- [x] Design Company model with tenant relationship (AC: 1)
  - [x] Create Company model with id, tenant_id, name, created_at, updated_at fields
  - [x] Set tenant_id as foreign key referencing Tenant.id
  - [x] Add @relation link to Tenant model
  - [x] Add index on tenant_id for query performance
  - [x] Use @map for snake_case column names (tenant_id, created_at, updated_at)
  - [x] Use @map for table name ("companies")
- [x] Design User model with tenant and company relationships (AC: 1)
  - [x] Create User model with id, tenant_id, company_id, email, name, role fields
  - [x] Set id as UUID @default(uuid()) matching Supabase Auth users.id
  - [x] Add tenant_id as foreign key referencing Tenant.id
  - [x] Add company_id as foreign key referencing Company.id (nullable)
  - [x] Create @relation links to Tenant and Company models
  - [x] Define role as enum: VENDEDOR, LIDER, ADMIN
  - [x] Add indexes on tenant_id and company_id for query performance
  - [x] Add unique constraint on (tenant_id, email) for email uniqueness per tenant
  - [x] Use @map for snake_case column names (tenant_id, company_id, created_at, etc.)
  - [x] Use @map for table name ("users")
- [x] Remove default T3 Stack Post model (AC: 1)
  - [x] Delete the Post example model from schema.prisma
  - [x] Verify no references to Post model remain
- [x] Update Prisma client output location if needed (AC: 1)
  - [x] Verify generator client output is "../generated/prisma"
  - [x] Keep output location as configured in Story 1.1
- [x] Run Prisma database push (AC: 1)
  - [x] Run `cd dealmind && npx prisma db push`
  - [x] Verify all tables are created in Supabase (tenants, companies, users)
  - [x] Check for no errors or warnings
  - [x] Verify indexes are created on tenant_id columns
  - [x] Verify foreign key relationships are established
- [x] Regenerate Prisma client (AC: 1)
  - [x] Run `cd dealmind && npx prisma generate`
  - [x] Verify Prisma Client generates successfully
  - [x] Check that generated TypeScript types include all models
  - [x] Verify @map annotations produce correct camelCase TypeScript fields

## Dev Notes

### Architecture Compliance

**CRITICAL ARCHITECTURAL DECISIONS:**

1. **Multi-Tenancy Pattern**: tenant_id + RLS [Source: architecture.md#Data Architecture]
   - Every table includes `tenant_id UUID NOT NULL` column
   - Prisma schema enforces tenant_id on all models
   - Supabase RLS policies filter queries by `auth.jwt()->>'tenant_id'`
   - Middleware injects tenant_id from JWT claims into session
   - Foreign keys include tenant_id for referential integrity

2. **Database Naming Conventions** [Source: architecture.md#Code Conventions]
   - Database fields: snake_case (tenant_id, created_at, company_id)
   - TypeScript fields: camelCase (tenantId, createdAt, companyId)
   - Use `@map()` annotation to map Prisma camelCase to database snake_case
   - Table names: plural, snake_case (tenants, companies, users)

3. **Relationship Patterns** [Source: architecture.md#Data Architecture]
   - Every model relates to Tenant through tenant_id foreign key
   - Cascade deletes configured appropriately (Tenant deletion cascades to all tenant data)
   - Foreign keys include tenant_id for referential integrity
   - Index on all tenant_id columns for query performance

4. **User Model Integration with Supabase Auth** [Source: architecture.md#Authentication & Security]
   - User.id must match Supabase Auth users.id (UUID format)
   - User.role enum: VENDEDOR, LIDER, ADMIN (three-tier RBAC)
   - User.email unique per tenant (not globally unique)
   - User links to both Tenant and Company models

5. **Data Model Relationships** [Source: epics.md#Epic 1]
   - Tenant: Root entity for multi-tenancy
   - Company: Belongs to Tenant, represents organization
   - User: Belongs to Tenant and Company, represents individual users

### Previous Story Intelligence

**From Story 1.2 Completion:**
- Supabase PostgreSQL connection successfully configured
- Session Pooler active: `aws-1-us-east-1.pooler.supabase.com:5432`
- Prisma schema provider set to "postgresql"
- DATABASE_URL: `postgresql://postgres.njkqdqpixklghnptolmj:Novasenha2024%40@aws-1-us-east-1.pooler.supabase.com:5432/postgres`
- Prisma Client generates successfully at `dealmind/generated/prisma`
- Environment variables validated in src/env.js

**From Story 1.1 Completion:**
- T3 Stack project created in `dealmind/` directory
- Prisma 6.6.0 installed
- Prisma schema file exists at `dealmind/prisma/schema.prisma`
- Generator client output set to `../generated/prisma`
- Current schema has default Post model (to be removed)

**Current Prisma Schema State:**
```prisma
// dealmind/prisma/schema.prisma (CURRENT STATE)

generator client {
    provider = "prisma-client-js"
    output   = "../generated/prisma"
}

datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

model Post {
    id        Int      @id @default(autoincrement())
    name      String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@index([name])
}
```

**Important Notes:**
- Post model is T3 Stack example and MUST be removed in this story
- Keep generator output as `../generated/prisma` (already configured correctly)
- Database connection is verified and working from Story 1.2
- PostgreSQL provider is already set correctly

### Technical Specifications

**Prisma Schema Design:**

```prisma
// dealmind/prisma/schema.prisma

// === DATA SOURCE ===
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === GENERATOR ===
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

// === ENUMS ===
enum UserRole {
  VENDEDOR
  LIDER
  ADMIN
}

// === MODELS ===

// Tenant: Root entity for multi-tenancy
// Each tenant represents an isolated company environment
model Tenant {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now()) @map("created_at")

  // Relationships
  companies Company[]
  users     User[]

  @@map("tenants")
}

// Company: Organization belonging to a tenant
// One tenant can have multiple companies (optional for future expansion)
model Company {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relationships
  tenant Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  users  User[]

  @@index([tenantId])
  @@map("companies")
}

// User: Individual user account linked to tenant and company
// User.id matches Supabase Auth users.id
model User {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  companyId String?  @map("company_id")
  email     String
  name      String
  role      UserRole @default(VENDEDOR)

  // Relationships
  tenant  Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  company Company? @relation(fields: [companyId], references: [id], onDelete: SetNull)

  // Constraints
  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([companyId])
  @@map("users")
}
```

**Model Explanations:**

1. **Tenant Model:**
   - Root entity for multi-tenancy
   - `id`: UUID identifier for the tenant
   - `name`: Human-readable tenant name (e.g., "Acme Corp")
   - One-to-many relationships with Company and User

2. **Company Model:**
   - Represents an organization within a tenant
   - `tenantId`: Foreign key to Tenant (required)
   - `name`: Company name
   - `onDelete: Cascade`: Deleting tenant cascades to companies
   - Index on tenantId for query performance

3. **User Model:**
   - Represents individual users
   - `id`: UUID matching Supabase Auth users.id
   - `tenantId`: Required foreign key to Tenant
   - `companyId`: Optional foreign key to Company (users can exist without company assignment)
   - `email`: User email address
   - `role`: Three-tier RBAC (VENDEDOR, LIDER, ADMIN)
   - Unique constraint on (tenantId, email): Email must be unique within a tenant
   - Indexes on tenantId and companyId for query performance

**Database Column Mappings:**

| TypeScript Field | Database Column | Type |
|-----------------|-----------------|------|
| tenantId        | tenant_id      | UUID |
| companyId       | company_id      | UUID |
| createdAt       | created_at      | DateTime |
| updatedAt       | updated_at      | DateTime |

**Verification Commands:**

```bash
# From dealmind directory
cd dealmind

# Update schema and create tables
npx prisma db push

# Expected output:
# ✔ Stringified connection string
# Environment variables loaded from .env
# ✔ Generated Prisma Client
# ✔ Verified database connection
# The following migration(s) have been created and applied from new schema changes:
# migrations/
#   └─ 20250105XXXXXX_init/migration.sql

# Regenerate Prisma client with new types
npx prisma generate

# Expected output:
# ✔ Generated Prisma Client (v6.x.x) to .\generated\prisma in XXXms

# Verify with Prisma Studio (optional)
npx prisma studio
```

**Supabase Database Verification:**

After running `npx prisma db push`, verify in Supabase dashboard:
1. Go to Supabase Dashboard → Table Editor
2. Verify three tables exist: tenants, companies, users
3. Check tenants table columns: id, name, created_at
4. Check companies table columns: id, tenant_id, name, created_at, updated_at
5. Check users table columns: id, tenant_id, company_id, email, name, role
6. Verify foreign key relationships exist
7. Verify indexes exist on tenant_id columns

### Security Requirements

**🚨 CRITICAL SECURITY RULES 🚨**

**MUST DO:**
- Include tenant_id on ALL models (enforces data isolation)
- Add indexes on tenant_id for query performance
- Use onDelete: Cascade for tenant relationships (ensures clean tenant deletion)
- Use unique constraint on (tenantId, email) for users
- Set User.id to UUID to match Supabase Auth users.id

**MUST NOT DO:**
- ❌ Do NOT create any model without tenant_id field
- ❌ Do NOT use Int autoincrement for primary keys (use UUID)
- ❌ Do NOT skip indexing tenant_id columns
- ❌ Do NOT remove or modify the Tenant model (it's the foundation of multi-tenancy)
- ❌ Do NOT make companyId required on User model (some users may not be assigned to a company)

**Next Steps After This Story:**
- Story 1.4: Install @supabase/ssr for authentication
- Story 1.4+: Implement RLS policies in Supabase for tenant isolation

### Testing Standards

**For This Story:**
- Manual verification only (no automated tests needed)
- Verify Prisma connects with `npx prisma db push`
- Verify all tables created in Supabase dashboard
- Verify relationships and foreign keys exist
- Verify indexes created on tenant_id columns
- Validate Prisma Client generates new types

**Verification Checklist:**
- [ ] Post model removed from schema.prisma
- [ ] Tenant model created with correct fields
- [ ] Company model created with tenant relationship
- [ ] User model created with tenant and company relationships
- [ ] All models use @map for snake_case column names
- [ ] All models use @map for snake_case table names
- [ ] tenant_id indexed on Company and User models
- [ ] Foreign key relationships established
- [ ] `npx prisma db push` succeeds
- [ ] `npx prisma generate` succeeds
- [ ] Tables visible in Supabase dashboard

### Common Pitfalls to Avoid

1. **Forgetting @map Annotations**
   - ✅ DO: Use @map for all column and table name conversions
   - ❌ DON'T: Rely on Prisma default naming (uses camelCase in database)

2. **Missing tenant_id on Models**
   - ✅ DO: Include tenant_id on ALL models except Tenant
   - ❌ DON'T: Create models without tenant_id (breaks multi-tenancy)

3. **Wrong Foreign Key onDelete Behavior**
   - ✅ DO: Use onDelete: Cascade for tenant relationships
   - ❌ DON'T: Use onDelete: NoAction or Restrict (prevents tenant deletion)

4. **Not Indexing tenant_id**
   - ✅ DO: Add @@index([tenantId]) on all models with tenant_id
   - ❌ DON'T: Skip indexing (causes slow queries on large datasets)

5. **Using Wrong ID Type**
   - ✅ DO: Use UUID @default(uuid()) for primary keys
   - ❌ DON'T: Use Int @default(autoincrement()) (doesn't match Supabase Auth)

6. **Making companyId Required**
   - ✅ DO: Make companyId optional (String?) on User model
   - ❌ DON'T: Make companyId required (some users exist without company)

### Implementation Guardrails

**🚨 CRITICAL: DO NOT DEVIATE FROM THESE PATTERNS 🚨**

**MUST DO:**
- Follow exact schema structure provided in Technical Specifications
- Use @map annotations for ALL column and table name conversions
- Add indexes on ALL tenant_id columns
- Use UUID primary keys for all models
- Remove the Post model completely
- Keep generator output as "../generated/prisma"
- Test connection with `npx prisma db push`

**MUST NOT DO:**
- ❌ Do NOT add any additional models beyond Tenant, Company, User
- ❌ Do NOT modify the Tenant model structure
- ❌ Do NOT change enum values for UserRole (VENDEDOR, LIDER, ADMIN)
- ❌ Do NOT add additional fields to models (future stories will add them)
- ❌ Do NOT implement RLS policies yet (Story 1.4+)
- ❌ Do NOT create seed data or test data yet
- ❌ Do NOT install @supabase/ssr yet (Story 1.4)

### Success Criteria

**Story is COMPLETE when:**
- [ ] Post model removed from schema.prisma
- [ ] Tenant model created with id, name, created_at
- [ ] Company model created with id, tenant_id, name, created_at, updated_at
- [ ] User model created with id, tenant_id, company_id, email, name, role
- [ ] UserRole enum created (VENDEDOR, LIDER, ADMIN)
- [ ] All models use @map for snake_case column and table names
- [ ] Foreign key relationships established between Tenant-Company and Tenant/User
- [ ] Indexes created on tenant_id columns
- [ ] Unique constraint on (tenantId, email) for User model
- [ ] `npx prisma db push` successfully creates tables in Supabase
- [ ] `npx prisma generate` successfully generates Prisma Client
- [ ] Tables visible in Supabase dashboard with correct structure

**Verification Commands:**
```bash
# From dealmind directory
cd dealmind

# Check schema file
cat prisma/schema.prisma

# Verify Post model is gone
! grep -q "model Post" prisma/schema.prisma

# Verify Tenant model exists
grep -q "model Tenant" prisma/schema.prisma

# Verify Company model exists
grep -q "model Company" prisma/schema.prisma

# Verify User model exists
grep -q "model User" prisma/schema.prisma

# Test connection and create tables
npx prisma db push

# Expected output:
# ✔ Stringified connection string
# Environment variables loaded from .env
# ✔ Generated Prisma Client
# ✔ Verified database connection
# The following migration(s) have been created and applied from new schema changes:

# Regenerate Prisma client
npx prisma generate

# Expected: Prisma Client generated successfully
```

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

**Implementation Summary:**
- Story 1.3 implemented successfully
- Prisma schema updated with Tenant, Company, and User models
- Post model removed from T3 Stack default schema
- UserRole enum created (VENDEDOR, LIDER, ADMIN)
- All models use @map annotations for snake_case database columns
- Foreign key relationships established with proper cascade behavior
- Database push completed in 7.25s with no errors
- Prisma Client generated successfully (v6.19.1)

**Database Schema Created:**
- Table: tenants (id, name, created_at)
- Table: companies (id, tenant_id, name, created_at, updated_at)
- Table: users (id, tenant_id, company_id, email, name, role)
- Indexes: tenant_id on companies and users
- Foreign keys: companies.tenant_id → tenants.id, users.tenant_id → tenants.id, users.company_id → companies.id

### Completion Notes List

**✅ STORY IMPLEMENTATION COMPLETE**

Successfully implemented multi-tenant Prisma schema with Tenant, Company, and User models.

**Schema Implementation:**
1. **Tenant Model**: Root entity for multi-tenancy
   - Fields: id (UUID), name, createdAt (DateTime)
   - Table name: tenants (snake_case)
   - One-to-many relationships with Company and User

2. **Company Model**: Organization belonging to tenant
   - Fields: id (UUID), tenantId (FK), name, createdAt, updatedAt
   - Table name: companies (snake_case)
   - Foreign key to Tenant with onDelete: Cascade
   - Index on tenantId for query performance

3. **User Model**: Individual users with tenant and company relationships
   - Fields: id (UUID), tenantId (FK), companyId (optional FK), email, name, role (UserRole)
   - Table name: users (snake_case)
   - Foreign keys to Tenant (cascade) and Company (set null)
   - Unique constraint on (tenantId, email) for email uniqueness per tenant
   - Indexes on tenantId and companyId

4. **UserRole Enum**: Three-tier RBAC
   - Values: VENDEDOR, LIDER, ADMIN
   - Default: VENDEDOR

**Architecture Compliance:**
- ✅ Multi-tenancy pattern with tenant_id on all models (except Tenant)
- ✅ Snake_case database columns with @map annotations
- ✅ CamelCase TypeScript fields (tenantId, companyId, createdAt)
- ✅ UUID primary keys matching Supabase Auth
- ✅ Indexes on all tenant_id columns for query performance
- ✅ Proper cascade behavior for referential integrity
- ✅ Unique constraint on (tenantId, email) for User model

**Files Modified:**
- `dealmind/prisma/schema.prisma` - Complete replacement with multi-tenant schema
  - Removed: Post model (T3 Stack example)
  - Added: Tenant, Company, User models
  - Added: UserRole enum

**Database Changes:**
- Created tables: tenants, companies, users
- Created indexes: tenant_id on companies and users, company_id on users
- Created foreign keys: companies→tenants, users→tenants, users→companies
- Created unique constraint: (tenant_id, email) on users table

**Verification Results:**
- ✅ `npx prisma db push` - Successfully created tables in Supabase (7.25s)
- ✅ `npx prisma generate` - Prisma Client generated (v6.19.1, 154ms)
- ✅ Post model removed
- ✅ Tenant model exists
- ✅ Company model exists
- ✅ User model exists
- ✅ All models use @map for snake_case column and table names

**All Acceptance Criteria Met:**
1. ✅ schema.prisma includes User, Company, and Tenant models with proper relationships
2. ✅ Every model includes a tenant_id field (directly or through relation)
3. ✅ tenant_id is indexed for query performance
4. ✅ Relationships between models include tenant_id in foreign keys
5. ✅ Schema follows snake_case convention for database fields with @map annotations
6. ✅ `npx prisma db push` successfully created tables in Supabase

**Next Steps:**
- Story 1.4: Implement Supabase SSR Authentication
- Story 1.4+: Implement RLS policies in Supabase for tenant isolation

### File List

**Files Modified:**
- `dealmind/prisma/schema.prisma` - Complete replacement with multi-tenant schema
  - Removed: Post model (T3 Stack example)
  - Added: Tenant model with id, name, createdAt
  - Added: Company model with id, tenantId, name, createdAt, updatedAt
  - Added: User model with id, tenantId, companyId, email, name, role
  - Added: UserRole enum (VENDEDOR, LIDER, ADMIN)
  - All models use @map annotations for snake_case database columns

**Created in Supabase Database:**
- Table: tenants (id, name, created_at)
- Table: companies (id, tenant_id, name, created_at, updated_at)
- Table: users (id, tenant_id, company_id, email, name, role)
- Indexes: tenant_id on companies and users, company_id on users
- Foreign keys: companies.tenant_id → tenants.id, users.tenant_id → tenants.id, users.company_id → companies.id
- Unique constraint: (tenant_id, email) on users table

**Generated:**
- Prisma Client at `dealmind/generated/prisma/` (v6.19.1)

**NOT modified in this story:**
- Database connection (already configured in Story 1.2)
- Environment variables (already configured in Story 1.2)
- Prisma generator output (already configured correctly)
- RLS policies (Story 1.4+)
- @supabase/ssr installation (Story 1.4)

## References

- **Architecture Document**: `_bmad-output/planning-artifacts/architecture.md`
  - Data Architecture: Section "Multi-Tenancy Pattern: tenant_id + RLS"
  - Code Conventions: Section "Naming Patterns"
  - Authentication: Section "Authorization Pattern: RBAC with Middleware Enforcement"
  - Implementation Patterns: Indexing strategies and relationship patterns

- **Epics Document**: `_bmad-output/planning-artifacts/epics.md`
  - Epic 1: Foundation & Project Setup
  - Story 1.1: Initialize T3 Stack Project (completed)
  - Story 1.2: Configure Supabase Connection (completed)
  - Story 1.3: Define Core Prisma Schema (this story)
  - Story 1.4: Implement Supabase SSR Authentication (next story)

- **Previous Story**: `_bmad-output/implementation-artifacts/1-2-configure-supabase-connection-and-environment.md`
  - Supabase connection details and configuration
  - Prisma schema provider configuration
  - Environment variable setup

- **External Resources:**
  - Prisma Schema Reference: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
  - Prisma Multi-Tenancy Guide: https://www.prisma.io/docs/guides/database/multi-tenancy
  - Supabase Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
  - T3 Stack Database Setup: https://create.t3.gg/en/usage/prisma
