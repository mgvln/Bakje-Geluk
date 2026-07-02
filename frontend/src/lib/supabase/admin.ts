import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

// Server-only client using the service role key. NEVER import into a client component.
// The service role key is secret and stays in an environment variable.
export function createAdminClient() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
