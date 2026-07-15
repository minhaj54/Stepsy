'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Phone, User, AlertCircle, CheckCircle, Loader2, RotateCcw } from 'lucide-react';

type Step = 'phone' | 'otp';

const RESEND_COOLDOWN_SECONDS = 60;

interface PhoneAuthFormProps {
  mode?: 'login' | 'signup';
}

export default function PhoneAuthForm({ mode = 'login' }: PhoneAuthFormProps) {
  const { sendOtp, verifyOtp, isConfigured, user } = useAuth();
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
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSignup = mode === 'signup';

  // Redirect as soon as user is logged in
  useEffect(() => {
    console.log('[PhoneAuthForm] redirect useEffect triggered, user:', user);
    if (user) {
      console.log('[PhoneAuthForm] user is truthy, redirecting to:', redirect);
      router.push(redirect);
    }
  }, [user, router, redirect]);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

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

      console.log('[PhoneAuthForm] verifyOtp successful, waiting for user to be set');
      setVerifying(false);
      setHasVerifiedOtp(true);
      // Don't call router.push here — let the useEffect handle it once user is truthy!
    } catch (err) {
      console.error('[PhoneAuthForm] Uncaught error:', err);
      setVerifying(false);
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isSignup ? 'Join Whishkhu' : 'Welcome Back'}
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            {step === 'phone'
              ? 'Enter your mobile number to receive an OTP'
              : `Enter the 6-digit code sent to +91 ${phone.replace(/\D/g, '').slice(-10)}`}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 space-y-6">
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
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Your name"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="98765 43210"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5">India (+91) numbers supported. Include country code for others.</p>
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
                <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs">
                  <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                  <span>{hasVerifiedOtp ? 'Signing you in...' : 'Verifying your code and signing you in — this can take up to a minute on first login.'}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
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
                  disabled={verifying}
                  placeholder="123456"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                />
                <p className="text-[10px] text-zinc-500 mt-1.5">
                  Enter the 6-digit code from your SMS. The code is valid for 10 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={verifying || otp.length < 4}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 glow-btn"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
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
                  onClick={() => { setStep('phone'); setError(''); setVerifying(false); setIsRateLimited(false); }}
                  disabled={verifying}
                  className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Change number
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || verifying || sending}
                  className="text-primary hover:text-primary-hover font-semibold disabled:text-zinc-600 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-zinc-400">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:text-primary-hover font-semibold">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to Whishkhu?{' '}
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
