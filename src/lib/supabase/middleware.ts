import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  // Only do auth checks for protected routes
  const needsAuth = pathname.startsWith('/admin') || pathname.startsWith('/account');
  if (!needsAuth) {
    return supabaseResponse;
  }

  let user = null;
  try {
    // Race against a 3-second timeout to avoid blocking slow/unreachable Supabase
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);
    if (result && typeof result === 'object' && 'data' in result) {
      user = (result as { data: { user: unknown } }).data.user;
    }
  } catch {
    // If Supabase is unreachable, allow the request through (client-side will handle auth)
    return supabaseResponse;
  }

  if (pathname.startsWith('/admin') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/admin') && user) {
    let profile = null;
    try {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', (user as { id: string }).id)
        .single();
      profile = data;
    } catch {
      // If DB is unreachable, allow through
      return supabaseResponse;
    }

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/account') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
