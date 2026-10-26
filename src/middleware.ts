import { NextRequest, NextResponse } from 'next/server';

/**
 * Basic authentication middleware for the admin panel.
 * Credentials come from ADMIN_USER / ADMIN_PASS env vars (runtime, server-only).
 */
export function middleware(request: NextRequest) {
  const user = process.env.ADMIN_USER ?? 'admin';
  const pass = process.env.ADMIN_PASS ?? '';

  // If no password is configured, skip auth (dev mode)
  if (!pass) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Admin authentication is not configured', { status: 503 });
    }
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      try {
        const decoded = atob(encoded);
        const separator = decoded.indexOf(':');
        if (separator >= 0 && decoded.slice(0, separator) === user && decoded.slice(separator + 1) === pass) return NextResponse.next();
      } catch { /* Malformed credentials receive the normal authentication challenge. */ }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Persona Admin"',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|fonts/|favicon.ico).*)'],
};
