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
  sendOtp: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, code: string, fullName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Pick<UserProfile, 'full_name'>>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: UserProfile = {
  id: 'usr_stepzy_99',
  full_name: 'Minhaj Raza',
  email: '9876543210@phone.stepzy.app',
  phone: '+919876543210',
  role: 'customer',
  created_at: new Date().toISOString(),
};

async function fetchProfile(supabase: ReturnType<typeof createClient>, authUser: SupabaseUser): Promise<UserProfile> {
  try {
    console.log('[AuthContext] fetchProfile starting for user:', authUser.id);
    console.log('[AuthContext] fetchProfile authUser details:', authUser);
    
    let data = null;
    let error = null;
    
    try {
      // Add a timeout to prevent hanging
      const result = await Promise.race([
        supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)) // 3 second timeout
      ]);
      
      if (result) {
        data = result.data;
        error = result.error;
      }
    } catch (queryErr) {
      console.error('[AuthContext] fetchProfile query error:', queryErr);
    }

    if (error) {
      console.error('[AuthContext] fetchProfile error from supabase:', error);
    }
    
    if (data) {
      console.log('[AuthContext] fetchProfile found existing profile:', data);
      // Fix phone number to have leading "+" if needed
      const profile = { ...data } as UserProfile;
      if (profile.phone && !profile.phone.startsWith('+')) {
        profile.phone = '+' + profile.phone;
      }
      console.log('[AuthContext] fetchProfile fixed profile:', profile);
      return profile;
    }

    // If profile doesn't exist, create it in public.users first!
    console.log('[AuthContext] fetchProfile profile does NOT exist, creating it now');
    
    // Fix phone number to have leading "+"
    let phoneFromAuth = authUser.phone ?? authUser.user_metadata?.phone ?? '';
    if (phoneFromAuth && !phoneFromAuth.startsWith('+')) {
      phoneFromAuth = '+' + phoneFromAuth;
    }

    // Create synthetic email if needed
    let emailFromAuth = authUser.email ?? '';
    if (!emailFromAuth && phoneFromAuth) {
      emailFromAuth = `${phoneFromAuth.replace('+', '')}@phone.stepzy.app`;
    }

    // Insert into public.users
    try {
      const { data: insertedData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name ?? '',
          email: emailFromAuth,
          phone: phoneFromAuth,
          role: 'customer'
        })
        .select()
        .single();

      if (!insertError && insertedData) {
        console.log('[AuthContext] fetchProfile created new profile in DB:', insertedData);
        // Fix phone number to have leading "+"
        const profile = { ...insertedData } as UserProfile;
        if (profile.phone && !profile.phone.startsWith('+')) {
          profile.phone = '+' + profile.phone;
        }
        return profile;
      } else {
        console.error('[AuthContext] fetchProfile error inserting new profile:', insertError);
      }
    } catch (insertErr) {
      console.error('[AuthContext] fetchProfile insert error:', insertErr);
    }

    // Fallback profile even if insert fails
    const fallbackProfile = {
      id: authUser.id,
      full_name: authUser.user_metadata?.full_name ?? '',
      email: emailFromAuth,
      phone: phoneFromAuth,
      role: 'customer',
      created_at: authUser.created_at,
    };
    console.log('[AuthContext] fetchProfile returning fallback:', fallbackProfile);
    return fallbackProfile;
  } catch (err) {
    console.error('[AuthContext] fetchProfile unexpected error:', err);
    // Fallback profile even if everything fails
    // Fix phone number to have leading "+"
    let phoneFromAuth = authUser.phone ?? authUser.user_metadata?.phone ?? '';
    if (phoneFromAuth && !phoneFromAuth.startsWith('+')) {
      phoneFromAuth = '+' + phoneFromAuth;
    }
    let emailFromAuth = authUser.email ?? '';
    if (!emailFromAuth && phoneFromAuth) {
      emailFromAuth = `${phoneFromAuth.replace('+', '')}@phone.stepzy.app`;
    }
    const fallbackProfile = {
      id: authUser.id,
      full_name: authUser.user_metadata?.full_name ?? '',
      email: emailFromAuth,
      phone: phoneFromAuth,
      role: 'customer',
      created_at: authUser.created_at,
    };
    console.log('[AuthContext] fetchProfile returning fallback from catch:', fallbackProfile);
    return fallbackProfile;
  }
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
          const profile = await fetchProfile(supabase, currentSession.user);
          setUser(profile);
        }
      } catch {
        // Supabase unreachable — remain unauthenticated
      } finally {
        setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      try {
        console.log('[AuthContext] onAuthStateChange event:', event, 'newSession:', !!newSession);
        console.log('[AuthContext] onAuthStateChange full newSession:', newSession);
        setSession(newSession);
        if (newSession?.user) {
          console.log('[AuthContext] onAuthStateChange: user is present, fetching profile');
          const profile = await fetchProfile(supabase, newSession.user);
          console.log('[AuthContext] onAuthStateChange: fetchProfile returned:', profile);
          console.log('[AuthContext] onAuthStateChange: setting user');
          setUser(profile);
          console.log('[AuthContext] onAuthStateChange: user set successfully');
        } else {
          console.log('[AuthContext] onAuthStateChange: no user, clearing user');
          setUser(null);
        }
        console.log('[AuthContext] onAuthStateChange: setting loading to false');
        setLoading(false);
        console.log('[AuthContext] onAuthStateChange: done');
      } catch (err) {
        console.error('[AuthContext] onAuthStateChange error:', err);
      }
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const sendOtp = useCallback(async (phone: string, fullName?: string) => {
    if (!configured) {
      return { error: 'Supabase is not configured. Add env variables to enable auth.' };
    }

    try {
      const normalizedPhone = normalizePhone(phone);
      console.log('[AuthContext] sendOtp starting with:', {
        originalPhone: phone,
        normalizedPhone,
        fullName
      });
      
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          shouldCreateUser: true,
          data: fullName ? { full_name: fullName.trim() } : {}
        }
      });

      if (error) {
        console.error('[AuthContext] sendOtp full error:', error);
        return { error: error.message };
      }

      console.log('[AuthContext] sendOtp successful!');
      return { error: null };
    } catch (err) {
      console.error('[AuthContext] sendOtp network error:', err);
      return { error: err instanceof Error ? err.message : 'Network error. Please try again.' };
    }
  }, [configured]);

  const verifyOtp = useCallback(async (phone: string, code: string, fullName?: string) => {
    if (!configured) {
      return { error: 'Supabase is not configured. Add env variables to enable auth.' };
    }

    try {
      const normalizedPhone = normalizePhone(phone);
      console.log('[AuthContext] verifyOtp starting with:', {
        originalPhone: phone,
        normalizedPhone,
        code,
        fullName
      });
      
      const supabase = createClient();
      
      const { error, data } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: code.trim(),
        type: 'sms',
        options: {
          data: fullName ? { full_name: fullName.trim() } : {}
        }
      });

      if (error) {
        console.error('[AuthContext] verifyOtp full error:', error);
        return { error: error.message };
      }

      console.log('[AuthContext] verifyOtp success! Full data:', data);
      
      // Now update the public.users table with full_name if we have it — do this in the background so UI isn't blocked!
      if (fullName && data.session?.user?.id) {
        (async () => {
          try {
            console.log('[AuthContext] verifyOtp (background): updating public.users table with full_name:', fullName.trim());
            const { error: updateError } = await supabase
              .from('users')
              .update({ full_name: fullName.trim() })
              .eq('id', data.session.user.id);
          
            if (updateError) {
              console.error('[AuthContext] verifyOtp (background) error updating public.users:', updateError);
            } else {
              console.log('[AuthContext] verifyOtp (background): successfully updated public.users');
              // Also update the auth user's metadata just in case
              await supabase.auth.updateUser({
                data: { full_name: fullName.trim() }
              });
            }
          } catch (bgErr) {
            console.error('[AuthContext] verifyOtp (background) unexpected error:', bgErr);
          }
        })();
      }
      
      return { error: null };
    } catch (err) {
      console.error('[AuthContext] verifyOtp network error:', err);
      return { error: err instanceof Error ? err.message : 'Network error. Please try again.' };
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
    } catch {
      // ignore
    }
    setUser(null);
    setSession(null);
  }, [configured]);

  const updateProfile = useCallback(async (data: Partial<Pick<UserProfile, 'full_name'>>) => {
    if (!configured || !user) return { error: 'Not authenticated.' };
    
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);

      if (!error) {
        await supabase.auth.updateUser({ data: { full_name: data.full_name } });
        setUser((prev) => (prev ? { ...prev, ...data } : null));
      } else {
        console.error('[AuthContext] updateProfile error:', error.message);
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
