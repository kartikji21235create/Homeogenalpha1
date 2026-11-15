import { createClient } from "@supabase/supabase-js";

/**
 * Service-role admin client.
 * Strictly forbidden in client/browser bundles (Problem 12, 27).
 * Used only in server loaders, background scripts, or database setup.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy-service-key";

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
