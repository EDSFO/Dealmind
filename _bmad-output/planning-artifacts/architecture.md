---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ["prd.md", "diio-reference.md"]
workflowType: 'architecture'
project_name: 'DealMind'
user_name: 'Erick'
date: '2025-01-05'
status: 'COMPLETE'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## ✅ Architecture Workflow Complete

All critical architectural decisions have been documented for the DealMind project. This architecture provides a complete foundation for AI agents to implement consistent, conflict-free code.

---

### Document Summary

**Sections Completed:**
1. ✅ Project Context Analysis
2. ✅ Starter Template Evaluation (T3 Stack)
3. ✅ Core Architectural Decisions
4. ✅ Implementation Patterns & Consistency Rules

**Technology Stack:**
- **Frontend:** Next.js 15-16 + TypeScript + Tailwind CSS
- **Backend:** Node.js + tRPC
- **Database:** Supabase (PostgreSQL with RLS)
- **Auth:** @supabase/ssr
- **Hosting:** Vercel
- **AI:** OpenAI GPT-4o-mini
- **Workflow:** Self-hosted N8N

**Key Architectural Decisions:**
- Multi-tenancy via tenant_id + RLS
- Explicit tenant filtering in all queries
- Portuguese user-facing messages
- Feature-based project structure
- Type-safe development with TypeScript + tRPC

### Next Steps for Implementation

**Recommended Order:**

1. **Initialize T3 Stack Project**
   ```bash
   npx create-t3-app@latest
   ```

2. **Configure Supabase**
   - Create Supabase project
   - Set up RLS policies
   - Configure Auth with custom claims

3. **Implement Authentication**
   - Install @supabase/ssr
   - Create middleware
   - Set up tRPC context

4. **Build Core Features**
   - Webhook routes (Fireflies, WhatsApp)
   - Database schema with tenant_id
   - Conversation CRUD operations

5. **Deploy N8N**
   - Set up self-hosted N8N
   - Create AI analysis workflow
   - Configure webhook integrations

6. **Build Frontend**
   - Dashboard with conversation list
   - Insight visualization
   - Admin panel

### AI Agent Guidelines

**All AI agents implementing DealMind features MUST:**

1. Read this complete Architecture document
2. Follow all naming patterns (snake_case DB, camelCase TS)
3. Always include tenant_id in Prisma queries
4. Use Portuguese for user-facing messages
5. Follow TypeScript strict mode
6. Co-locate tests with source files
7. Use tRPC for type-safe APIs
8. Follow the project structure defined above

**For questions or conflicts:**
- Refer to the "Implementation Patterns & Consistency Rules" section
- Check "Core Architectural Decisions" for technology choices
- Update this document if architectural changes are needed

---

_Workflow completed on 2025-01-05_

## Project Context Analysis

### Requirements Overview

**Functional Requirements (35 total):**

DealMind is a multi-tenant SaaS B2B platform for sales conversation intelligence. The functional requirements span six key domains:

1. **Authentication & User Management (FR1-FR6):**
   - Multi-tenant authentication with email/password
   - Company account creation and user management
   - Three-tier RBAC: Vendedor/SDR (own conversations only), Líder (team visibility), Admin (full configuration)
   - JWT-based access control with tenant_id and role claims

2. **Conversation Ingestion (FR7-FR10):**
   - Webhook receiver for Fireflies transcriptions
   - WhatsApp integration for message capture
   - Manual transcription paste capability
   - Metadata storage (date, source, participants)

3. **AI Analysis & Insights (FR11-FR17):**
   - Extract: interests, objections, commitments, progress signals, risk signals
   - Suggest next actions based on conversation analysis
   - Async processing pipeline via N8N + AI agent
   - Analysis triggered automatically on transcription receipt

4. **Conversation Viewing & Discovery (FR18-FR25):**
   - Role-filtered conversation lists
   - Visual indicators for risk/progress signals
   - Filtering by date, source, and status
   - Detailed insight view per conversation

5. **Admin & Configuration (FR26-FR30):**
   - Fireflies webhook configuration
   - WhatsApp integration setup
   - User management (add/remove, role assignment)
   - Adoption metrics dashboard

6. **Data & Compliance (FR31-FR35):**
   - Immutable audit logs (login, permissions, integrations, exports)
   - LGPD data subject rights (export, deletion)
   - Configurable data retention policies
   - Complete tenant isolation

**Non-Functional Requirements (22 total):**

- **Performance:** 5-minute processing SLA, 3-second page loads, 2-second list loads
- **Security:** TLS 1.3, AES-256 encryption, RLS at database level, JWT auth, LGPD compliance
- **Scalability:** Support 10x user growth (10→100 users), horizontal scaling, burst handling (50 transcriptions/hour)
- **Accessibility:** WCAG 2.1 Level A, keyboard navigation, color contrast
- **Integration:** >95% webhook success rate, automatic retry logic
- **Reliability:** 99% uptime, automatic recovery, daily backups

