'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured, checkSupabaseConnectivity } from '../lib/supabase/client';
import { normalizePhone } from '../lib/phone';
import { canResendOtp, recordOtpSend, recordOtpAttempt, clearOtpAttempts, isOtpLocked, getRemainingAttempts } from '../lib/auth/rateLimiter';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'vendor';
  created_at: string;
}

interface SendOtpResult {
  error: string | null;
  isNewUser?: boolean;
}

interface VerifyOtpResult {
  error: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  supabaseReachable: boolean;
  sendOtp: (phone: string, fullName?: string) => Promise<SendOtpResult>;
  verifyOtp: (phone: string, code: string, fullName?: string) => Promise<VerifyOtpResult>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Pick<UserProfile, 'full_name'>>) => Promise<{ error: string | null }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: UserProfile = {
  id: 'usr_zarwinto_99',
  full_name: 'Minhaj Raza',
  email: '9876543210@phone.zarwinto.app',
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
    // Use zarwinto.app for synthetic emails
    emailFromAuth = `${phoneFromAuth.replace('+', '')}@phone.zarwinto.app`;
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
    // We attempt to fetch the profile from public.users
    // This table is automatically populated by a Supabase trigger 'on_auth_user_created'
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      // Check if this is a network-level "Failed to fetch" error
      const isNetworkError = error.message === 'Failed to fetch' || error.details?.includes('Failed to fetch');
      if (isNetworkError) {
        console.error('[AuthContext] fetchProfile network error - Supabase may be unreachable:', {
          message: error.message,
          details: error.details,
        });
      } else {
        console.error('[AuthContext] fetchProfile error from supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
      }
      return base;
    }

    if (data) {
      const profile = { ...data } as UserProfile;
      if (profile.phone && !profile.phone.startsWith('+')) {
        profile.phone = '+' + profile.phone;
      }
      return profile;
    }

    // If profile doesn't exist yet, it's likely the trigger hasn't finished
    // or RLS is restricting access. Fall back to auth data.
    return base;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const isNetworkError = errorMessage === 'Failed to fetch';
    if (isNetworkError) {
      console.error('[AuthContext] fetchProfile network error - Supabase may be unreachable:', err);
    } else {
      console.error('[AuthContext] fetchProfile unexpected error:', err);
    }
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
  const [supabaseReachable, setSupabaseReachable] = useState(true);
  const configured = isSupabaseConfigured();

  // Check Supabase connectivity on mount
  useEffect(() => {
    if (!configured) return;

    checkSupabaseConnectivity()
      .then((reachable) => {
        setSupabaseReachable(reachable);
        if (!reachable) {
          console.warn('[AuthContext] Supabase project appears to be unreachable. Check if the project is paused or the URL is correct.');
        }
      })
      .catch(() => {
        setSupabaseReachable(false);
      });
  }, [configured]);

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
      } catch (err) {
        console.error('[AuthContext] init error:', err);
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

  const sendOtp = useCallback(async (phone: string, fullName?: string): Promise<SendOtpResult> => {
    if (!configured) return { error: 'Supabase is not configured.' };

    try {
      const normalizedPhone = normalizePhone(phone);
      const supabase = createClient();

      // Check resend cooldown
      const resendCheck = canResendOtp(normalizedPhone);
      if (!resendCheck.allowed) {
        const remainingSeconds = Math.ceil(resendCheck.remainingMs / 1000);
        return { error: `Please wait ${remainingSeconds} seconds before requesting a new OTP.` };
      }

      // Check if phone is locked due to too many failed VERIFICATION attempts
      const lockCheck = isOtpLocked(normalizedPhone);
      if (lockCheck.locked) {
        const lockoutMinutes = Math.ceil((lockCheck.lockedUntil! - Date.now()) / 60000);
        return { error: `Too many failed OTP attempts. Try again in ${lockoutMinutes} minutes.` };
      }

      // Check if user already exists (tolerant of +91 vs 91 storage formats).
      // Uses a SECURITY DEFINER RPC because the users table's SELECT RLS policy
      // (auth.uid() = id) returns nothing for unauthenticated users.
      const { data: existsData, error: existsErr } = await supabase
        .rpc('check_user_registered', { p_phone: normalizedPhone });

      if (existsErr) {
        console.error('[AuthContext] check_user_registered error:', existsErr);
        return { error: 'Unable to verify account status. Please try again.' };
      }

      const isNewUser = !existsData;

      // In login mode (no fullName provided), reject unregistered users
      if (isNewUser && !fullName) {
        return {
          error: 'User not registered. Please sign up first.',
          isNewUser: false,
        };
      }

      // In signup mode, reject already-registered users  
      if (!isNewUser && fullName) {
        return {
          error: 'Account already exists with this number. Please sign in instead.',
          isNewUser: false,
        };
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          shouldCreateUser: isNewUser,
          data: fullName ? { full_name: fullName.trim() } : {}
        }
      });

      if (error) return { error: error.message };

      // Record successful send and clear any previous failed attempts
      recordOtpSend(normalizedPhone);
      clearOtpAttempts(normalizedPhone);

      return { error: null, isNewUser };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Network error.' };
    }
  }, [configured]);

  const verifyOtp = useCallback(async (phone: string, code: string, fullName?: string): Promise<VerifyOtpResult> => {
    if (!configured) return { error: 'Supabase is not configured.' };

    try {
      const normalizedPhone = normalizePhone(phone);
      const supabase = createClient();

      // Check if phone is locked — read-only, does not increment attempt count
      const lockCheck = isOtpLocked(normalizedPhone);
      if (lockCheck.locked) {
        const lockoutMinutes = Math.ceil((lockCheck.lockedUntil! - Date.now()) / 60000);
        return { error: `Too many failed OTP attempts. Try again in ${lockoutMinutes} minutes.` };
      }
      
      const { error, data } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: code.trim(),
        type: 'sms',
        options: {
          data: fullName ? { full_name: fullName.trim() } : {}
        }
      });

      if (error) {
        // Only count actual failed verification attempts
        recordOtpAttempt(normalizedPhone);
        const remaining = getRemainingAttempts(normalizedPhone);
        if (remaining <= 0) {
          const lockInfo = isOtpLocked(normalizedPhone);
          const lockoutMinutes = lockInfo.lockedUntil ? Math.ceil((lockInfo.lockedUntil - Date.now()) / 60000) : 0;
          return { error: `Too many failed attempts. Account locked for ${lockoutMinutes} minutes.` };
        }
        return { error: `Invalid OTP. ${remaining} attempts remaining.` };
      }

      // Clear failed attempts on successful verification
      clearOtpAttempts(normalizedPhone);

      // Immediately update local state so the UI can react without waiting
      // for onAuthStateChange (which can be delayed or missed in some cases).
      if (data.session) {
        setSession(data.session);
        if (data.session.user) {
          applySession(setUser, supabase, data.session.user);
        }
      } else if (data.user) {
        // Fallback: if session is null but user exists, refresh the session
        // This can happen in some edge cases where verifyOtp returns a user but no session
        const { data: refreshData } = await supabase.auth.getSession();
        if (refreshData.session) {
          setSession(refreshData.session);
          applySession(setUser, supabase, refreshData.session.user);
        } else if (data.user) {
          // Last resort: build profile directly from the user object
          applySession(setUser, supabase, data.user);
        }
      }

      // Background update for full_name if provided
      if (fullName && (data.session?.user?.id || data.user?.id)) {
        const userId = data.session?.user?.id || data.user?.id;
        (async () => {
          try {
            await supabase
              .from('users')
              .update({ full_name: fullName.trim() })
              .eq('id', userId);
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

  const refreshSession = useCallback(async () => {
    if (!configured) return;
    try {
      const supabase = createClient();
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) {
        applySession(setUser, supabase, currentSession.user);
      }
    } catch (err) {
      console.error('[AuthContext] refreshSession error:', err);
    }
  }, [configured]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isConfigured: configured,
      supabaseReachable,
      sendOtp,
      verifyOtp,
      signOut,
      updateProfile,
      refreshSession,
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
