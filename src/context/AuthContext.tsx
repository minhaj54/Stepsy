'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '../lib/supabase/client';
import { normalizePhone } from '../lib/phone';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'vendor';
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  sendOtp: (phone: string, fullName?: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, code: string, fullName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Pick<UserProfile, 'full_name'>>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: UserProfile = {
  id: 'usr_whishkhu_99',
  full_name: 'Minhaj Raza',
  email: '9876543210@phone.whishkhu.app',
  phone: '+919876543210',
  role: 'customer',
  created_at: new Date().toISOString(),
};

// Build a profile purely from the auth user (no DB call). Used so the app can
// treat the user as signed-in immediately, even if the DB query is slow or
// unreachable.
function buildBaseProfile(authUser: SupabaseUser): UserProfile {
  let phoneFromAuth = authUser.phone ?? authUser.user_metadata?.phone ?? '';
  if (phoneFromAuth && !phoneFromAuth.startsWith('+')) {
    phoneFromAuth = '+' + phoneFromAuth;
  }

  let emailFromAuth = authUser.email ?? '';
  if (!emailFromAuth && phoneFromAuth) {
    // Use whishkhu.app for synthetic emails
    emailFromAuth = `${phoneFromAuth.replace('+', '')}@phone.whishkhu.app`;
  }

  return {
    id: authUser.id,
    full_name: authUser.user_metadata?.full_name ?? '',
    email: emailFromAuth,
    phone: phoneFromAuth,
    role: 'customer',
    created_at: authUser.created_at,
  };
}

async function fetchProfile(supabase: ReturnType<typeof createClient>, authUser: SupabaseUser): Promise<UserProfile> {
  const base = buildBaseProfile(authUser);
  try {
    console.log('[AuthContext] fetchProfile starting for user:', authUser.id);

    // We attempt to fetch the profile from public.users
    // This table is automatically populated by a Supabase trigger 'on_auth_user_created'
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      console.error('[AuthContext] fetchProfile error from supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error),
      });
      return base;
    }

    if (data) {
      console.log('[AuthContext] fetchProfile found existing profile:', data);
      const profile = { ...data } as UserProfile;
      if (profile.phone && !profile.phone.startsWith('+')) {
        profile.phone = '+' + profile.phone;
      }
      return profile;
    }

    // If profile doesn't exist yet, it's likely the trigger hasn't finished
    // or RLS is restricting access. Fall back to auth data.
    console.log('[AuthContext] fetchProfile profile not found in DB, using fallback');
    return base;
  } catch (err) {
    console.error('[AuthContext] fetchProfile unexpected error:', err);
    return base;
  }
}

// Set the user from auth data right away, then enrich with the DB profile in the
// background. This guarantees the user is considered signed-in (and the
// redirect fires) without waiting on a potentially slow/hanging DB query.
function applySession(
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>,
  supabase: ReturnType<typeof createClient>,
  authUser: SupabaseUser
) {
  setUser(buildBaseProfile(authUser));
  fetchProfile(supabase, authUser)
    .then((profile) => setUser((prev) => (prev?.id === profile.id ? profile : prev)))
    .catch(() => {});
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const init = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession?.user) {
          applySession(setUser, supabase, currentSession.user);
        }
      } catch {
        // Supabase unreachable
      } finally {
        setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, newSession: Session | null) => {
      try {
        setSession(newSession);
        if (newSession?.user) {
          applySession(setUser, supabase, newSession.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      } catch (err) {
        console.error('[AuthContext] onAuthStateChange error:', err);
      }
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const sendOtp = useCallback(async (phone: string, fullName?: string) => {
    if (!configured) return { error: 'Supabase is not configured.' };

    try {
      const normalizedPhone = normalizePhone(phone);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          shouldCreateUser: true,
          data: fullName ? { full_name: fullName.trim() } : {}
        }
      });

      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Network error.' };
    }
  }, [configured]);

  const verifyOtp = useCallback(async (phone: string, code: string, fullName?: string) => {
    if (!configured) return { error: 'Supabase is not configured.' };

    try {
      const normalizedPhone = normalizePhone(phone);
      const supabase = createClient();
      
      const { error, data } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: code.trim(),
        type: 'sms',
        options: {
          data: fullName ? { full_name: fullName.trim() } : {}
        }
      });

      if (error) return { error: error.message };
      
      // Background update for full_name if provided
      if (fullName && data.session?.user?.id) {
        (async () => {
          try {
            await supabase
              .from('users')
              .update({ full_name: fullName.trim() })
              .eq('id', data.session.user.id);
            await supabase.auth.updateUser({
              data: { full_name: fullName.trim() }
            });
          } catch (bgErr) {
            console.error('[AuthContext] verifyOtp bg update error:', bgErr);
          }
        })();
      }
      
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Network error.' };
    }
  }, [configured]);

  const signOut = useCallback(async () => {
    if (!configured) {
      setUser(MOCK_USER);
      return;
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    setUser(null);
    setSession(null);
  }, [configured]);

  const updateProfile = useCallback(async (data: Partial<Pick<UserProfile, 'full_name'>>) => {
    if (!configured || !user) return { error: 'Not authenticated.' };
    
    try {
      const supabase = createClient();
      const { error } = await supabase.from('users').update(data).eq('id', user.id);

      if (!error) {
        await supabase.auth.updateUser({ data: { full_name: data.full_name } });
        setUser((prev) => (prev ? { ...prev, ...data } : null));
      }
      return { error: error?.message ?? null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Network error.' };
    }
  }, [configured, user]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isConfigured: configured,
      sendOtp,
      verifyOtp,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
