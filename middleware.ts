import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin-ksm routes (except login page and API auth)
  if (!pathname.startsWith('/admin-ksm')) {
    return NextResponse.next();
  }

  // Allow login page and auth API
  if (pathname === '/admin-ksm/login' || pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next();
  }

  // Check for admin session cookie
  const sessionCookie = request.cookies.get('admin_session');

  if (!sessionCookie?.value) {
    const loginUrl = new URL('/admin-ksm/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Validate session format (token:timestamp)
  const parts = sessionCookie.value.split(':');
  if (parts.length !== 2) {
    const loginUrl = new URL('/admin-ksm/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const timestamp = parseInt(parts[1], 10);
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in ms

  if (Date.now() - timestamp > maxAge) {
    // Session expired
    const response = NextResponse.redirect(new URL('/admin-ksm/login', request.url));
    response.cookies.delete('admin_session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin-ksm/:path*'],
};
