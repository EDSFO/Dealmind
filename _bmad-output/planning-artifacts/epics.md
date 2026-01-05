---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ["prd.md", "architecture.md"]
---

# DealMind - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for DealMind, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

# DealMind - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for DealMind, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Authentication & User Management (FR1-FR6):**

- **FR1:** Admin can create a new company account with organization name and basic information
- **FR2:** Admin can add new users to their company with email and role assignment
- **FR3:** Admin can remove users from their company
- **FR4:** Admin can assign one of three roles (Vendedor, Líder, Admin) to each user
- **FR5:** Users can log in with email and password
- **FR6:** System validates user access based on tenant_id and role

**Conversation Ingestion (FR7-FR10):**

- **FR7:** System can receive transcription data from Fireflies via webhook
- **FR8:** System can receive WhatsApp messages via integration
- **FR9:** Users can manually paste transcription text for analysis
- **FR10:** System stores all transcriptions with associated metadata (date, source, participants)

**AI Analysis & Insights (FR11-FR17):**

- **FR11:** System can extract detected interests from conversation text
- **FR12:** System can extract objections raised from conversation text
- **FR13:** System can extract commitments made from conversation text
- **FR14:** System can detect progress signals from conversation text
- **FR15:** System can detect risk signals from conversation text
- **FR16:** System can suggest next actions based on conversation analysis
- **FR17:** System can process transcription asynchronously via N8N + AI agent

**Conversation Viewing & Discovery (FR18-FR25):**

- **FR18:** Users can view a list of their analyzed conversations
- **FR19:** Users can view detailed insights for a specific conversation
- **FR20:** Vendedores can view only their own conversations
- **FR21:** Líderes can view all conversations from their team
- **FR22:** System displays visual indicators for risk/progress signals in conversation list
- **FR23:** Users can filter conversations by date
- **FR24:** Users can filter conversations by source (Fireflies, WhatsApp, Manual)
- **FR25:** Users can filter conversations by risk/progress status

**Admin & Configuration (FR26-FR30):**

- **FR26:** Admin can configure Fireflies webhook integration
- **FR27:** Admin can configure WhatsApp integration
- **FR28:** Admin can view adoption metrics showing active users count
- **FR29:** Admin can view which users have used the system in a time period
- **FR30:** System isolates all data by tenant_id to prevent cross-tenant access

**Data & Compliance (FR31-FR35):**

- **FR31:** System maintains audit logs of user login/logout events
- **FR32:** System maintains audit logs of permission changes
- **FR33:** System maintains audit logs of integration configuration changes
- **FR34:** Users can request deletion of their data per LGPD requirements
- **FR35:** Admin can configure data retention period for transcriptions

### NonFunctional Requirements

**Performance (NFR1-NFR4):**

- **NFR1:** System processes transcriptions and generates insights within 5 minutes of receipt
- **NFR2:** Web interface pages load within 3 seconds on standard broadband connection
- **NFR3:** Conversation list loads within 2 seconds for up to 100 conversations
- **NFR4:** System supports concurrent processing of 10 transcriptions without significant performance degradation

**Security (NFR5-NFR10):**

- **NFR5:** All data is encrypted in transit using TLS 1.3 or higher
- **NFR6:** All data is encrypted at rest using AES-256 or equivalent
- **NFR7:** System enforces complete tenant isolation via Row Level Security (RLS) at database level
- **NFR8:** User access is validated via JWT with tenant_id and role claims on every request
- **NFR9:** System maintains immutable audit logs for all security-relevant events
- **NFR10:** System supports LGPD data subject rights (export, deletion)

**Scalability (NFR11-NFR13):**

- **NFR11:** System architecture supports 10x user growth (10 to 100 users) with <10% performance degradation
- **NFR12:** Multi-tenant architecture enables horizontal scaling without database re-architecture
- **NFR13:** System can handle burst processing of 50 transcriptions in a 1-hour period

**Accessibility (NFR14-NFR16):**

- **NFR14:** Interface meets WCAG 2.1 Level A requirements for basic accessibility
- **NFR15:** Interface supports keyboard navigation for all core functions
- **NFR16:** Interface provides sufficient color contrast for readability (WCAG AA minimum)

**Integration (NFR17-NFR19):**

- **NFR17:** Fireflies webhook integration achieves >95% successful message receipt
- **NFR18:** WhatsApp integration handles message delivery with automatic retry on failure
- **NFR19:** Async processing via N8N includes queue management and automatic retry logic

**Reliability (NFR20-NFR22):**

- **NFR20:** System maintains 99%+ uptime availability (24/7 operation)
- **NFR21:** System automatically recovers from transient failures without data loss
- **NFR22:** Critical data (transcriptions, insights) is backed up daily with 30-day retention

### Additional Requirements

**Starter Template (from Architecture):**
- Initialize project using T3 Stack (create-t3-app)
- Configure for Next.js 15-16, TypeScript 5+, Tailwind CSS, tRPC, Prisma
- Use Supabase as database (PostgreSQL with RLS)
- Configure Vercel hosting with preview deployments

**Multi-Tenancy (from Architecture):**
- All database tables must include tenant_id column
- Implement Row Level Security (RLS) policies in Supabase
- Middleware to extract tenant_id from JWT claims
- Explicit tenant_id filtering in all Prisma queries
- Storage segregated by tenant

**Authentication (from Architecture):**
- Use @supabase/ssr for Next.js App Router authentication
- JWT structure includes: sub (user_id), tenant_id, role, email
- Three-tier RBAC: Vendedor/SDR, Líder, Admin
- Middleware validates Supabase session
- Authorization matrix enforced at API level

**AI/ML Pipeline (from Architecture):**
- Self-hosted N8N on Railway or VPS
- OpenAI GPT-4o-mini for conversation analysis
- Prompt engineering for structured extraction
- Output: interests, objections, commitments, progress_signals, risk_signals, next_actions
- Async processing pattern: Webhook → Next.js API → N8N → AI Agent → Database

**API & Communication (from Architecture):**
- Separate API routes for each integration (/api/webhooks/fireflies, /api/webhooks/whatsapp)
- tRPC for type-safe client-server communication
- Zod schemas for runtime validation
- Error handling: tRPC errors + Vercel logging

**Code Conventions (from Architecture):**
- Database: snake_case (tenant_id, created_at)
- TypeScript: camelCase (tenantId, createdAt)
- Components: PascalCase (ConversationList.tsx)
- API routes: kebab-case, plural (/api/webhooks/fireflies)
- User-facing messages: Portuguese language
- Co-located tests with source files

**Infrastructure (from Architecture):**
- Vercel hosting with single project, preview deployments
- Environment variables via Vercel dashboard
- Vercel Analytics and Logs for monitoring
- Automatic CI/CD on git push

### FR Coverage Map

