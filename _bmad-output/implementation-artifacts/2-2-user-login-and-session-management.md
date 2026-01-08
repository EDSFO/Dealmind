# Story 2.2: User Login and Session Management

Status: ready-for-dev

## Story

As a registered user,
I want to log in with my email and password,
so that I can access my company's DealMind environment.

## Acceptance Criteria

**Given** I have a registered user account
**When** I enter my email and password on the login page
**Then** my credentials are validated against Supabase Auth
**And** if valid, a JWT token is issued containing sub (user_id), tenant_id, role, and email
**And** I am redirected to the dashboard
**And** my session persists across page refreshes
**And** if invalid, an error message displays indicating invalid credentials
**And** after 7 days of inactivity, my session expires and I must log in again

## Tasks / Subtasks

- [ ] Task 1: Update login form component (AC: #)
  - [ ] Subtask 1.1: Design login form with email and password fields
  - [ ] Subtask 1.2: Add "Esqueci minha senha" link
  - [ ] Subtask 1.3: Add "Criar conta" link for new users
- [ ] Task 2: Implement Supabase Auth signInWithPassword (AC: #)
  - [ ] Subtask 2.1: Call supabase.auth.signInWithPassword() API
  - [ ] Subtask 2.2: Extract tenant_id and role from session
  - [ ] Subtask 2.3: Handle auth errors with user-friendly messages
- [ ] Task 3: Implement session management (AC: #)
  - [ ] Subtask 3.1: Store session in HTTP-only cookies via @supabase/ssr
  - [ ] Subtask 3.2: Configure session expiration (7 days)
  - [ ] Subtask 3.3: Implement session refresh on activity
- [ ] Task 4: Configure middleware for session validation (AC: #)
  - [ ] Subtask 4.1: Validate session on protected routes
  - [ ] Subtask 4.2: Redirect unauthenticated users to login
  - [ ] Subtask 4.3: Extract tenant_id and role from JWT claims
- [ ] Task 5: Add redirect logic after login (AC: #)
  - [ ] Subtask 5.1: Redirect to dashboard on successful login
  - [ ] Subtask 5.2: Preserve return URL for originally requested page
  - [ ] Subtask 5.3: Display welcome message on dashboard

## Dev Notes

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
- Detected conflicts or variances (with rationale)

### References

- [Source: planning-artifacts/epics.md#Story-2.2]
- [Source: planning-artifacts/architecture.md#Authentication-&-Security]
- [Source: planning-artifacts/architecture.md#Multi-Tenancy-Enforcement-Patterns]

## Dev Agent Record

### Agent Model Used

MiniMax-M2.1

### Debug Log References

### Completion Notes List

### File List

---

## Developer Context Section

### STORY FOUNDATION

**User Story:** As a registered user, I want to log in with my email and password, so that I can access my company's DealMind environment.

**Business Value:**
- Enables existing users to access their company's DealMind environment
- Establishes secure session-based authentication
- Enforces multi-tenancy through JWT claims
- Provides seamless user experience with session persistence

**Dependencies:**
- Story 2-1 (Company Registration) must be complete
- Supabase Auth configured via @supabase/ssr
- Middleware for route protection already implemented (Epic 1)

**Addresses:**
- FR5 (login with email/password)
- FR6 (validate access based on tenant_id and role)

### ARCHITECTURE COMPLIANCE

**Critical Architecture Requirements:**

1. **Authentication (MANDATORY):**
   - Use `@supabase/ssr` for Next.js App Router authentication
   - Call `supabase.auth.signInWithPassword()` for email/password login
   - Session stored in HTTP-only cookies
   - JWT contains: `sub` (user_id), `tenant_id`, `role`, `email`
   - See: [architecture.md#Authentication-Method-@-supabase/ssr]

2. **Session Management:**
   - Session expiration: 7 days of inactivity
   - Automatic session refresh
   - HTTP-only cookies for security
   - See: [architecture.md#Security-Middleware]

3. **Middleware Enforcement:**
   - Validate session on all protected routes
   - Redirect unauthenticated users to /login
   - Extract tenant_id and role from JWT claims
   - See: [architecture.md#Authorization-Pattern-RBAC-with-Middleware-Enforcement]

4. **User-Facing Messages (Portuguese):**
   - All UI text in Portuguese
   - Error messages user-friendly and actionable
   - Examples:
     - "Login realizado com sucesso!"
     - "E-mail ou senha incorretos"
     - "Sua sessão expirou. Faça login novamente."

### LIBRARY & FRAMEWORK REQUIREMENTS

**Required Libraries:**
- `@supabase/ssr` (latest for Next.js App Router)
- `@supabase/supabase-js` (Auth client)
- `zod` (validation - included with T3 Stack)

**tRPC Integration:**
- No tRPC procedure needed for login (direct Supabase Auth)
- Client-side form submission with Supabase Auth
- Server-side session validation in middleware

**Session Flow:**
```typescript
// 1. Client-side login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

if (error) {
  // Show error message
  return { error: error.message }
}

// 2. Session is automatically stored in cookies by @supabase/ssr
// 3. Middleware validates session on protected routes
// 4. User is redirected to dashboard
```

### FILE STRUCTURE REQUIREMENTS

**New/Modified Files:**

```
src/
├── app/
│   ├── (auth)/                  # Auth layout group
│   │   ├── login/
│   │   │   └── page.tsx         # Login page (exists - may need update)
│   │   └── layout.tsx           # Auth layout
│   ├── (dashboard)/             # Protected dashboard layout
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Dashboard
│   │   └── layout.tsx           # Dashboard layout with auth check
│   └── api/
│       └── auth/
│           └── [...nextauth]/   # Not needed - using Supabase SSR
├── components/
│   └── ui/                      # Reusable UI components
└── middleware.ts                # Already exists - may need updates
```

**Route Structure:**
- Login page: `/login`
- Dashboard: `/dashboard` (protected)
- Auth callbacks: `/auth/callback`

### TESTING REQUIREMENTS

**Test Coverage:**

1. **Form Validation Tests:**
   - Email format validation
   - Password required

2. **Login Flow Tests:**
   - Successful login with valid credentials
   - Invalid email/password error
   - Non-existent user error
   - Redirect to dashboard

3. **Session Management Tests:**
   - Session persists across page refreshes
   - Session expires after 7 days inactivity
   - Auto-redirect for unauthenticated users
   - Return URL preservation

4. **Multi-Tenancy Tests:**
   - User can only access their tenant's data
   - JWT contains correct tenant_id and role

**Test Files Location:**
```
tests/
├── unit/
│   └── login-form.test.ts
├── integration/
│   └── login-flow.test.ts
└── e2e/
    └── login.cy.ts (if using Cypress)
```

### PREVIOUS STORY INTELLIGENCE

**From Story 2-1 (Company Registration):**
- Registration form created at `/register`
- Supabase Auth signUp implemented
- Prisma transaction for Tenant/Company/User creation
- Custom claims (tenant_id, role) set in app_metadata
- Portuguese error messages implemented

**Carry forward to Story 2-2:**
- Same form styling patterns
- Same error message approach
- Same Zod validation patterns
- Same Supabase client usage

### GIT INTELLIGENCE SUMMARY

Recent work shows:
- Login page exists at `/login`
- Middleware handles auth validation
- Supabase SSR clients configured
- Follow similar patterns for consistency

### LATEST TECH INFORMATION

**Supabase Auth Session Best Practices 2025:**
- Use `@supabase/ssr` for automatic cookie handling
- `signInWithPassword()` for email/password auth
- Session auto-refreshes via the SSR package
- Middleware validates before any protected route

**Next.js 15 Middleware:**
- Middleware runs before route handlers
- Can rewrite/redirect based on auth state
- Cookies accessible in middleware

### PROJECT CONTEXT REFERENCE

**DealMind is a multi-tenant SaaS B2B platform for sales conversation intelligence.**

Key context:
- 3-tier RBAC: VENDEDOR, LIDER, ADMIN
- Portuguese user-facing interface
- Tenant isolation via tenant_id + RLS
- Session-based authentication with JWT

---

## Technical Implementation Details

### Login Form Component

```typescript
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError('E-mail ou senha incorretos')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded border p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded border p-2"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
```

### Middleware for Session Validation

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  // Validate session
  const { data: { session } } = await supabase.auth.getSession()

  const protectedPaths = ['/dashboard', '/conversations', '/admin']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Redirect to login if accessing protected path without session
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if accessing login with valid session
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/conversations/:path*',
    '/admin/:path*',
    '/login'
  ]
}
```

### Error Messages (Portuguese)

| Error | Message |
|-------|---------|
| Invalid credentials | "E-mail ou senha incorretos" |
| User not found | "Usuário não encontrado" |
| Session expired | "Sua sessão expirou. Faça login novamente." |
| Network error | "Erro de conexão. Verifique sua internet." |
| Success | "Login realizado com sucesso!" |

### Role-Based Access Summary

| Role | Access Level |
|------|--------------|
| VENDEDOR | Own conversations only |
| LIDER | All team conversations |
| ADMIN | Full access including user management |

---

## Implementation Checklist

- [ ] Login page updated at `/login`
- [ ] Login form with email and password fields
- [ ] "Esqueci minha senha" link
- [ ] "Criar conta" link for new users
- [ ] Supabase Auth signInWithPassword implemented
- [ ] Session stored in HTTP-only cookies
- [ ] Middleware validates session on protected routes
- [ ] Redirect unauthenticated users to login
- [ ] Redirect authenticated users away from login
- [ ] Return URL preservation
- [ ] Session expiration (7 days)
- [ ] Portuguese error messages
- [ ] Form styling with Tailwind CSS
- [ ] Unit tests for validation
- [ ] Integration tests for login flow
- [ ] Session persistence tests
