import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/reset-password'];
const PROTECTED_PREFIXES = ['/dashboard', '/onboarding'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  // Supabase stores session in sb-<project>-auth-token cookie (base64 JSON)
  // We check for any sb-*-auth-token cookie to determine auth state
  const cookies = request.cookies.getAll();
  const hasSession = cookies.some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token') && c.value
  );

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!hasSession && isProtected) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