**Epic 1 - Foundation & Project Setup:**
- Initialize T3 Stack project (Next.js, TypeScript, Tailwind, tRPC, Prisma)
- Configure Supabase connection and environment
- Implement @supabase/ssr authentication setup
- Define Prisma schema with tenant_id on all models
- Create middleware for tenant extraction and JWT validation
- Set up Vercel project with preview deployments
- Deploy N8N on Railway/VPS
- Configure OpenAI GPT-4o-mini integration
- Addresses NFR5-NFR22 (security, scalability, reliability, hosting)

**Epic 2 - Authentication & Tenant Management:**
FR1: Admin can create a new company account with organization name and basic information
FR2: Admin can add new users to their company with email and role assignment
FR3: Admin can remove users from their company
FR4: Admin can assign one of three roles (Vendedor, Líder, Admin) to each user
FR5: Users can log in with email and password
FR6: System validates user access based on tenant_id and role

**Epic 3 - Conversation Ingestion:**
FR7: System can receive transcription data from Fireflies via webhook
FR8: System can receive WhatsApp messages via integration
FR9: Users can manually paste transcription text for analysis
FR10: System stores all transcriptions with associated metadata (date, source, participants)

**Epic 4 - AI-Powered Insights:**
FR11: System can extract detected interests from conversation text
FR12: System can extract objections raised from conversation text
FR13: System can extract commitments made from conversation text
FR14: System can detect progress signals from conversation text
FR15: System can detect risk signals from conversation text
FR16: System can suggest next actions based on conversation analysis
FR17: System can process transcription asynchronously via N8N + AI agent

**Epic 5 - Conversation Discovery & Viewing:**
FR18: Users can view a list of their analyzed conversations
FR19: Users can view detailed insights for a specific conversation
FR20: Vendedores can view only their own conversations
FR21: Líderes can view all conversations from their team
FR22: System displays visual indicators for risk/progress signals in conversation list
FR23: Users can filter conversations by date
FR24: Users can filter conversations by source (Fireflies, WhatsApp, Manual)
FR25: Users can filter conversations by risk/progress status

**Epic 6 - Team Administration:**
FR26: Admin can configure Fireflies webhook integration
FR27: Admin can configure WhatsApp integration
FR28: Admin can view adoption metrics showing active users count
FR29: Admin can view which users have used the system in a time period
FR30: System isolates all data by tenant_id to prevent cross-tenant access

**Epic 7 - Compliance & Data Governance:**
FR31: System maintains audit logs of user login/logout events
FR32: System maintains audit logs of permission changes
FR33: System maintains audit logs of integration configuration changes
FR34: Users can request deletion of their data per LGPD requirements
FR35: Admin can configure data retention period for transcriptions

## Epic List

### Epic 1: Foundation & Project Setup
Initialize T3 Stack application with Supabase, Vercel, and N8N infrastructure ready for multi-tenant SaaS development.
**FRs covered:** Technical foundation (addresses NFR5-NFR22 + additional requirements)
**Stories:** 6 stories

### Epic 2: Authentication & Tenant Management
Users can register companies, invite team members, and log in with role-based access control.
**FRs covered:** FR1-FR6
**Stories:** 5 stories

### Epic 3: Conversation Ingestion
System receives and stores transcriptions from Fireflies webhooks, WhatsApp integration, and manual entry.
**FRs covered:** FR7-FR10
**Stories:** 4 stories

### Epic 4: AI-Powered Insights
Conversations are automatically analyzed by AI to extract interests, objections, commitments, and actionable next steps.
**FRs covered:** FR11-FR17
**Stories:** 5 stories

### Epic 5: Conversation Discovery & Viewing
Users can view their analyzed conversations with role-based visibility, filtering, and visual indicators for risk/progress.
**FRs covered:** FR18-FR25
**Stories:** 5 stories

### Epic 6: Team Administration
Admins can manage users, configure Fireflies and WhatsApp integrations, and view team adoption metrics.
**FRs covered:** FR26-FR30
**Stories:** 4 stories

### Epic 7: Compliance & Data Governance
System maintains immutable audit logs and supports LGPD data subject rights for export and deletion.
**FRs covered:** FR31-FR35
**Stories:** 4 stories

---

## Epic 1: Foundation & Project Setup

Initialize T3 Stack application with Supabase, Vercel, and N8N infrastructure ready for multi-tenant SaaS development.

**FRs covered:** Technical foundation (addresses NFR5-NFR22 + additional requirements)
**Stories:** 6 stories

### Story 1.1: Initialize T3 Stack Project

As a developer,
I want to create a new T3 Stack project with Next.js, TypeScript, Tailwind, tRPC, and Prisma,
So that I have a modern, type-safe foundation for building the DealMind application.

**Acceptance Criteria:**

**Given** a new directory for the DealMind project
**When** I run `npx create-t3-app@latest` with TypeScript, Tailwind, tRPC, and Prisma selected
**Then** a complete T3 Stack project is created with Next.js 15-16, TypeScript 5+, Tailwind CSS, tRPC, and Prisma configured
**And** the project structure follows T3 Stack conventions with src/ directory containing app/, server/, and shared/ folders
**And** package.json includes all necessary dependencies with correct versions
**And** the development server starts successfully with `npm run dev`

**Technical Notes:**
- Use Next.js 15 or 16 with App Router
- Configure TypeScript with strict mode enabled
- Set up Tailwind CSS with default configuration
- Initialize tRPC with Next.js App Router integration
- Configure Prisma for database access

**Dependencies:** None
**Addresses:** Starter Template requirement from Architecture

---

### Story 1.2: Configure Supabase Connection and Environment

As a developer,
I want to configure Supabase as the PostgreSQL database provider,
So that the application has a scalable, managed database with built-in Row Level Security.

**Acceptance Criteria:**

**Given** a T3 Stack project initialized in Story 1.1
**When** I create a Supabase project and configure environment variables
**Then** .env file contains DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, and NEXT_PUBLIC_SUPABASE_ANON_KEY
**And** Supabase PostgreSQL instance is connected and accessible from the application
**And** Prisma schema uses the Supabase PostgreSQL connection
**And** environment variables are documented in .env.example
**And** database connection is verified through Prisma `db push` command

**Technical Notes:**
- Create Supabase project at supabase.com
- Enable PostgreSQL database
- Generate API keys (anon and service_role)
- Configure DATABASE_URL for Prisma
- Store environment variables securely (never commit .env)

**Dependencies:** Story 1.1 must be complete
**Addresses:** Multi-Tenancy requirement for Supabase PostgreSQL

---

### Story 1.3: Define Core Prisma Schema with Multi-Tenancy

As a developer,
I want to define the initial Prisma schema with tenant_id on all models,
So that every database table supports multi-tenant data isolation.

**Acceptance Criteria:**

