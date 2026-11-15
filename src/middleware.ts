import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory rate limiting map: ip/token -> record
const rateLimitMap = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_MINUTE = 60; // 60 requests per minute per client

function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const authHeader = req.headers.get("authorization") || "";
  return authHeader ? `${ip}_${authHeader.slice(-16)}` : ip;
}

export function middleware(req: NextRequest) {
  // Apply rate limiting specifically to API routes
  if (req.nextUrl.pathname.startsWith("/api")) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
