import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Protected routes - require authentication
  const protectedRoutes = ['/dashboard', '/admin', '/conversations', '/team']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Fast path: public routes bypass Supabase session lookup
  if (!isProtectedRoute) {
    return NextResponse.next({
      request: req,
    })
  }

  let supabaseResponse = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            req.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect unauthenticated users from protected routes
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Forward tenant_id and role to request headers for API routes
  if (session?.user) {
    const tenantId = session.user.user_metadata.tenant_id
    const role = session.user.user_metadata.role
    if (tenantId) supabaseResponse.headers.set('x-tenant-id', tenantId)
    if (role) supabaseResponse.headers.set('x-user-role', role)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)'],
}