**Given** a connected Supabase database from Story 1.2
**When** I create the initial Prisma schema with tenant_id columns
**Then** schema.prisma includes User, Company, and Tenant models with proper relationships
**And** every model includes a tenant_id field (directly or through relation)
**And** tenant_id is indexed for query performance
**And** relationships between models include tenant_id in foreign keys
**And** schema follows snake_case convention for database fields
**And** `npx prisma db push` successfully creates tables in Supabase

**Technical Notes:**
- Use snake_case for database fields (tenant_id, created_at)
- Create @map annotations for TypeScript camelCase conversion
- Define Tenant model with id field as tenant identifier
- Add tenant_id to User, Company, and all future models
- Create indexes on tenant_id for all tables

**Dependencies:** Story 1.2 must be complete
**Addresses:** FR30 (tenant isolation), NFR7 (RLS foundation)

---

### Story 1.4: Implement Supabase SSR Authentication

As a developer,
I want to integrate @supabase/ssr for Next.js App Router authentication,
So that users can securely log in with JWT tokens containing tenant_id and role.

**Acceptance Criteria:**

**Given** a Prisma schema with User model from Story 1.3
**When** I implement @supabase/ssr authentication
**Then** supabase/server.ts and supabase/client.ts files are created for server and client authentication
**And** Supabase middleware validates session on every request
**And** JWT tokens include sub (user_id), tenant_id, role, and email claims
**And** protected routes redirect unauthenticated users to login
**And** user session is accessible in server components and API routes
**And** logout functionality properly clears session

**Technical Notes:**
- Install @supabase/ssr package
- Create server-side Supabase client utility
- Create client-side Supabase client utility
- Implement middleware for session validation
- Configure JWT structure with tenant_id and role
- Use Supabase Auth for email/password authentication

**Dependencies:** Story 1.3 must be complete
**Addresses:** FR5 (login), FR6 (access validation), NFR8 (JWT validation)

---

### Story 1.5: Deploy to Vercel with Preview Deployments

As a developer,
I want to deploy the application to Vercel with preview deployments on every push,
So that the team can review changes in isolated environments before production.

**Acceptance Criteria:**

**Given** a working T3 Stack application with authentication from Story 1.4
**When** I connect the project to Vercel and configure deployment settings
**Then** the application is deployed to Vercel with a production URL
**And** every git push triggers a preview deployment
**And** pull requests generate unique preview URLs
**And** environment variables are configured in Vercel dashboard
**And** database connection works in deployed environment
**And** Vercel Analytics is enabled for monitoring

**Technical Notes:**
- Install Vercel CLI: `npm i -g vercel`
- Connect GitHub repository to Vercel
- Configure build settings (Next.js default)
- Set environment variables in Vercel dashboard
- Enable preview deployments for all branches
- Configure custom domain (optional)

**Dependencies:** Story 1.4 must be complete
**Addresses:** NFR20 (uptime), NFR21 (recovery), Infrastructure requirement

---

### Story 1.6: Deploy N8N and Configure OpenAI Integration

As a developer,
I want to deploy a self-hosted N8N instance and configure OpenAI GPT-4o-mini integration,
So that the application can asynchronously process conversations through AI analysis.

**Acceptance Criteria:**

**Given** a deployed Vercel application from Story 1.5
**When** I deploy N8N to Railway/VPS and configure OpenAI API
**Then** N8N instance is running and accessible via a public URL
**And** N8N has a workflow configured to receive webhooks from Next.js
**And** OpenAI API key is configured in N8N credentials
**And** test workflow successfully calls GPT-4o-mini and returns a response
**And** N8N queue management is enabled for async processing
**And** Next.js can send transcription data to N8N webhook endpoint
**And** N8N can write results back to Supabase database

**Technical Notes:**
- Deploy N8N on Railway or VPS (Railway recommended)
- Configure N8N with environment variables for OpenAI API key
- Create test workflow with Webhook trigger → OpenAI node → Webhook response
- Store OpenAI API key securely (never commit to git)
- Configure retry logic in N8N for failed AI calls
- Document N8N webhook URL for Next.js integration

**Dependencies:** Story 1.5 must be complete
**Addresses:** FR17 (async processing), NFR17 (webhook reliability), AI/ML Pipeline requirement

---

## Epic 2: Authentication & Tenant Management

Users can register companies, invite team members, and log in with role-based access control.

**FRs covered:** FR1-FR6
**Stories:** 6 stories

### Story 2.1: Company Registration

As a new admin user,
I want to register a new company account with organization name and basic information,
So that my team can use DealMind with our own isolated tenant environment.

**Acceptance Criteria:**

**Given** I am not logged in and access the DealMind application
**When** I navigate to the registration page and submit company name, my email, and password
**Then** a new Tenant record is created with a unique tenant_id
**And** a new Company record is created linked to the tenant_id
**And** a new User record is created with ADMIN role linked to the tenant_id
**And** I am automatically logged in and redirected to the dashboard
**And** a success message confirms my company account is created
**And** all database records include the same tenant_id for isolation

**Technical Notes:**
- Create registration form with company name, email, password fields
- Use Supabase Auth to create user account
- Create Tenant record first (generate unique UUID)
- Create Company record with tenant_id
- Update User record with tenant_id and ADMIN role
- Use database transaction to ensure all-or-nothing creation
- Validate email format and password strength

**Dependencies:** Epic 1 stories must be complete
**Addresses:** FR1 (create company account), FR5 (login with email/password)

---

### Story 2.2: User Login and Session Management

As a registered user,
I want to log in with my email and password,
So that I can access my company's DealMind environment.

**Acceptance Criteria:**

**Given** I have a registered user account
**When** I enter my email and password on the login page
**Then** my credentials are validated against Supabase Auth
**And** if valid, a JWT token is issued containing sub (user_id), tenant_id, role, and email
**And** I am redirected to the dashboard
**And** my session persists across page refreshes
**And** if invalid, an error message displays indicating invalid credentials
**And** after 7 days of inactivity, my session expires and I must log in again

**Technical Notes:**
- Use @supabase/ssr for authentication
- Create login form with email and password fields
- Call Supabase signInWithPassword API
- Extract tenant_id and role from user metadata
- Store session in HTTP-only cookies
- Implement session validation middleware
- Handle authentication errors with user-friendly messages

**Dependencies:** Story 2.1 must be complete
**Addresses:** FR5 (login with email/password), FR6 (validate access)

---

### Story 2.3: Add User to Company with Role Assignment

As an admin,
I want to invite new users to my company by email and assign them a role,
So that my team members can access DealMind with appropriate permissions.

**Acceptance Criteria:**

**Given** I am logged in as an ADMIN
**When** I navigate to the team management page and enter a new user's email and select a role (Vendedor, Líder, or Admin)
**Then** the system sends an invitation email to the specified address
**And** a pending User record is created with the assigned role and my tenant_id
**And** the user appears in my team list with "Pending" status
**And** when the user clicks the invitation link and sets their password, their status changes to "Active"
**And** the new user can log in and see only data from my tenant_id

