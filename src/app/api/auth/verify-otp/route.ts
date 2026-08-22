import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizePhone, phoneLast10 } from '@/lib/phone';
import { isOtpLocked, recordOtpAttempt, clearOtpAttempts, getRemainingAttempts } from '@/lib/auth/rateLimiter';

export async function POST(request: Request) {
  try {
    const { phone, code, fullName } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone number and OTP code are required.' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);

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
    const { error, data } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: code.trim(),
      type: 'sms',
    });

    if (error) {
      // Only count actual failed verification attempts
      recordOtpAttempt(normalizedPhone);
      const remaining = getRemainingAttempts(normalizedPhone);
      if (remaining <= 0) {
        const lockInfo = isOtpLocked(normalizedPhone);
        const lockoutMinutes = lockInfo.lockedUntil ? Math.ceil((lockInfo.lockedUntil - Date.now()) / 60000) : 0;
        return NextResponse.json(
          { error: `Too many failed attempts. Account locked for ${lockoutMinutes} minutes.` },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Invalid OTP. ${remaining} attempts remaining.` },
        { status: 400 }
      );
    }

    // Clear failed attempts on successful verification
    clearOtpAttempts(normalizedPhone);

    // Background update for full_name if provided
    if (fullName && data.session?.user?.id) {
      try {
        await supabase
          .from('users')
          .update({ full_name: fullName.trim() })
          .eq('id', data.session.user.id);
        await supabase.auth.updateUser({
          data: { full_name: fullName.trim() },
        });
      } catch (bgErr) {
        console.error('[API/verify-otp] Background update error:', bgErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully.',
      user: data.session?.user ? {
        id: data.session.user.id,
        phone: data.session.user.phone,
        email: data.session.user.email,
      } : null,
    });
  } catch (err) {
    console.error('[API/verify-otp] Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Network error. Please try again.' },
      { status: 500 }
    );
  }
}
