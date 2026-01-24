import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// =============================================================================
// CP-005 FIX: Rate Limiting
// =============================================================================
// Simple in-memory rate limiting (per-instance, suitable for basic protection)
// Note: In production with multiple instances, consider using Redis/Upstash
// =============================================================================

const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    Array.from(rateLimit.entries()).forEach(([key, value]) => {
      if (now > value.resetTime) {
        rateLimit.delete(key);
      }
    });
    lastCleanup = now;
  }
}

const RATE_LIMITS: Record<string, { windowMs: number; max: number }> = {
  '/api/invite': { windowMs: 60000, max: 10 },       // 10 req/min for invite
  '/api/cron': { windowMs: 3600000, max: 2 },        // 2 req/hour for cron
  '/api/alerts/check': { windowMs: 60000, max: 20 }, // 20 req/min for alert check
  '/api/alerts': { windowMs: 60000, max: 30 },       // 30 req/min for alerts CRUD
  '/api/portfolio/history': { windowMs: 60000, max: 30 }, // 30 req/min for history
  '/api/portfolio': { windowMs: 60000, max: 60 },    // 60 req/min for portfolio
  'default': { windowMs: 60000, max: 100 },          // 100 req/min default
};

function getRateLimitConfig(pathname: string): { windowMs: number; max: number } {
  // Check most specific paths first (sorted by specificity)
  const sortedPaths = Object.keys(RATE_LIMITS)
    .filter(path => path !== 'default')
    .sort((a, b) => b.length - a.length);

  for (const path of sortedPaths) {
    if (pathname.startsWith(path)) {
      return RATE_LIMITS[path];
    }
  }
  return RATE_LIMITS.default;
}

function checkRateLimit(ip: string, pathname: string): { allowed: boolean; retryAfter?: number } {
  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const config = getRateLimitConfig(pathname);

  const current = rateLimit.get(key);

  if (!current || now > current.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true };
  }

  if (current.count >= config.max) {
    return {
      allowed: false,
      retryAfter: Math.ceil((current.resetTime - now) / 1000)
    };
  }

  current.count++;
  return { allowed: true };
}

// =============================================================================
// CP-007 FIX: CORS Configuration
// =============================================================================

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'https://chainpulsetest1.vercel.app',
  'https://vault-portfolio.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

function setCorsHeaders(response: NextResponse, origin: string | null): void {
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
}

function setSecurityHeaders(response: NextResponse): void {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}

// =============================================================================
// Middleware Entry Point
// =============================================================================

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only apply rate limiting and CORS to API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const origin = request.headers.get('origin');

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });

    if (isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin!);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    }

    return response;
  }

  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  // Cleanup stale rate limit entries periodically
  cleanupRateLimitMap();

  // Check rate limit
  const rateLimitResult = checkRateLimit(ip, pathname);

  if (!rateLimitResult.allowed) {
    const response = NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: rateLimitResult.retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter!.toString(),
        }
      }
    );
    setCorsHeaders(response, origin);
    setSecurityHeaders(response);
    return response;
  }

  // Continue with the request
  const response = NextResponse.next();

  // Add CORS headers for actual requests
  setCorsHeaders(response, origin);

  // Add security headers
  setSecurityHeaders(response);

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