**Technical Notes:**
- Create "Add User" form in admin panel
- Validate email format and check if user already exists in tenant
- Generate unique invitation token
- Send invitation email using Resend or SendGrid
- Store invitation token and expiration date in User record
- Create invitation acceptance endpoint to complete registration
- Validate tenant_id isolation (cannot add users to other tenants)

**Dependencies:** Story 2.2 must be complete
**Addresses:** FR2 (add users with email and role), FR4 (assign roles)

---

### Story 2.4: Remove User from Company

As an admin,
I want to remove users from my company,
So that I can manage team access and revoke access when needed.

**Acceptance Criteria:**

**Given** I am logged in as an ADMIN
**When** I view the team list and click "Remove" on a user
**Then** a confirmation dialog asks me to confirm the removal
**And** when confirmed, the User record is soft-deleted (marked as deleted with timestamp)
**And** the user's session is immediately invalidated
**And** the user cannot log in again
**And** all historical data created by the user is preserved for audit purposes
**And** the user no longer appears in the active team list

**Technical Notes:**
- Implement soft delete with deleted_at timestamp
- Add deletedAt field to User model in Prisma
- Revoke all active sessions for the user
- Filter out deleted users from queries
- Preserve conversation records for data continuity
- Add audit log entry for user deletion

**Dependencies:** Story 2.3 must be complete
**Addresses:** FR3 (remove users), FR32 (audit logs of permission changes)

---

### Story 2.5: Change User Role

As an admin,
I want to change a user's role within my company,
So that I can adjust permissions as team responsibilities change.

**Acceptance Criteria:**

**Given** I am logged in as an ADMIN
**When** I view a user's profile and select a different role (Vendedor, Líder, or Admin)
**Then** the user's role is updated in the database
**And** the change takes effect on the user's next request
**And** an audit log entry is created recording the role change
**And** the user's permissions immediately reflect the new role
**And** if the user is currently logged in, they see the updated permissions on page refresh
**And** a success message confirms the role change

**Technical Notes:**
- Create role change dropdown in user management
- Validate that only ADMIN can change roles
- Update role field in User record
- Create audit log entry with timestamp, admin user, target user, old role, new role
- Clear user's session cache to force permission refresh
- Validate tenant_id isolation (cannot change users from other tenants)

**Dependencies:** Story 2.4 must be complete
**Addresses:** FR4 (assign roles), FR32 (audit logs of permission changes)

---

### Story 2.6: Implement Role-Based Access Control (RBAC)

As a developer,
I want to implement middleware and authorization checks that enforce role-based permissions,
So that users can only access features appropriate to their role.

**Acceptance Criteria:**

**Given** a user is logged in with a specific role (Vendedor, Líder, or Admin)
**When** the user attempts to access a protected resource
**Then** the system validates the user's tenant_id and role before granting access
**And** Vendedor (SDR) role can only view their own conversations
**And** Líder role can view conversations from all users in their tenant
**And** Admin role can access all features including team management and integrations
**And** unauthorized access attempts are logged and return a 403 Forbidden error
**And** every API route includes tenant_id validation to prevent cross-tenant access

**Technical Notes:**
- Create role enum: VENDEDOR, LIDER, ADMIN
- Implement authorization middleware for tRPC procedures
- Create helper functions: isAuthorized(role, requiredRole)
- Add tenant_id check in every database query
- Use Prisma middleware to automatically filter by tenant_id
- Create authorization matrix documentation
- Log all authorization failures

**Dependencies:** Story 2.5 must be complete
**Addresses:** FR6 (validate access based on tenant_id and role), FR30 (tenant isolation)

---

## Epic 3: Conversation Ingestion

System receives and stores transcriptions from Fireflies webhooks, WhatsApp integration, and manual entry.

**FRs covered:** FR7-FR10
**Stories:** 5 stories

### Story 3.1: Create Conversation Schema and Storage

As a developer,
I want to create the Prisma schema for conversations with all metadata fields,
So that transcription data from any source can be stored with proper tenant isolation.

**Acceptance Criteria:**

**Given** the foundation from Epic 1 is complete
**When** I add the Conversation model to the Prisma schema
**Then** the Conversation model includes: id, tenant_id, user_id, source, transcription_text, participants, conversation_date, created_at, updated_at
**And** tenant_id and user_id are indexed for query performance
**And** source enum includes: FIREFLIES, WHATSAPP, MANUAL
**And** participants field stores JSON array of participant names
**And** conversation_date is indexed for filtering and sorting
**And** `npx prisma db push` successfully creates the table in Supabase with RLS policies

**Technical Notes:**
- Add Conversation model to schema.prisma
- Define source enum type
- Create indexes on tenant_id, user_id, conversation_date
- Add Row Level Security (RLS) policy: tenant_id = auth.tenant_id()
- Create foreign key to User table
- Use Text type for transcription_text (unlimited length)

**Dependencies:** Epic 2 must be complete
**Addresses:** FR10 (store transcriptions with metadata), FR30 (tenant isolation)

---

### Story 3.2: Manual Transcription Entry

As a Vendedor,
I want to manually paste conversation text for analysis,
So that I can get insights from meetings that weren't automatically recorded.

**Acceptance Criteria:**

**Given** I am logged in as any user role
**When** I navigate to "New Conversation" and paste transcription text, enter participant names, and select the conversation date
**Then** a new Conversation record is created with source = MANUAL
**And** the record includes my user_id and tenant_id
**And** the transcription_text is stored exactly as I pasted it
**And** the participants array is stored from my input
**And** the conversation_date is saved from my input (defaults to today if not specified)
**And** a success message confirms the conversation was submitted
**And** the conversation appears in my conversation list with "Processing" status

**Technical Notes:**
- Create manual entry form with: text area for transcription, participant input (comma-separated), date picker
- Validate that transcription_text is not empty
- Create Conversation record with MANUAL source
- Trigger N8N webhook for async processing
- Redirect to conversation list after submission
- Sanitize input to prevent XSS

**Dependencies:** Story 3.1 must be complete
**Addresses:** FR9 (manual paste), FR10 (store with metadata)

---

### Story 3.3: Fireflies Webhook Integration

As a system,
I want to receive transcription data from Fireflies via webhook,
So that transcriptions from Fireflies.ai meetings are automatically ingested.

**Acceptance Criteria:**

**Given** Fireflies is configured to send webhooks to DealMind
**When** Fireflies sends a POST request to /api/webhooks/fireflies with transcription data
**Then** the API validates the webhook signature for security
**And** a new Conversation record is created with source = FIREFLIES
**And** the record includes: transcription_text, participants, conversation_date, and Fireflies metadata
**And** the record is associated with the correct tenant_id (from webhook payload or mapping)
**And** the webhook returns a 200 OK response
**And** if the webhook payload is invalid, a 400 error is returned
**And** N8N is triggered to process the conversation asynchronously

