import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizePhone } from '@/lib/phone';
import { canResendOtp, recordOtpSend, recordOtpAttempt, clearOtpAttempts } from '@/lib/auth/rateLimiter';

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

    // Check if phone is locked due to too many failed attempts
    const attemptCheck = recordOtpAttempt(normalizedPhone);
    if (!attemptCheck.allowed) {
      const lockoutMinutes = Math.ceil((attemptCheck.lockedUntil! - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Too many failed attempts. Please try again in ${lockoutMinutes} minutes.` },
        { status: 429 }
      );
    }

    const supabase = await createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    const isNewUser = !existingUser;

    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: {
        shouldCreateUser: true,
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
