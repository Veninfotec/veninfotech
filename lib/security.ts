import { NextRequest, NextResponse } from 'next/server';

/**
 * Approved origins permitted to query internal data mutation and admin endpoints.
 */
const PRODUCTION_ORIGINS = new Set([
  'http://localhost:3000',
  'https://veninfotech.net',
  'https://www.veninfotech.net',
]);

/**
 * Validates if an origin or request is allowed to access internal API endpoints.
 * Enforces checking against https://veninfotech.net in production,
 * while allowing local development and Vercel preview environments.
 */
export function isAllowedOrigin(origin: string | null | undefined, request?: NextRequest): boolean {
  // 1. Direct match on production domains
  if (origin && PRODUCTION_ORIGINS.has(origin.toLowerCase())) {
    return true;
  }

  // 2. Custom environment override
  if (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN) {
    return true;
  }

  // 3. Development / Localhost verification
  if (origin) {
    try {
      const url = new URL(origin);
      if (
        process.env.NODE_ENV !== 'production' &&
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
      ) {
        return true;
      }
      // Vercel preview domains
      if (url.hostname.endsWith('.vercel.app')) {
        return true;
      }
    } catch {
      return false;
    }
  }

  // 4. Request headers fallback (same-origin browser navigation / internal SSR fetch)
  if (!origin && request) {
    const secFetchSite = request.headers.get('sec-fetch-site');
    // Block explicitly cross-site requests with no Origin header
    if (secFetchSite === 'cross-site') {
      return false;
    }

    // Inspect Referer header
    const referer = request.headers.get('referer');
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        return isAllowedOrigin(refererUrl.origin, request);
      } catch {
        return false;
      }
    }

    // Inspect Host header for same-server internal requests
    const host = request.headers.get('host');
    if (
      host === 'veninfotech.net' ||
      host === 'www.veninfotech.net' ||
      (process.env.NODE_ENV !== 'production' &&
        (host?.includes('localhost') || host?.includes('127.0.0.1')))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Returns CORS headers restricted to trusted origins (defaulting to https://veninfotech.net).
 */
export function getCorsHeaders(request?: NextRequest): Record<string, string> {
  const origin = request?.headers.get('origin');
  const allowedOrigin =
    origin && isAllowedOrigin(origin, request)
      ? origin
      : 'https://veninfotech.net';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

/**
 * Validates request origin against https://veninfotech.net.
 * Returns null if allowed, or a 403 Forbidden NextResponse if origin validation fails.
 */
export function validateApiOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');

  if (!isAllowedOrigin(origin, request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden: Request origin is not permitted.',
      },
      {
        status: 403,
        headers: getCorsHeaders(request),
      },
    );
  }

  return null;
}

/**
 * Preflight OPTIONS request handler for internal API endpoints.
 */
export function handleCorsPreflight(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  if (!isAllowedOrigin(origin, request)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}