**Technical Notes:**
- Create /api/webhooks/fireflies.ts route
- Validate Fireflies webhook signature (if available)
- Parse Fireflies JSON payload structure
- Extract: transcript.text, transcript.attendees, transcript.date
- Map Fireflies webhook to tenant_id (requires configuration in Story 6.2)
- Handle duplicate webhooks (idempotent processing)
- Implement retry logic for failed webhook processing

**Dependencies:** Story 3.2 must be complete
**Addresses:** FR7 (receive Fireflies webhooks), FR10 (store with metadata), NFR17 (95% success rate)

---

### Story 3.4: WhatsApp Integration

As a Vendedor,
I want to link my WhatsApp account so that WhatsApp messages are automatically imported,
So that my WhatsApp conversations with prospects are analyzed for insights.

**Acceptance Criteria:**

**Given** I am logged in as any user
**When** I navigate to integrations settings and authorize WhatsApp
**Then** I am redirected to WhatsApp Business API authorization flow
**And** after authorization, a webhook URL is registered with WhatsApp
**When** I send or receive a message via WhatsApp
**Then** the message is received via /api/webhooks/whatsapp
**And** a new Conversation record is created with source = WHATSAPP
**And** the transcription_text contains the message conversation
**And** the participants array includes the phone numbers involved
**And** the record is associated with my user_id and tenant_id
**And** N8N is triggered to process the conversation

**Technical Notes:**
- Create /api/webhooks/whatsapp.ts route
- Integrate with WhatsApp Business API (using Twilio or Meta API)
- Store WhatsApp credentials securely per tenant
- Parse WhatsApp webhook payload (messages, sender, timestamp)
- Group consecutive messages into conversation threads
- Handle media messages (transcribe audio if needed)

**Dependencies:** Story 3.3 must be complete
**Addresses:** FR8 (receive WhatsApp messages), FR10 (store with metadata), NFR18 (automatic retry)

---

### Story 3.5: N8N Async Processing Integration

As a system,
I want to send new conversations to N8N for AI analysis,
So that conversations are processed asynchronously without blocking the user interface.

**Acceptance Criteria:**

**Given** a new Conversation record is created from any source (manual, Fireflies, WhatsApp)
**When** the conversation is saved to the database
**Then** a webhook POST request is sent to the N8N workflow endpoint
**And** the payload includes: conversation_id, tenant_id, transcription_text
**And** the request includes a retry header for N8N queue management
**And** if N8N is unreachable, the conversation is marked with status = PENDING_RETRY
**And** the conversation status is updated to PROCESSING when N8N acknowledges receipt
**And** N8N updates the conversation status to COMPLETED when analysis is finished
**And** the user can see the processing status in the conversation list

**Technical Notes:**
- Implement async webhook call using fetch with no await
- Create N8N webhook endpoint URL configuration
- Add conversation status enum: PENDING, PROCESSING, COMPLETED, FAILED
- Implement retry logic with exponential backoff
- Create /api/webhooks/n8n-callback for N8N to update status
- Use background job queue (preferred) or async webhook calls
- Log all N8N communication for debugging

**Dependencies:** Story 3.4 must be complete
**Addresses:** FR17 (async processing via N8N), NFR1 (5-minute processing), NFR19 (retry logic)

---

## Epic 4: AI-Powered Insights

Conversations are automatically analyzed by AI to extract interests, objections, commitments, and actionable next steps.

**FRs covered:** FR11-FR17
**Stories:** 5 stories

### Story 4.1: Create Insight Storage Schema

As a developer,
I want to create the Prisma schema for storing AI-generated insights,
So that extracted interests, objections, commitments, signals, and next actions can be persisted.

**Acceptance Criteria:**

**Given** the Conversation model from Epic 3 exists
**When** I add the Insight model to the Prisma schema
**Then** the Insight model includes: id, conversation_id (foreign key), interests, objections, commitments, progress_signals, risk_signals, next_actions, created_at
**And** interests, objections, commitments, and next_actions are stored as JSON arrays
**And** progress_signals and risk_signals are stored as JSON objects with severity scores
**And** conversation_id is a required foreign key to the Conversation table
**And** a one-to-one relationship exists between Conversation and Insight
**And** `npx prisma db push` successfully creates the table with RLS policies

**Technical Notes:**
- Add Insight model to schema.prisma
- Define JSON field types for arrays and objects
- Create foreign key constraint: onDelete CASCADE
- Add unique constraint on conversation_id
- Create RLS policy: tenant_id matches conversation's tenant_id
- Index conversation_id for fast lookups

**Dependencies:** Epic 3 must be complete
**Addresses:** FR11-FR16 (storage for all insight types)

---

### Story 4.2: Design OpenAI Prompt for Structured Extraction

As a developer,
I want to create and test an OpenAI prompt that extracts structured insights from conversation text,
So that AI consistently outputs interests, objections, commitments, and signals in JSON format.

**Acceptance Criteria:**

**Given** an OpenAI GPT-4o-mini API key is configured
**When** I send a conversation transcription to the API with a structured prompt
**Then** the response includes all six insight types: interests, objections, commitments, progress_signals, risk_signals, next_actions
**And** each insight type follows the defined JSON schema
**And** interests are extracted as specific topics the prospect mentioned
**And** objections are extracted as concerns or hesitations raised
**And** commitments are extracted as promises or agreements made
**And** progress_signals are extracted with a confidence score (0-1)
**And** risk_signals are extracted with a severity score (0-1)
**And** next_actions are extracted as actionable follow-up items

**Technical Notes:**
- Create prompt engineering test suite with sample conversations
- Define JSON schema for each insight type
- Use OpenAI Functions or JSON mode for structured output
- Test with 10+ sample sales conversations
- Validate output schema compliance
- Iterate on prompt until extraction accuracy >85%
- Document prompt in N8N workflow

**Dependencies:** Story 4.1 must be complete
**Addresses:** FR11-FR16 (extract all insight types), NFR1 (5-minute processing)

---

### Story 4.3: Implement N8N Workflow for AI Processing

As a developer,
I want to create an N8N workflow that receives conversations, calls OpenAI, and stores insights,
So that conversations are automatically analyzed without manual intervention.

**Acceptance Criteria:**

**Given** the OpenAI prompt from Story 4.2 is finalized
**When** a new conversation webhook is received by N8N
**Then** N8N extracts the conversation_id and transcription_text from the payload
**And** N8N calls OpenAI GPT-4o-mini with the structured prompt
**And** N8N parses the AI response JSON
**And** N8N validates the response against the Insight schema
**And** N8N makes a POST request to /api/insights with the extracted insights
**And** the API creates the Insight record linked to the conversation
**And** N8N updates the conversation status to COMPLETED
**And** if any step fails, N8N retries up to 3 times with exponential backoff
**And** if all retries fail, the conversation status is set to FAILED