**Scale & Complexity:**

- **Primary domain:** Full-stack web application with AI/ML processing pipeline
- **Complexity level:** Medium (multi-tenant SaaS with external integrations)
- **Estimated architectural components:** 8-12 major services/modules
- **User roles:** 3 distinct roles with different visibility scopes
- **Integration points:** 2 primary (Fireflies, WhatsApp) + expansion planned

### Technical Constraints & Dependencies

**Mandatory Constraints:**

- **Multi-tenancy from day one:** All tables must include tenant_id with Row Level Security
- **LGPD compliance:** Audit logging, data retention, right to deletion required
- **Async processing:** N8N + AI agent pipeline for conversation analysis
- **Webhook reliability:** Must handle Fireflies and WhatsApp webhooks with retry logic

**Technology Dependencies:**

- **Fireflies API:** Webhook-based transcription delivery
- **WhatsApp Business API:** Message capture integration
- **N8N:** Workflow automation for AI processing pipeline
- **AI Service:** Agent for conversation analysis (to be selected)

**Integration Constraints:**

- Fireflies webhook must be processed asynchronously
- WhatsApp integration requires official Business API provider
- All processing must complete within 5-minute SLA
- System must be available 24/7 for webhook receipt

### Cross-Cutting Concerns Identified

1. **Multi-Tenancy:**
   - Every database query filters by tenant_id
   - File storage segregated by tenant
   - JWT includes tenant_id and role claims
   - RLS enforcement at database level

2. **Audit Logging:**
   - All security-relevant events logged
   - Logs are immutable
   - Tracks: login/logout, permission changes, integration changes, data exports

3. **Data Privacy (LGPD):**
   - Data retention policies configurable per tenant
   - Right to export and delete supported
   - Consent tracking for transcription analysis

4. **Async Processing:**
   - Webhook → Queue → N8N → AI Agent → Database pattern
   - Queue management for burst handling
   - Automatic retry on failure

5. **Role-Based Access Control:**
   - Vendedor/SDR: Own conversations only
   - Líder: All team conversations
   - Admin: Full company configuration
   - Enforcement at API level

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack web application** with server-side rendering and API routes, based on project requirements analysis:
- Multi-tenant SaaS B2B platform
- Web interface for conversation viewing and management
- Webhook receivers for external integrations (Fireflies, WhatsApp)
- Real-time AI analysis pipeline via N8N

### Starter Options Considered

**1. T3 Stack (create-t3-app)**
- Next.js + TypeScript + Tailwind CSS + tRPC + Prisma
- Excellent type safety and developer experience
- Large community and active development
- Requires Supabase integration configuration

**2. Supabase Official Next.js Template**
- Direct Supabase integration out of the box
- Cookie-based auth configured
- Simpler setup, less opinionated
- No built-in type-safe API layer

**3. Vercel B2B Multi-Tenant Starter**
- Purpose-built for multi-tenant SaaS
- Subdomain-based tenancy
- More opinionated structure
- Less flexibility for custom requirements

### Selected Starter: T3 Stack (create-t3-app)

**Rationale for Selection:**

T3 Stack provides the most robust foundation for DealMind's multi-tenant SaaS requirements:

1. **End-to-End Type Safety:** TypeScript from database schema through tRPC APIs to React components prevents entire classes of runtime errors
2. **Multi-Tenancy Support:** Prisma + Supabase RLS (Row Level Security) provides the strongest isolation pattern for tenant data
3. **API Architecture:** tRPC gives type-safe APIs without schema generation overhead, ideal for evolving SaaS products
4. **Best Practices:** Built-in patterns for environment management, error handling, and code organization
5. **Scalability:** Modular structure supports adding features (webhooks, async processing) as product grows
6. **Team Experience:** Intermediate-friendly with clear patterns for full-stack development

**Supabase Integration Strategy:**

