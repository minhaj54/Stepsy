import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizePhone } from '@/lib/phone';
import { canResendOtp, recordOtpSend, isOtpLocked, clearOtpAttempts } from '@/lib/auth/rateLimiter';

export async function POST(request: Request) {
  try {
    const { phone, fullName } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);

    // Check resend cooldown
    const resendCheck = canResendOtp(normalizedPhone);
    if (!resendCheck.allowed) {
      const remainingSeconds = Math.ceil(resendCheck.remainingMs / 1000);
      return NextResponse.json(
        { error: `Please wait ${remainingSeconds} seconds before requesting a new OTP.` },
        { status: 429 }
      );
    }

    // Read-only lock check (does not increment attempts)
    const lockCheck = isOtpLocked(normalizedPhone);
    if (lockCheck.locked) {
      const lockoutMinutes = Math.ceil((lockCheck.lockedUntil! - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Too many failed OTP attempts. Try again in ${lockoutMinutes} minutes.` },
        { status: 429 }
      );
    }

    const supabase = await createClient();

    // SECURITY DEFINER RPC bypasses RLS so unauthenticated lookups work
    const { data: existsData, error: existsErr } = await supabase
      .rpc('check_user_registered', { p_phone: normalizedPhone });

    if (existsErr) {
      console.error('[API/send-otp] check_user_registered error:', existsErr);
      return NextResponse.json({ error: 'Unable to verify account status. Please try again.' }, { status: 500 });
    }

    const isNewUser = !existsData;

    // Reject unregistered users in login mode; reject already-registered in signup mode
    if (isNewUser && !fullName) {
      return NextResponse.json({ error: 'User not registered. Please sign up first.' }, { status: 400 });
    }
    if (!isNewUser && fullName) {
      return NextResponse.json({ error: 'Account already exists with this number. Please sign in instead.' }, { status: 400 });
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: {
        shouldCreateUser: isNewUser,
        data: fullName ? { full_name: fullName.trim() } : {},
      },
    });

    if (error) {
      console.error('[API/send-otp] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Record successful send and clear any previous failed attempts
    recordOtpSend(normalizedPhone);
    clearOtpAttempts(normalizedPhone);

    return NextResponse.json({
      success: true,
      message: isNewUser ? 'OTP sent successfully. Creating your account...' : 'OTP sent successfully. Welcome back!',
      isNewUser,
    });
  } catch (err) {
    console.error('[API/send-otp] Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Network error. Please try again.' },
      { status: 500 }
    );
  }
}