**Technical Notes:**
- Create N8N workflow with: Webhook Trigger → OpenAI Node → JSON Parse → HTTP Request (to API) → Set Status
- Configure OpenAI node with GPT-4o-mini model
- Set temperature to 0.3 for consistent extraction
- Add error handling workflow for failed extractions
- Configure retry logic: 1s, 5s, 15s intervals
- Log all workflow executions in N8N
- Monitor workflow execution time (target: <30 seconds)

**Dependencies:** Story 4.2 must be complete
**Addresses:** FR17 (async processing via N8N), NFR1 (5-minute processing), NFR19 (retry logic)

---

### Story 4.4: Create API Endpoint for Insight Storage

As a developer,
I want to create an API endpoint that receives and stores AI-generated insights,
So that N8N can save extracted insights back to the DealMind database.

**Acceptance Criteria:**

**Given** the Insight model from Story 4.1 exists
**When** N8N POSTs to /api/insights with insight data
**Then** the API validates the request includes: conversation_id, interests, objections, commitments, progress_signals, risk_signals, next_actions
**And** the API validates that the conversation exists and belongs to the same tenant
**And** the API creates an Insight record with all provided data
**And** the API returns a 201 Created response with the insight_id
**And** if validation fails, the API returns a 400 Bad Request with error details
**And** if the conversation is not found, the API returns a 404 Not Found
**And** the API validates the JSON structure of each field

**Technical Notes:**
- Create /api/insights.ts route with POST handler
- Use Zod schemas for runtime validation of insight fields
- Validate tenant_id from conversation (prevent cross-tenant writes)
- Implement Prisma transaction to ensure atomic creation
- Add error handling and logging
- Return JSON API response with insight_id

**Dependencies:** Story 4.3 must be complete
**Addresses:** FR17 (store insights from N8N), NFR19 (retry logic)

---

### Story 4.5: Update Conversation Status on Processing Completion

As a system,
I want to update the conversation status when AI processing completes,
So that users know when their conversation insights are ready to view.

**Acceptance Criteria:**

**Given** a conversation is in PROCESSING status
**When** N8N successfully creates the Insight record via the API
**Then** the API updates the conversation status to COMPLETED
**And** the conversation's updated_at timestamp is set
**And** if the N8N workflow fails after 3 retries, the status is set to FAILED
**And** users viewing the conversation list see the updated status
**And** visual indicators show success (green) or failure (red) status
**And** failed conversations can be retried by the user

**Technical Notes:**
- Update /api/insights.ts to set conversation status
- Add status field to Conversation model: PENDING, PROCESSING, COMPLETED, FAILED
- Implement retry endpoint: POST /api/conversations/:id/retry
- Add error_reason field to store failure details
- Send notification to user when processing completes (optional)
- Log all status transitions for audit

**Dependencies:** Story 4.4 must be complete
**Addresses:** FR17 (async processing completion), NFR1 (5-minute processing), NFR21 (automatic recovery)

---

## Epic 5: Conversation Discovery & Viewing

Users can view their analyzed conversations with role-based visibility, filtering, and visual indicators for risk/progress.

**FRs covered:** FR18-FR25
**Stories:** 5 stories

### Story 5.1: Create Conversation List View

As a Vendedor,
I want to view a list of all my analyzed conversations,
So that I can quickly access insights from my past interactions.

**Acceptance Criteria:**

**Given** I am logged in as a Vendedor
**When** I navigate to the "Conversations" page
**Then** I see a table or list of all conversations where user_id = my user_id
**And** each conversation shows: conversation date, source icon (Fireflies/WhatsApp/Manual), participant names, status indicator
**And** conversations are sorted by conversation_date in descending order (newest first)
**And** only conversations with status = COMPLETED are shown (processing conversations hidden)
**And** clicking a conversation row navigates to the conversation detail page
**And** the list loads within 2 seconds for up to 100 conversations
**And** if I have no conversations, a friendly empty state message is displayed

**Technical Notes:**
- Create /conversations route with server component
- Query Prisma with user_id filter and tenant_id validation
- Implement pagination (load 50 conversations per page)
- Use Tailwind for styling the table/list
- Add "Load More" button for pagination
- Optimize query with database indexes
- Cache results for 30 seconds

**Dependencies:** Epic 4 must be complete
**Addresses:** FR18 (view list), FR20 (Vendedor sees own only), NFR3 (2-second load)

---

### Story 5.2: Create Conversation Detail View

As a Vendedor,
I want to view detailed insights for a specific conversation,
So that I can review interests, objections, commitments, and next actions.

**Acceptance Criteria:**

**Given** I am viewing the conversation list
**When** I click on a conversation row
**Then** I navigate to the conversation detail page
**And** I see the full transcription text in a scrollable section
**And** I see a section for "Interests Detected" with a list of extracted interests
**And** I see a section for "Objections Raised" with a list of objections
**And** I see a section for "Commitments Made" with a list of commitments
**And** I see a section for "Next Actions" with a list of suggested follow-ups
**And** I see visual indicators for progress signals (green) and risk signals (red)
**And** I can copy the transcription text to clipboard
**And** the page loads within 3 seconds

**Technical Notes:**
- Create /conversations/[id] route with server component
- Query both Conversation and Insight records
- Display insights in collapsible sections or cards
- Use color coding: green for progress, red for risk, yellow for warnings
- Add copy-to-clipboard button for transcription
- Implement error handling if conversation not found
- Validate tenant_id access control

**Dependencies:** Story 5.1 must be complete
**Addresses:** FR19 (view detailed insights), NFR2 (3-second load)

---

### Story 5.3: Implement Líder Role - View Team Conversations

As a Líder,
I want to view all conversations from my team,
So that I can monitor overall deal progress and identify coaching opportunities.

**Acceptance Criteria:**

**Given** I am logged in as a Líder
**When** I navigate to the "Team Conversations" page
**Then** I see a list of all conversations where tenant_id = my tenant_id (not just my user_id)
**And** each conversation shows an additional column: "Owner" (the user who created the conversation)
**And** I can filter the list by owner to see specific team member conversations
**And** I can click any conversation to view its details (same as Vendedor view)
**And** I cannot modify or delete conversations from other team members
**And** the list includes conversations from all team members across all time

**Technical Notes:**
- Create /team-conversations route for Líder access only
- Query Prisma with tenant_id filter (not user_id)
- Join with User table to display owner names
- Add authorization check: user.role === LIDER or ADMIN
- Reuse conversation detail page from Story 5.2
- Add owner filter dropdown

**Dependencies:** Story 5.2 must be complete
**Addresses:** FR21 (Líder sees team conversations), FR6 (role-based access)

---

### Story 5.4: Add Visual Indicators for Risk and Progress Signals

As a user,
I want to see visual indicators for risk and progress signals in the conversation list,
So that I can quickly identify which conversations need attention.

**Acceptance Criteria:**

