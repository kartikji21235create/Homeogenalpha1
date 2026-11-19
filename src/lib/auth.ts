/**
 * Authentication Helper (Market-Ready)
 *
 * In production: extracts doctor identity from Supabase session cookie.
 * In development: falls back to a demo doctor ID when AUTH_BYPASS=true or
 * when running against a local Supabase without real auth configured.
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AuthenticatedDoctor {
  doctorId: string;
}

const DEV_DOCTOR_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Returns the authenticated doctor or null if not authenticated.
 * Automatically falls back to dev doctor in development mode.
 */
export async function getAuthenticatedDoctor(): Promise<AuthenticatedDoctor | null> {
  // Development or test bypass: allow running without real Supabase auth
  if (
    process.env.AUTH_BYPASS === "true" ||
    process.env.NODE_ENV === "test" ||
    (process.env.NODE_ENV === "development" && !process.env.SUPABASE_AUTH_REQUIRED)
  ) {
    return { doctorId: DEV_DOCTOR_ID };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return { doctorId: user.id };
  } catch {
    return null;
  }
}

/**
 * Convenience: returns the doctor or a 401 JSON response.
 * Use in API route handlers:
 *   const [auth, errorResponse] = await requireAuth();
 *   if (errorResponse) return errorResponse;
 */
export async function requireAuth(): Promise<
  [AuthenticatedDoctor, null] | [null, NextResponse]
> {
  const auth = await getAuthenticatedDoctor();
  if (!auth) {
    return [
      null,
      NextResponse.json(
        {
          ok: false,
          error: {
            code: "unauthorized",
            message: "Authentication required. Please log in.",
          },
        },
        { status: 401 }
      ),
    ];
  }
  return [auth, null];
}
