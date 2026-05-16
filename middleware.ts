import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function verifySessionToken(token: string, timestamp: number, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${secret}:${timestamp}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const expectedToken = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return token === expectedToken;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /chantier-ksm7 routes (except login page and API auth)
  if (!pathname.startsWith('/chantier-ksm7')) {
    return NextResponse.next();
  }

  // Allow login page and auth API
  if (pathname === '/chantier-ksm7/login' || pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next();
  }

  // Check for admin session cookie
  const sessionCookie = request.cookies.get('admin_session');

  if (!sessionCookie?.value) {
    const loginUrl = new URL('/chantier-ksm7/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Validate session format (token:timestamp)
  const parts = sessionCookie.value.split(':');
  if (parts.length !== 2) {
    const loginUrl = new URL('/chantier-ksm7/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const [token, rawTs] = parts;
  const timestamp = parseInt(rawTs, 10);
  if (isNaN(timestamp)) {
    const loginUrl = new URL('/chantier-ksm7/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const maxAge = 4 * 60 * 60 * 1000; // 4 hours in ms

  if (Date.now() - timestamp > maxAge) {
    // Session expired
    const response = NextResponse.redirect(new URL('/chantier-ksm7/login', request.url));
    response.cookies.delete('admin_session');
    return response;
  }

  // Verify the token hash to prevent cookie forgery
  const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'fallback_secret';
  const isValid = await verifySessionToken(token, timestamp, sessionSecret);
  if (!isValid) {
    const response = NextResponse.redirect(new URL('/chantier-ksm7/login', request.url));
    response.cookies.delete('admin_session');
    return response;
  }

  // Activity detected: refresh the session to "slide" the 4-hour window
  // Re-sign with the current timestamp so the new cookie is also verifiable
  const newTimestamp = Date.now();
  const encoder = new TextEncoder();
  const data = encoder.encode(`${sessionSecret}:${newTimestamp}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const newToken = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const freshSession = `${newToken}:${newTimestamp}`;

  const response = NextResponse.next();
  response.cookies.set('admin_session', freshSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 4 * 60 * 60, // 4 hours in seconds
    path: '/',
  });

  return response;
}

export const config = {
  matcher: ['/chantier-ksm7/:path*'],
};