**Given** I am viewing the conversation list
**When** conversations have risk_signals or progress_signals in their insights
**Then** conversations with high risk signals (severity > 0.7) display a red indicator icon
**And** conversations with moderate risk signals (0.4-0.7) display a yellow indicator icon
**And** conversations with strong progress signals (confidence > 0.7) display a green indicator icon
**And** hovering over an indicator shows a tooltip with the top 3 signals
**And** the indicator appears in a dedicated column in the table
**And** conversations with no signals display a neutral gray indicator
**And** I can sort the list by risk level or progress level

**Technical Notes:**
- Add signal strength calculation function
- Create icon components: RiskIcon, ProgressIcon
- Add Tooltip component for hover details
- Implement sorting by signal strength
- Use Tailwind colors: red-500, yellow-500, green-500
- Cache signal calculations for performance

**Dependencies:** Story 5.3 must be complete
**Addresses:** FR22 (visual indicators), FR15 (risk signals), FR14 (progress signals)

---

### Story 5.5: Implement Conversation Filtering

As a user,
I want to filter conversations by date, source, and risk/progress status,
So that I can find specific conversations relevant to my current needs.

**Acceptance Criteria:**

**Given** I am viewing the conversation list
**When** I apply filters from the filter bar
**Then** I can filter by date range using a date picker (start date and end date)
**And** I can filter by source using a dropdown: All, Fireflies, WhatsApp, Manual
**And** I can filter by risk level: All, High Risk, Medium Risk, Low Risk
**And** I can filter by progress level: All, Strong Progress, Moderate Progress, Low Progress
**And** I can combine multiple filters (e.g., date range + source + risk level)
**And** the filtered list updates within 2 seconds
**And** a "Clear Filters" button resets all filters to show all conversations
**And** the current filters are reflected in the URL (for bookmarking and sharing)

**Technical Notes:**
- Create filter bar component with dropdowns and date pickers
- Use URL query params for filter state (?startDate=..., source=...)
- Implement Prisma query building with dynamic where clauses
- Add database indexes on filtered fields for performance
- Debounce filter inputs to avoid excessive queries
- Show filter count badge when filters are active
- Test filter combinations for correct SQL generation

**Dependencies:** Story 5.4 must be complete
**Addresses:** FR23 (filter by date), FR24 (filter by source), FR25 (filter by risk/progress)

---

## Epic 6: Team Administration

Admins can manage users, configure Fireflies and WhatsApp integrations, and view team adoption metrics.

**FRs covered:** FR26-FR30
**Stories:** 4 stories

### Story 6.1: Create Admin Dashboard with Adoption Metrics

As an admin,
I want to view an admin dashboard showing team adoption metrics,
So that I can understand how actively my team is using DealMind.

**Acceptance Criteria:**

**Given** I am logged in as an ADMIN
**When** I navigate to the "Admin Dashboard"
**Then** I see a metric card showing "Total Active Users" (users who logged in within the last 30 days)
**And** I see a metric card showing "Total Conversations Processed" (all time)
**And** I see a metric card showing "Conversations This Month" (current calendar month)
**And** I see a list of all users in my tenant with their last login date
**And** I see a list of users who have never logged in (invited but not accepted)
**And** I can filter the user list by date range (e.g., "Active users in last 7 days")
**And** the metrics update within 3 seconds when the page loads

**Technical Notes:**
- Create /admin route with ADMIN role authorization
- Query User table for login dates (store last_login_at field)
- Count conversations with tenant_id filter
- Aggregate metrics with Prisma's _count, _avg functions
- Display metrics in card grid layout
- Add user table with status badges: Active, Pending, Inactive
- Implement date range filter for activity reports

**Dependencies:** Epic 2 must be complete
**Addresses:** FR28 (adoption metrics), FR29 (which users used system), FR6 (role validation)

---

### Story 6.2: Configure Fireflies Webhook Integration

As an admin,
I want to configure the Fireflies webhook integration for my tenant,
So that Fireflies transcriptions are automatically imported into DealMind.

**Acceptance Criteria:**

**Given** I am logged in as an ADMIN
**When** I navigate to "Integrations" and select Fireflies
**Then** I see a form to enter my Fireflies API key
**And** I see a webhook URL that I need to configure in Fireflies (unique to my tenant)
**And** the webhook URL includes my tenant_id for routing
**When** I save my Fireflies API key
**Then** the key is encrypted and stored in the database
**And** a test webhook is sent to validate the configuration
**And** a success message confirms the integration is active
**And** I can disconnect the integration at any time
**And** the Fireflies webhook URL includes tenant identification for multi-tenant routing

**Technical Notes:**
- Create Integrations model: id, tenant_id, provider (FIREFLIES, WHATSAPP), api_key_encrypted, webhook_url, is_active
- Create /admin/integrations/fireflies route
- Encrypt API key before storing (use crypto or Supabase vault)
- Generate tenant-specific webhook URL: /api/webhooks/fireflies?tenant={tenant_id}
- Implement test webhook button that sends sample data
- Add connection status indicator: Connected, Not Connected, Error
- Validate tenant_id isolation (each tenant has independent integrations)

**Dependencies:** Story 6.1 must be complete
**Addresses:** FR26 (configure Fireflies webhook), FR33 (audit logs of integration changes)

---

### Story 6.3: Configure WhatsApp Integration

As an admin,
I want to configure the WhatsApp Business API integration for my tenant,
So that team members can link their WhatsApp accounts for automatic message import.

**Acceptance Criteria:**

**Given** I am logged in as an ADMIN
**When** I navigate to "Integrations" and select WhatsApp
**Then** I see a button to "Connect WhatsApp Business API"
**When** I click the button
**Then** I am redirected to the WhatsApp Business API OAuth flow (or Twilio/360dialog flow)
**And** after authorization, I am redirected back to DealMind with an access token
**And** the access token is encrypted and stored
**And** a webhook URL is registered with WhatsApp for my tenant
**And** I can see the connection status and test the integration
**And** I can disconnect the integration, which revokes DealMind's access

**Technical Notes:**
- Use WhatsApp Business API (via Meta, Twilio, or 360dialog)
- Store OAuth credentials: access_token, refresh_token, phone_number_id
- Encrypt credentials with tenant-specific encryption key
- Register webhook URL with WhatsApp API upon connection
- Implement webhook verification endpoint
- Create /admin/integrations/whatsapp route
- Add audit log entry when integration is configured/disconnected

**Dependencies:** Story 6.2 must be complete
**Addresses:** FR27 (configure WhatsApp integration), FR33 (audit logs of integration changes)

---

### Story 6.4: Verify Tenant Isolation Across All Operations

As a developer,
I want to add comprehensive tenant_id validation to all database operations,
So that no user can access or modify data from another tenant.

**Acceptance Criteria:**

