import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      req,
      res,
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes - require authentication
  const protectedRoutes = ['/dashboard', '/admin', '/conversations', '/team']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/auth')

  // Redirect unauthenticated users from protected routes
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect authenticated users from auth routes
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Forward tenant_id and role to request headers for API routes
  if (session?.user) {
    const tenantId = session.user.user_metadata.tenant_id
    const role = session.user.user_metadata.role
    if (tenantId) res.headers.set('x-tenant-id', tenantId)
    if (role) res.headers.set('x-user-role', role)
  }

  return res
}

export const config = {
  matcher: ['/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)'],
}
