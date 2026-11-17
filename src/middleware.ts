import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory rate limiting map: ip/token -> record
// NOTE: In serverless environments (Vercel, Cloud Run), this map resets on each
// cold start. For multi-instance production, use Redis or Vercel KV.
const rateLimitMap = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_MINUTE = 60;

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ["/login", "/privacy-notice", "/api/auth", "/share"];

function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const authHeader = req.headers.get("authorization") || "";
  return authHeader ? `${ip}_${authHeader.slice(-16)}` : ip;
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Rate limiting for API routes
  if (pathname.startsWith("/api")) {
    const clientKey = getClientIdentifier(req);
    const now = Date.now();

    const record = rateLimitMap.get(clientKey);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(clientKey, {
        count: 1,
        resetAt: now + WINDOW_MS,
      });
    } else {
      record.count += 1;
      if (record.count > MAX_REQUESTS_PER_MINUTE) {
        return new NextResponse(
          JSON.stringify({
            ok: false,
            error: {
              code: "rate_limit_exceeded",
              message: "Too many requests. Please slow down.",
              retry_after_seconds: Math.ceil((record.resetAt - now) / 1000),
            },
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(Math.ceil((record.resetAt - now) / 1000)),
              "X-RateLimit-Limit": String(MAX_REQUESTS_PER_MINUTE),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }
    }

    const currentRecord = rateLimitMap.get(clientKey)!;
    const remaining = Math.max(0, MAX_REQUESTS_PER_MINUTE - currentRecord.count);

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(MAX_REQUESTS_PER_MINUTE));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  }

  // 2. Auth protection for non-public page routes
  // Skip in development bypass mode
  if (
    process.env.AUTH_BYPASS === "true" ||
    (process.env.NODE_ENV === "development" && !process.env.SUPABASE_AUTH_REQUIRED)
  ) {
    return NextResponse.next();
  }

  // Skip public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Skip static assets & Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for authenticated session via Supabase cookie
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-anon-key";

    const response = NextResponse.next();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch {
    // If auth check fails, allow through in dev mode
    if (process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
