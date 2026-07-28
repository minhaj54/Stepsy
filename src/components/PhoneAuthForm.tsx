'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Phone, User, AlertCircle, CheckCircle, Loader2, RotateCcw } from 'lucide-react';

type Step = 'phone' | 'otp';

const RESEND_COOLDOWN_SECONDS = 60;
const REDIRECT_TIMEOUT_MS = 8000; // Wait up to 8s for user state to update before forcing redirect

interface PhoneAuthFormProps {
  mode?: 'login' | 'signup';
}

export default function PhoneAuthForm({ mode = 'login' }: PhoneAuthFormProps) {
  const { sendOtp, verifyOtp, refreshSession, isConfigured, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [hasVerifiedOtp, setHasVerifiedOtp] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showManualRedirect, setShowManualRedirect] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRedirectAttemptedRef = useRef(false);
  const manualRedirectAttemptedRef = useRef(false);

  const isSignup = mode === 'signup';

  // Redirect as soon as user is logged in
  useEffect(() => {
    console.log('[PhoneAuthForm] redirect useEffect triggered, user:', user);
    if (user && !redirecting && !autoRedirectAttemptedRef.current) {
      console.log('[PhoneAuthForm] user is truthy, redirecting to:', redirect);
      autoRedirectAttemptedRef.current = true;
      setRedirecting(true);
      // Use replace to avoid back-button issues after login
      router.replace(redirect);
    }
  }, [user, router, redirect, redirecting]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  // Fallback: if user state updates but redirect hasn't happened within REDIRECT_TIMEOUT_MS,
  // force a full page navigation as a last resort
  useEffect(() => {
    if (!hasVerifiedOtp || redirecting) return;

    const fallbackTimer = setTimeout(() => {
      if (user && !autoRedirectAttemptedRef.current && !manualRedirectAttemptedRef.current) {
        console.log('[PhoneAuthForm] fallback: forcing full page navigation');
        autoRedirectAttemptedRef.current = true;
        setRedirecting(true);
        window.location.href = redirect;
      }
    }, REDIRECT_TIMEOUT_MS + 1000);

    return () => clearTimeout(fallbackTimer);
  }, [hasVerifiedOtp, redirecting, user, redirect]);

  // Manual redirect button handler for mobile users
  const handleManualRedirect = () => {
    if (manualRedirectAttemptedRef.current) return;
    manualRedirectAttemptedRef.current = true;
    setRedirecting(true);
    setShowManualRedirect(false);
    window.location.href = redirect;
  };

  const startResendCooldown = (seconds = RESEND_COOLDOWN_SECONDS) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsRateLimited(false);
    setSending(true);

    const { error: sendError } = await sendOtp(phone, isSignup ? fullName : undefined);
    if (sendError) {
      if (sendError.includes('wait') || sendError.includes('Too many')) {
        setIsRateLimited(true);
      }
      setError(sendError);
      setSending(false);
      return;
    }

    setStep('otp');
    setOtp('');
    startResendCooldown();
    setSending(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsRateLimited(false);
    setVerifying(true);

    try {
      console.log('[PhoneAuthForm] handleVerifyOtp starting');
      const { error: verifyError } = await verifyOtp(
        phone,
        otp,
        isSignup ? fullName : undefined
      );

      if (verifyError) {
        console.error('[PhoneAuthForm] verifyOtp error:', verifyError);
        if (verifyError.includes('Too many') || verifyError.includes('wait')) {
          setIsRateLimited(true);
          setTimeout(() => {
            setStep('phone');
            setOtp('');
            setError(verifyError);
            setIsRateLimited(true);
          }, 1500);
        }
        setError(verifyError);
        setVerifying(false);
        return;
      }

      console.log('[PhoneAuthForm] verifyOtp successful, waiting for user state');
      setHasVerifiedOtp(true);
      // Show manual redirect button after a short delay
      // This ensures the button is visible even if automatic redirect fails
      setTimeout(() => {
        setShowManualRedirect(true);
      }, 1500);

      // Clear any existing redirect timeout
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);

      // Set a timeout to force redirect if user state doesn't update
      redirectTimeoutRef.current = setTimeout(async () => {
        console.log('[PhoneAuthForm] redirect timeout reached, forcing session refresh');
        await refreshSession();
        // The useEffect watching `user` will handle the actual redirect
      }, REDIRECT_TIMEOUT_MS);

      // Immediately try to refresh the session as a fallback
      await refreshSession();

      // Robust redirect: try router.replace first, then fallback to window.location.href
      // This ensures redirect works on all devices including mobile
      const attemptRedirect = async () => {
        if (autoRedirectAttemptedRef.current) return;
        autoRedirectAttemptedRef.current = true;
        setRedirecting(true);
        setShowManualRedirect(false);

        // Try client-side navigation first
        try {
          await router.replace(redirect);
        } catch {
          // Fallback to full page navigation if router.replace fails
          console.log('[PhoneAuthForm] router.replace failed, using window.location.href');
          window.location.href = redirect;
        }
      };

      // Attempt redirect immediately after a very short delay
      // Mobile browsers often need this for client-side navigation to work
      setTimeout(() => {
        attemptRedirect();
      }, 200);

      // Keep verifying state true until redirect happens (useEffect will set redirecting)
      // This prevents the button from being re-enabled
    } catch (err) {
      console.error('[PhoneAuthForm] Uncaught error:', err);
      setVerifying(false);
      setHasVerifiedOtp(false);
      setError('Something went wrong, please try again');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || verifying) return;
    setError('');
    setIsRateLimited(false);
    setSending(true);

    const { error: sendError } = await sendOtp(phone, isSignup ? fullName : undefined);
    if (sendError) {
      if (sendError.includes('wait') || sendError.includes('Too many')) {
        setIsRateLimited(true);
        startResendCooldown(600); // 10 minute wait for rate limit
      }
      setError(sendError);
    } else {
      setOtp('');
      startResendCooldown();
    }
    setSending(false);
  };

  const isButtonDisabled = verifying || hasVerifiedOtp || redirecting || otp.length < 4;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {isSignup ? 'Join Zarwinto' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {step === 'phone'
              ? 'Enter your mobile number to receive an OTP'
              : `Enter the 6-digit code sent to +91 ${phone.replace(/\D/g, '').slice(-10)}`}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5">
          {!isConfigured && (
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Supabase is not configured. Add your Supabase and Twilio credentials to{' '}
                <code className="text-amber-300">.env.local</code> to enable phone authentication.
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{error}</p>
                {isRateLimited && (
                  <p className="text-xs text-red-300/70">
                    Twilio rate limits protect against abuse. Please wait before trying again.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Your name"
                      className="w-full bg-secondary border border-border rounded-xl py-2.5 pl-10 pr-4 text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="98765 43210"
                    className="w-full bg-secondary border border-border rounded-xl py-2.5 pl-10 pr-4 text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">India (+91) numbers supported. Include country code for others.</p>
              </div>

              <button
                type="submit"
                disabled={sending || isRateLimited}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 glow-btn"
              >
                {sending ? 'Sending OTP...' : 'Send OTP'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {(verifying || hasVerifiedOtp) && (
                <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs">
                  <Loader2 className="h-4 w-4 animate-spin flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p>
                      {hasVerifiedOtp
                        ? 'Signing you in...'
                        : 'Verifying your code and signing you in — this can take up to a minute on first login.'}
                    </p>
                    {showManualRedirect && (
                      <button
                        type="button"
                        onClick={handleManualRedirect}
                        className="w-full mt-2 bg-primary hover:bg-primary-hover text-white py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 animate-pulse"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Tap here to go to My Account
                      </button>
                    )}
                    {redirecting && !showManualRedirect && (
                      <p className="text-primary/70">
                        Redirecting you to your account...
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  OTP Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                  disabled={verifying || hasVerifiedOtp}
                  placeholder="123456"
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                />
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Enter the 6-digit code from your SMS. The code is valid for 10 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={isButtonDisabled}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 glow-btn"
              >
                {verifying || hasVerifiedOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {hasVerifiedOtp ? 'Signing you in...' : 'Verifying...'}
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setError('');
                    setVerifying(false);
                    setHasVerifiedOtp(false);
                    setRedirecting(false);
                    setIsRateLimited(false);
                    if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
                  }}
                  disabled={verifying || hasVerifiedOtp}
                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Change number
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || verifying || hasVerifiedOtp || sending}
                  className="text-primary hover:text-primary-hover font-semibold disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:text-primary-hover font-semibold">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to Zarwinto?{' '}
                <Link href="/auth/signup" className="text-primary hover:text-primary-hover font-semibold">
                  Create account
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