T3 Stack uses Prisma ORM by default. For Supabase:
- Configure Prisma datasource to connect to Supabase PostgreSQL
- Use Supabase connection pooling (Supabase Accelerate or direct connection)
- Implement Supabase Auth with `@supabase/ssr` for Next.js App Router
- Configure RLS policies on Supabase for tenant_id isolation
- Reference guides available:
  - [Prisma + Supabase Official Docs](https://supabase.com/docs/guides/database/prisma)
  - [T3 Stack + Supabase Tutorial](https://remusrisnov.hashnode.dev/t3-stack-template-supabase-w-auth-db-and-shadcn-ui-basic-setup)
  - [tRPC + Supabase with RLS Guide (2025)](https://rajeshdhiman.medium.com/trpc-and-the-t3-stack-explained-why-type-safe-web-development-is-the-future-2025-guide-2b49862768fa)

**Initialization Command:**

```bash
# Create T3 app with interactive CLI
npx create-t3-app@latest

# CLI will prompt for:
# - Project name: dealmind
# - TypeScript: Yes
# - Tailwind CSS: Yes
# - tRPC: Yes (recommended for type-safe APIs)
# - Prisma: Yes (required for Supabase integration)
# - NextAuth: No (using Supabase Auth instead)
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript 5+ with strict mode enabled
- Next.js 15 (App Router) with React Server Components
- Node.js runtime for API routes

**Styling Solution:**
- Tailwind CSS v4+ with PostCSS integration
- CSS modules for component-specific styles when needed
- Responsive utilities built-in

**Build Tooling:**
- Next.js built-in optimizer (Turbopack for dev)
- TypeScript compilation with strict type checking
- Environment variable validation with Zod schemas

**Testing Framework:**
- Jest configuration included (optional)
- Testing utilities for tRPC procedures
- Can add Playwright for E2E testing

**Code Organization:**
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

**API Architecture:**
- tRPC for type-safe client-server communication
- API routes in `/src/app/api` for webhooks (Fireflies, WhatsApp)
- Prisma for database queries with full type safety
- Supabase client for auth and direct database access when needed

**Development Experience:**
- Hot reload with Fast Refresh
- TypeScript strict mode for early error detection
- ESLint + Prettier for code quality
- Environment variable validation at startup
- tRPC autocomplete in frontend

**Multi-Tenancy Patterns (to be implemented):**
- Prisma schema with `tenant_id` on all tenant-scoped models
- Supabase RLS policies enforcing `tenant_id` filters
- Middleware to inject tenant_id from JWT into queries
- File storage segregated by tenant (Supabase Storage)

**Note:** Project initialization using this command should be the first implementation story. After creation, additional setup steps required:
1. Configure Supabase project and get connection string
2. Update Prisma schema for Supabase connection
3. Install `@supabase/ssr` for Next.js App Router auth
4. Configure environment variables in `.env`
5. Implement RLS policies in Supabase for multi-tenancy
6. Set up webhook routes for Fireflies and WhatsApp integrations

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Multi-tenancy pattern: tenant_id + Row Level Security
- Authentication: @supabase/ssr with Next.js App Router
- Database: Supabase PostgreSQL with RLS policies
- AI Service: OpenAI GPT-4o-mini for conversation analysis
- Async Processing: Direct N8N integration (MVP)

**Important Decisions (Shape Architecture):**
- Webhook architecture: Separate API routes per integration
- N8N deployment: Self-hosted on VPS/Railway
- Environment strategy: Single Vercel project with branch previews
- Monitoring: Vercel built-in analytics and logs

**Deferred Decisions (Post-MVP):**
- External queue system (upgrade from direct N8N when needed)
- Advanced error tracking (add Sentry if Vercel logs insufficient)
- Multiple environment projects (upgrade from single project if needed)

### Data Architecture

**Multi-Tenancy Pattern: tenant_id + RLS**

**Decision:** Use tenant_id column on all tenant-scoped tables with Supabase Row Level Security policies

**Implementation Details:**
- Every table includes `tenant_id UUID NOT NULL` column
- Prisma schema enforces tenant_id on all models
- Supabase RLS policies filter queries by `auth.jwt()->>'tenant_id'`
- Middleware injects tenant_id from JWT claims into session
- Foreign keys include tenant_id for referential integrity

**Rationale:** Industry standard for multi-tenant SaaS, provides database-enforced isolation while maintaining query simplicity and performance. Works seamlessly with Supabase Auth custom claims.

**Version:** Supabase RLS (PostgreSQL 15+), Prisma 5+

**Schema Pattern:**
```prisma
model Conversation {
  id          String   @id @default(uuid())
  tenant_id   String   @map("tenant_id")
  title       String
  // ... other fields

  @@index([tenant_id])
  @@map("conversations")
}

// RLS Policy in Supabase:
// CREATE POLICY tenant_isolation ON conversations
// USING (tenant_id = (auth.jwt()->>'tenant_id'::uuid));
```

**Affects:** All database models, authentication middleware, API routes

**Provided by Starter:** No (custom implementation required)

---

**Data Validation Strategy: Zod Schemas**

**Decision:** Use Zod for runtime validation at API boundaries and Prisma for database constraints

**Implementation:**
- Zod schemas validate API inputs (webhooks, tRPC procedures)
- Prisma handles database-level constraints (unique, not null, foreign keys)
- tRPC infers types from Zod schemas for end-to-end type safety

**Rationale:** T3 Stack includes Zod by default. Provides runtime safety while maintaining TypeScript type inference.

**Version:** Zod 3+ (included with T3 Stack)

**Affects:** All tRPC procedures, webhook handlers, form inputs

**Provided by Starter:** Yes

---

**Migration Strategy: Prisma Migrate**

**Decision:** Use Prisma Migrate for database schema versioning

**Implementation:**
- Schema changes go through Prisma schema
- Run `npx prisma migrate dev` during development
- Run `npx prisma migrate deploy` in production
- Supabase connection pooling for migration execution

**Rationale:** Native to T3 Stack, provides type-safe database client, works with Supabase PostgreSQL.

**Affects:** Database schema evolution, deployment pipeline

**Provided by Starter:** Yes

---

### Authentication & Security

**Authentication Method: @supabase/ssr**

**Decision:** Use official Supabase SSR package for Next.js App Router authentication

**Version:** @supabase/ssr (latest for 2025)

**Implementation Details:**
```typescript
// Server-side client (App Router)
import { createServerClient } from '@supabase/ssr'

// Browser client
import { createBrowserClient } from '@supabase/ssr'

// Middleware for route protection
export async function middleware(request: NextRequest) {
  // Supabase auth validation
  // Tenant extraction from JWT
}
```

**JWT Structure:**
```typescript
{
  sub: "user_id",                    // Supabase auth.users.id
  tenant_id: "company_id",            // Custom claim for multi-tenancy
  role: "vendedor|lider|admin",       // Custom claim for RBAC
  email: "user@example.com",
  aud: "authenticated",
  // ... other Supabase claims
}
```

**Rationale:** Official Supabase package for Next.js App Router. Handles session management, JWT refresh, and server-side auth properly. Integrates with RLS policies.

**Affects:** Middleware, server components, API routes, RLS policies

**Provided by Starter:** No (requires custom setup)

**References:**
- [Supabase SSR Creating a Client](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Next.js + Supabase Cookie-Based Auth (2025 Guide)](https://the-shubham.medium.com/next-js-supabase-cookie-based-auth-workflow-the-best-auth-solution-2025-guide-f6738b4673c1)

---

**Authorization Pattern: RBAC with Middleware Enforcement**

**Decision:** Three-tier role-based access control enforced at middleware and API level

**Roles:**
1. **Vendedor/SDR:** View own conversations only
2. **Líder:** View all team conversations
3. **Admin:** Full company configuration and user management

**Implementation:**
- Middleware extracts role from JWT claim
- tRPC procedures check permissions before data access
- Prisma queries filter by user_id or team based on role
- Server Components receive role as prop

**Authorization Matrix:**
| Action | Vendedor | Líder | Admin |
|--------|----------|-------|-------|
| View own conversations | ✓ | ✓ | ✓ |
| View team conversations | ✗ | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✓ |
| Configure integrations | ✗ | ✗ | ✓ |

**Affects:** Middleware, tRPC router, Prisma queries, UI permissions

**Provided by Starter:** No (custom implementation required)

---

**Security Middleware:**

**Decision:** Next.js middleware for auth + CSRF + rate limiting (via Vercel)

**Implementation:**
- `middleware.ts` runs on all routes
- Validates Supabase session
- Enforces route protection
- Rate limiting via Vercel edge config

**Affects:** All protected routes, API endpoints

**Provided by Starter:** Partial (auth validation custom)

---

### API & Communication Patterns

**Webhook Route Architecture: Separate API Routes**

**Decision:** Separate Next.js API routes for each integration

**Route Structure:**
```
/src/app/api/webhooks/
├── fireflies/
│   └── route.ts          # POST /api/webhooks/fireflies
├── whatsapp/
│   └── route.ts          # POST /api/webhooks/whatsapp
└── health/
    └── route.ts          # GET /api/webhooks/health
```

**Implementation Pattern:**
```typescript
// /src/app/api/webhooks/fireflies/route.ts
import { createRouteHandlerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // 1. Verify webhook signature (Fireflies HMAC)
  // 2. Validate payload structure
  // 3. Extract tenant_id from webhook metadata
  // 4. Store transcription in database
  // 5. Forward to N8N webhook URL
  // 6. Return 200 OK
}
```

**Rationale:** Clear separation of concerns, independent error handling, easier debugging and monitoring. Each integration has its own validation logic.

**Affects:** API routes, webhook handlers, N8N workflow configuration

**Provided by Starter:** No (custom implementation)

---

**Async Processing: Direct N8N Integration (MVP)**

**Decision:** Webhooks forward directly to self-hosted N8N for AI processing

**Architecture:**
```
Fireflies/WhatsApp Webhook
  ↓
Next.js API Route (validate + store)
  ↓
HTTP POST to N8N webhook
  ↓
N8N Workflow:
  - Call OpenAI GPT-4o-mini
  - Extract insights
  - Update Supabase via API
```

**N8N Deployment:**
- Self-hosted on Railway or VPS
- Docker container for easy deployment
- Environment variables for API keys
- Webhook endpoint exposed publicly

**Upgrade Path:**
- MVP: Direct N8N forwarding
- V2: Add queue system (Redis/BullMQ) if retry needed
- V3: Consider Supabase Edge Functions if N8N becomes bottleneck

**Rationale:** Simplest solution for MVP. N8N handles workflow orchestration visually. Self-hosting provides cost efficiency and control.

**Affects:** Webhook routes, N8N setup, deployment configuration

**Provided by Starter:** No

---

**Error Handling Strategy:**

**Decision:** tRPC error handling + Vercel error logging

**Implementation:**
- tRPC procedures throw standardized errors
- Zod validation errors return helpful messages
- Unhandled errors logged to Vercel
- Webhooks return appropriate HTTP status codes

**Affects:** tRPC router, API routes, error monitoring

**Provided by Starter:** Partial (tRPC errors built-in)

---

### Frontend Architecture

**State Management: React Server Components + tRPC**

**Decision:** Leverage Next.js 15 RSC + tRPC for data fetching, minimal client state

**Implementation:**
- Server Components fetch data via tRPC server calls
- Client components use `useTRPC` hook for mutations
- No additional state management library needed
- URL params for filters and search

**Rationale:** T3 Stack provides this pattern out of the box. Reduces client-side complexity while maintaining type safety.

**Affects:** Component architecture, data fetching patterns

**Provided by Starter:** Yes

---

**Component Architecture:**

**Decision:** Feature-based folder structure with shared UI components

**Structure:**
```
src/
├── app/
│   ├── (auth)/          # Auth layout group
│   ├── (dashboard)/     # Main app layout
│   └── api/             # API routes
├── components/
│   ├── ui/              # Reusable UI components
│   ├── conversations/   # Conversation-related components
│   ├── insights/        # Insight display components
│   └── admin/           # Admin panel components
├── server/
│   ├── trpc/            # tRPC procedures
│   └── db.ts            # Prisma client
└── types/               # Shared types
```

**Affects:** Code organization, component patterns

**Provided by Starter:** Partial (base structure provided)

---

### AI/ML Pipeline

**AI Service: OpenAI GPT-4o-mini**

**Decision:** Use GPT-4o-mini for conversation analysis

**Version:** OpenAI API (latest, 2025)

**Implementation:**
- N8N workflow calls OpenAI API
- Prompt engineering for structured extraction
- JSON output with: interests, objections, commitments, progress_signals, risk_signals, next_actions
- Cost optimization: mini model sufficient for extraction tasks

**Prompt Strategy:**
```
System: You are a sales conversation analyst. Extract structured insights from sales call transcriptions.

Input: {transcription_text}

Output JSON:
{
  "interests": ["budget approved", "timeline Q1"],
  "objections": ["concerned about integration"],
  "commitments": "Will review with team by Friday",
  "progress_signals": ["mentioned budget", "asked for demo"],
  "risk_signals": ["mentioned competitor", "no urgency"],
  "next_actions": ["Send case study", "Schedule technical call"],
  "confidence_score": 0.85
}
```

**Rationale:** GPT-4o-mini is highly capable for structured extraction, fast, and very cost-effective. Mini model processes 10x faster than full GPT-4 at 1/10th the cost.

**Cost Estimate:** ~$0.15 per 1K tokens, typical transcription (3K tokens) = ~$0.45 per analysis

**Affects:** N8N workflow configuration, OpenAI API integration

**Provided by Starter:** No

---

**N8N Deployment: Self-Hosted**

**Decision:** Self-host N8N on Railway or VPS

**Implementation:**
- Docker container for N8N
- Railway deployment (recommended) or VPS
- Environment variables: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
- Webhook endpoint: `https://n8n.yourdomain.com/webhook/dealmind-process`

**Workflow Structure:**
```
Webhook Trigger (receive transcription)
  ↓
Call OpenAI GPT-4o-mini
  ↓
Parse JSON response
  ↓
Call Supabase API (update conversation with insights)
  ↓
Return success
```

**Rationale:** Self-hosting provides control and cost efficiency. Railway provides simple deployment with auto-scaling.

**Affects:** Infrastructure setup, deployment configuration, cost planning

**Provided by Starter:** No

---

### Infrastructure & Deployment

**Hosting Strategy: Single Vercel Project with Preview Deployments**

**Decision:** Use single Vercel project for all environments with branch previews

**Version:** Vercel (latest, 2025)

**Environment Strategy:**
- **Production:** `main` branch → `dealmind.vercel.app`
- **Preview:** Feature branches → `dealmind-git-branch.vercel.app`
- **Development:** Local development with `npm run dev`

**Configuration:**
- Environment variables via Vercel dashboard
- Separate Supabase projects for dev/prod (recommended)
- Automatic deployments on git push

**Rationale:** Simplest for MVP. Preview deployments provide staging-like environment. Single project reduces cost and complexity.

**Affects:** Git workflow, deployment process, environment management

**Provided by Starter:** Yes (Vercel-optimized)

---

**Monitoring & Logging: Vercel Built-in**

**Decision:** Use Vercel Analytics and Logs for MVP

**Implementation:**
- Vercel Analytics for web vitals and traffic
- Vercel Logs for error tracking
- Speed Insights for performance monitoring
- Upgrade to Sentry post-MVP if needed

**Rationale:** Zero setup cost, included with Vercel hosting. Sufficient for MVP launch.

**Affects:** Observability, debugging, performance tracking

**Provided by Starter:** Yes

---

**CI/CD Pipeline: Vercel Automatic Deployments**

**Decision:** Rely on Vercel's built-in CI/CD

**Implementation:**
- Automatic deployment on push to `main`
- Preview deployments for pull requests
- Build-time tests (add `npm run test` to build command)
- Environment variable validation via Zod

**Rationale:** Vercel provides production-ready CI/CD without additional configuration.

**Affects:** Development workflow, deployment process

**Provided by Starter:** Yes

---

### Decision Impact Analysis

**Implementation Sequence:**

1. **Phase 1: Foundation**
   - Initialize T3 Stack project
   - Configure Supabase connection
   - Set up @supabase/ssr authentication
   - Define Prisma schema with tenant_id

2. **Phase 2: Multi-Tenancy**
   - Implement RLS policies in Supabase
   - Create middleware for tenant extraction
   - Set up RBAC authorization
   - Test tenant isolation

3. **Phase 3: Core Features**
   - Build webhook routes (Fireflies, WhatsApp)
   - Implement conversation storage
   - Set up N8N deployment
   - Create AI analysis workflow

4. **Phase 4: Frontend**
   - Build dashboard with conversation list
   - Create detail view with insights
   - Implement filtering and search
   - Add admin panel

**Cross-Component Dependencies:**

```
Authentication (Supabase SSR)
  ↓
Multi-Tenancy (RLS + tenant_id)
  ↓
API Routes (Webhooks, tRPC)
  ↓
AI Pipeline (N8N + GPT-4o-mini)
  ↓
Frontend (RSC + tRPC)
```

**Technology Stack Summary:**

| Layer | Technology | Version | Decision Source |
|-------|-----------|---------|-----------------|
| Frontend | Next.js | 15-16 (Active LTS) | T3 Stack |
| Language | TypeScript | 5+ | T3 Stack |
| Styling | Tailwind CSS | 4+ | User + T3 |
| Backend | Node.js | LTS | User |
| API Layer | tRPC | Latest | T3 Stack |
| Database | Supabase (PostgreSQL) | 15+ | User |
| Auth | @supabase/ssr | Latest | Collaborative |
| ORM | Prisma | 5+ | T3 Stack |
| Hosting | Vercel | Latest | User |
| AI | OpenAI GPT-4o-mini | Latest | Collaborative |
| Workflow | N8N | Latest | Collaborative |

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 7 areas where AI agents could make different choices that would cause conflicts

### Naming Patterns

**Database Naming Conventions:**

**PostgreSQL Tables:** Plural, lowercase, snake_case
- `conversations`, `users`, `tenants`, `insights`, `audit_logs`
- All tables include `tenant_id` column (except `tenants` table itself)

**Prisma Models:** Singular, PascalCase
```prisma
model Conversation {
  id          String   @id @default(uuid())
  tenantId    String   @map("tenant_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([tenantId])
  @@index([tenantId, createdAt])
  @@map("conversations")
}
```

**Column Naming:** snake_case in database, camelCase in TypeScript
- DB: `tenant_id`, `created_at`, `updated_at`
- TS: `tenantId`, `createdAt`, `updatedAt`

**Foreign Keys:** `{table}_id` format
- `tenant_id`, `user_id`, `conversation_id`

**API Naming Conventions:**

**tRPC Procedures:** camelCase, verb-noun structure, grouped by domain
```typescript
conversations.list
conversations.getById
conversations.create
conversations.update
conversations.delete
insights.getByConversationId
admin.users.list
admin.users.create
```

**API Routes:** kebab-case, plural resources
```
/api/webhooks/fireflies
/api/webhooks/whatsapp
/api/health
```

**Route Parameters:** kebab-case
```
/conversations/:conversationId
/admin/users/:userId
```

**Code Naming Conventions:**

**Components:** PascalCase
- `ConversationList.tsx`
- `ConversationCard.tsx`
- `InsightPanel.tsx`

**Utility Functions:** camelCase
- `formatDate()`, `cn()`, `getTenantId()`

**Constants:** SCREAMING_SNAKE_CASE
- `MAX_UPLOAD_SIZE`, `DEFAULT_PAGE_SIZE`

**Types/Interfaces:** PascalCase with `T` prefix for generics
- `Conversation`, `User`, `Tenant`
- `TData`, `TError`

**Enums:** PascalCase
- `Role { VENDEDOR, LIDER, ADMIN }`
- `ConversationSource { FIREFLIES, WHATSAPP, MANUAL }`

### Structure Patterns

**Project Organization:**

**Feature-Based Structure:**
```
src/
├── app/
│   ├── (auth)/              # Auth layout group (login, signup)
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/         # Main app layout (protected)
│   │   ├── dashboard/
│   │   ├── conversations/
│   │   ├── admin/
│   │   └── layout.tsx
│   └── api/                 # API routes
│       ├── webhooks/
│       │   ├── fireflies/
│       │   └── whatsapp/
│       └── trpc/[...trpc]   # tRPC handler
├── components/
│   ├── ui/                  # Shared UI components (buttons, inputs)
│   ├── conversations/       # Conversation feature components
│   ├── insights/            # Insight display components
│   └── admin/               # Admin panel components
├── server/
│   ├── trpc/                # tRPC routers and procedures
│   │   ├── routers/
│   │   │   ├── conversations.ts
│   │   │   ├── users.ts
│   │   │   └── index.ts
│   │   └── context.ts      # tRPC context creation
│   └── db.ts                # Prisma client singleton
├── lib/
│   ├── utils.ts             # Utility functions
│   ├── trpc.ts              # tRPC client setup
│   └── supabase/            # Supabase client helpers
│       ├── server.ts
│       └── client.ts
└── types/
    └── api.ts               # Shared API types
```

**Test Organization:** Co-located with source files
```
components/conversations/
├── ConversationList.tsx
├── ConversationList.test.tsx
└── ConversationCard.tsx
```

**File Structure Patterns:**

**Configuration:** Root directory
- `prisma/schema.prisma`
- `next.config.js`
- `tailwind.config.ts`
- `.env.local`

**Static Assets:** `public/` directory
- `public/images/`
- `public/fonts/`
- `public/icons/`

### Format Patterns

**API Response Formats:**

**tRPC Responses:** Direct return, no wrapper
```typescript
// tRPC procedure
export const list = publicProcedure.query(async () => {
  return await prisma.conversation.findMany()
  // Returns array directly, no { data: ... } wrapper
})
```

**API Route Responses:** JSON with consistent structure
```typescript
// Success
return NextResponse.json({ data: conversation }, { status: 200 })

// Error
return NextResponse.json(
  { error: { message: 'Invalid request', code: 'INVALID_REQUEST' } },
  { status: 400 }
)
```

**tRPC Errors:** TRPCError with standard codes
```typescript
import { TRPCError } from '@trpc/server'

throw new TRPCError({
  code: 'UNAUTHORIZED',
  message: 'Você não tem permissão para acessar este recurso',
})
```

**Data Exchange Formats:**

**JSON Fields:** camelCase (TypeScript/JavaScript convention)
```json
{
  "conversationId": "uuid-123",
  "tenantId": "tenant-uuid",
  "createdAt": "2025-01-05T10:00:00Z",
  "insights": { ... }
}
```

**Date/Time:** ISO 8601 strings
```json
{
  "createdAt": "2025-01-05T10:00:00Z",
  "scheduledAt": "2025-01-10T14:30:00Z"
}
```

**Booleans:** `true`/`false` (not 1/0)
```json
{
  "hasRiskSignals": true,
  "isArchived": false
}
```

**Null Handling:** `null` for empty/missing, not undefined
```json
{
  "transcript": null,
  "insights": { ... }
}
```

### Communication Patterns

**Event System Patterns:** (N8N webhooks)

**Event Naming:** past_tense, domain.event
```typescript
// Webhook events from N8N
conversation.analyzed
conversation.updated
insights.generated
```

**Event Payload Structure:**
```typescript
{
  "event": "conversation.analyzed",
  "timestamp": "2025-01-05T10:00:00Z",
  "tenantId": "tenant-uuid",
  "data": {
    "conversationId": "uuid-123",
    "insights": { ... }
  }
}
```

**State Management Patterns:**

**State Updates:** Immutable updates (React standard)
```typescript
// Wrong
state.conversations.push(newConversation)

// Correct
setConversations([...conversations, newConversation])
```

**Loading States:** Object-based with booleans
```typescript
const [isLoading, setIsLoading] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)
```

**State Organization:** Co-located with components
```typescript
// Prefer component state over global state
// Only lift state when needed for sharing
```

### Process Patterns

**Error Handling Patterns:**

**Global Error Handling:** Next.js error boundaries + tRPC error handler
```typescript
// app/error.tsx
export default function Error({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorFallback error={error} reset={reset} />
}

// tRPC error shape transformer
const transformer = new TRPCErrorFormatter({
  onError: ({ error, type }) => {
    // Log to Vercel
    console.error('tRPC error:', error)
    return error
  }
})
```

**User-Facing Error Messages:** Portuguese, actionable
```typescript
{
  "Você não tem permissão para visualizar esta conversa",
  "Conversa não encontrada",
  "Erro ao processar transcrição. Tente novamente.",
  "Sessão expirada. Faça login novamente."
}
```

**Logging:** Vercel logs for errors, console.log for dev only
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}
// Errors automatically logged to Vercel
```

**Loading State Patterns:**

**Loading UI:** Consistent skeleton component
```typescript
{isLoading ? <ConversationListSkeleton /> : <ConversationList />}
```

**Optimistic Updates:** Prefer over loading spinners
```typescript
const utils = api.useContext()
const mutate = api.conversations.update.useMutation({
  onMutate: async (newData) => {
    // Optimistic update
    utils.conversations.list.setData(undefined, (old) =>
      old?.map(c => c.id === newData.id ? { ...c, ...newData } : c)
    )
  },
  onSettled: () => {
    utils.conversations.list.invalidate() // Refresh
  }
})
```

### Multi-Tenancy Enforcement Patterns

**MANDATORY:** All database queries MUST include `tenantId` filter

**Prisma Query Pattern:**
```typescript
// CORRECT - Always include tenantId
const conversations = await prisma.conversation.findMany({
  where: {
    tenantId: ctx.tenantId,  // From tRPC context
  }
})

// WRONG - Never query without tenantId
const all = await prisma.conversation.findMany() // ❌ SECURITY RISK
```

**tRPC Context Pattern:**
```typescript
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const supabase = createServerClient(/* ... */)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const tenantId = session.user.app_metadata.tenant_id
  if (!tenantId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Tenant não encontrado' })
  }

  return {
    ...opts,
    session,
    tenantId,  // Always available in context
    userId: session.user.id,
    role: session.user.app_metadata.role,
  }
}
```

**Procedure Context Usage:**
```typescript
export const list = publicProcedure.query(async ({ ctx }) => {
  // ctx.tenantId is always available
  return await prisma.conversation.findMany({
    where: {
      tenantId: ctx.tenantId,
      userId: ctx.role === 'VENDEDOR' ? ctx.userId : undefined,  // Filter by user if VENDEDOR
    }
  })
})
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. **Always include `tenantId`** in Prisma queries (never bypass this)
2. **Use Portuguese** for user-facing messages
3. **Follow naming conventions** defined above
4. **Co-locate tests** with source files
5. **Use TypeScript strict mode** - no `any` types
6. **Handle errors gracefully** with user-friendly messages
7. **Use loading states** for async operations
8. **Log errors** to Vercel, never expose stack traces to users

**Pattern Enforcement:**

- **Code Review:** Check for tenant_id in all Prisma queries
- **Linting:** ESLint rules for naming conventions
- **Type Checking:** TypeScript strict mode catches type inconsistencies
- **Testing:** Tests verify multi-tenancy isolation

**Pattern Updates:**

- Document pattern changes in this Architecture document
- Update related code when patterns change
- Communicate pattern changes to all team members

### Pattern Examples

**Good Examples:**

```typescript
// ✅ CORRECT - Multi-tenant query with proper naming
export const list = publicProcedure.query(async ({ ctx }) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      tenantId: ctx.tenantId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })

  return conversations
})

// ✅ CORRECT - tRPC error handling with Portuguese message
try {
  await prisma.conversation.create({ data: {...} })
} catch (error) {
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Erro ao criar conversa. Tente novamente.',
  })
}

// ✅ CORRECT - Component naming and structure
'use client'

export function ConversationCard({ conversation }: {
  conversation: Conversation
}) {
  const utils = api.useContext()
  const { mutate, isLoading } = api.conversations.delete.useMutation()

  return <div>...</div>
}
```

**Anti-Patterns:**

```typescript
// ❌ WRONG - Missing tenantId
const conversations = await prisma.conversation.findMany()
// SECURITY RISK - Bypasses multi-tenancy!

// ❌ WRONG - English error message
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Conversation not found',  // Should be Portuguese
})

// ❌ WRONG - Direct state mutation
state.conversations.push(newConversation)
// Should use: setConversations([...conversations, newConversation])

// ❌ WRONG - Inconsistent naming
function get_conversation_data() { ... }  // Should be camelCase
const conversationData = await prisma.conversation.findFirst()  // Should be explicit with tenantId
```