**Given** users from multiple tenants exist in the database
**When** any database query is executed (whether via Prisma or direct SQL)
**Then** the query includes a tenant_id filter
**And** users from Tenant A cannot query conversations from Tenant B
**And** users from Tenant A cannot modify insights from Tenant B
**And** users from Tenant A cannot view users from Tenant B
**And** attempting to access cross-tenant data returns a 403 Forbidden error
**And** all cross-tenant access attempts are logged in the audit log
**And** Row Level Security (RLS) policies in Supabase enforce tenant_id = auth.tenant_id()
**And** manual SQL queries include WHERE tenant_id = :tenant_id clause

**Technical Notes:**
- Add Prisma middleware to automatically inject tenant_id filter on all queries
- Create utility function: requireTenantAccess(user, resource)
- Add RLS policies to all tables in Supabase
- Test with cross-tenant access attempts (should fail)
- Create audit log for authorization failures
- Document tenant isolation pattern in code comments
- Run security audit to verify no cross-tenant leaks

**Dependencies:** Story 6.3 must be complete
**Addresses:** FR30 (tenant isolation), NFR7 (RLS enforcement), NFR8 (JWT validation)

---

## Epic 7: Compliance & Data Governance

System maintains immutable audit logs and supports LGPD data subject rights for export and deletion.

**FRs covered:** FR31-FR35
**Stories:** 4 stories

### Story 7.1: Implement Immutable Audit Logging

As a system,
I want to maintain immutable audit logs of all security-relevant events,
So that we have a complete history of user actions for compliance and security monitoring.

**Acceptance Criteria:**

**Given** a security-relevant event occurs (login, permission change, integration config)
**When** the event is triggered
**Then** an AuditLog record is created with: timestamp, tenant_id, user_id, event_type, resource_id, old_value, new_value
**And** the record includes the IP address and user agent of the request
**And** the record is created in a separate database table with write-once, read-only access
**And** the AuditLog table has RLS policies allowing only admins to read logs
**And** audit logs cannot be deleted or modified (immutable)
**And** the following events are logged: user login/logout, role changes, user additions/removals, integration changes, data exports, data deletions

**Technical Notes:**
- Create AuditLog model: id, tenant_id, user_id, event_type, resource_type, resource_id, old_value, new_value, ip_address, user_agent, created_at
- Add event_type enum: LOGIN, LOGOUT, ROLE_CHANGE, USER_ADDED, USER_REMOVED, INTEGRATION_CONFIGURED, DATA_EXPORTED, DATA_DELETED
- Create audit log utility function: logAuditEvent()
- Call logAuditEvent() in all relevant API routes and middleware
- Set up RLS: only admins can query AuditLog for their tenant
- Prevent deletion: add database trigger to prevent DELETE on AuditLog

**Dependencies:** Epic 6 must be complete
**Addresses:** FR31 (login/logout logs), FR32 (permission change logs), FR33 (integration change logs), NFR9 (immutable audit logs)

---

### Story 7.2: Implement LGPD Data Export

As a user,
I want to request a copy of all my personal data,
So that I can exercise my right to data portability under LGPD.

**Acceptance Criteria:**

**Given** I am logged in as any user
**When** I navigate to "My Account" and click "Request Data Export"
**Then** the system initiates an async job to compile all my personal data
**And** I see a message that my export is being prepared
**And** within 5 minutes, I receive an email with a download link
**And** the download link contains a JSON file with: my user profile, all conversations I created, all insights linked to my conversations, my audit log entries
**And** the export includes only data from my tenant (no cross-tenant data)
**And** the download link expires after 7 days
**And** the export event is logged in the audit log

**Technical Notes:**
- Create /api/user/data-export endpoint
- Query all user-related data: User, Conversation, Insight, AuditLog
- Aggregate data into structured JSON format
- Generate secure download URL with expiration token
- Send email with download link using Resend or SendGrid
- Store export file in temporary storage (Vercel Blob or Supabase Storage)
- Implement background job for export generation
- Add audit log entry for data export request

**Dependencies:** Story 7.1 must be complete
**Addresses:** FR34 (LGPD data export), NFR10 (LGPD data subject rights)

---

### Story 7.3: Implement LGPD Data Deletion

As a user,
I want to request permanent deletion of my personal data,
So that I can exercise my right to be forgotten under LGPD.

**Acceptance Criteria:**

**Given** I am logged in as any user
**When** I navigate to "My Account" and click "Request Data Deletion"
**Then** a warning dialog explains that this action is irreversible
**And** I must type "DELETE" to confirm the request
**When** I confirm the deletion
**Then** my user account is soft-deleted (marked deleted with timestamp)
**And** all conversations I created are soft-deleted
**And** all insights linked to my conversations are soft-deleted
**And** my email is anonymized (replaced with deleted-{id}@anonymous.local)
**And** I am immediately logged out and redirected to the home page
**And** I cannot log in again (account deleted)
**And** the deletion event is logged in the audit log
**And** historical data is preserved for audit purposes but anonymized

**Technical Notes:**
- Create /api/user/data-deletion endpoint
- Implement soft delete cascade: User → Conversations → Insights
- Anonymize personal data: replace email, name with placeholders
- Add deleted_at timestamp to all relevant models
- Require type confirmation: "DELETE" string matching
- Revoke all sessions immediately
- Log deletion in AuditLog before anonymizing data
- Send confirmation email to user (before deleting email)
- Implement 30-day grace period for data recovery (optional)

**Dependencies:** Story 7.2 must be complete
**Addresses:** FR34 (LGPD data deletion), NFR10 (LGPD right to deletion)

---

### Story 7.4: Implement Configurable Data Retention Policies

As an admin,
I want to configure how long transcriptions and insights are retained,
So that I can comply with company data governance policies.

**Acceptance Criteria:**

**Given** I am logged in as an ADMIN
**When** I navigate to "Data Retention Settings"
**Then** I see a form to set retention periods for: Transcriptions, Insights, Audit Logs
**And** I can set each retention period in days (e.g., 365 days, 730 days)
**When** I save the retention settings
**Then** the values are stored in a TenantSettings table
**And** a scheduled job runs daily to delete records older than the retention period
**And** deleted records are soft-deleted with deleted_at timestamp
**And** I receive a notification summary of how many records were deleted
**And** the retention policy change is logged in the audit log
**And** I cannot set retention below 90 days (minimum compliance requirement)

**Technical Notes:**
- Create TenantSettings model: id, tenant_id, transcription_retention_days, insight_retention_days, audit_log_retention_days
- Create /admin/data-retention route
- Add Vercel Cron job or scheduled function to run daily cleanup
- Query records where created_at < retention_threshold
- Soft delete records (set deleted_at)
- Send summary email to admin after cleanup job runs
- Validate minimum retention: 90 days for transcriptions, 365 days for audit logs
- Log retention policy changes in AuditLog

**Dependencies:** Story 7.3 must be complete
**Addresses:** FR35 (configure data retention), NFR22 (critical data backup), NFR10 (LGPD compliance)

---
