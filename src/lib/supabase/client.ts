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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables.');
  }

  browserClient = createBrowserClient(url!, key!);

  return browserClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Check if the Supabase project is reachable.
 * Returns true if the project responds, false if it's unreachable (e.g., paused project).
 */
export async function checkSupabaseConnectivity(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return false;

  // Try to reach the Supabase REST API health endpoint
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
      },
      signal: controller.signal,
    });

    return response.ok || response.status === 404 || response.status === 401;
  } catch (error) {
    // An aborted request (timeout or component unmount/navigation) is an
    // expected condition, not a failure worth surfacing. Only log genuine
    // connectivity problems.
    if (error instanceof DOMException && error.name === 'AbortError') {
      return false;
    }
    console.error('[Supabase] Connectivity check failed:', error);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
