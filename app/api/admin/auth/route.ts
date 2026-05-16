import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Rate limiting basique en mémoire (se reset au redémarrage du serveur)
// Pour une protection robuste en prod, utiliser Upstash/Redis.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getRateLimitKey(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function POST(req: Request) {
  // Rate limiting
  const ip = getRateLimitKey(req);
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry) {
    if (now < entry.resetAt) {
      if (entry.count >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
          { status: 429 }
        );
      }
      entry.count++;
    } else {
      loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    }
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'fallback_secret';

    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }

    // Create a simple session token (hash of secret + timestamp)
    const timestamp = Date.now();
    const encoder = new TextEncoder();
    const data = encoder.encode(`${sessionSecret}:${timestamp}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store token with timestamp for validation
    const sessionValue = `${token}:${timestamp}`;

    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4, // 4 hours
    });

    // Reset du compteur après connexion réussie
    loginAttempts.delete(ip);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
