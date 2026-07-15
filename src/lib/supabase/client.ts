import { createBrowserClient } from '@supabase/ssr';

// Singleton browser client. Reusing a single instance is critical: the
// onAuthStateChange subscription (set up in AuthContext) and the verifyOtp /
// sendOtp calls must operate on the SAME client, otherwise the SIGNED_IN event
// never reaches the listener that sets the user. createBrowserClient stores the
// session in cookies by default, which is required so the server (middleware,
// /account) can read the session too.
let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return browserClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
