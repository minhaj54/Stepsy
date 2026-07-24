import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizePhone } from '@/lib/phone';

export async function POST(request: Request) {
  try {
    const { phone, code, fullName } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone number and OTP code are required.' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);

    const supabase = await createClient();
    const { error, data } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: code.trim(),
      type: 'sms',
    });

    if (error) {
      console.error('[API/verify-otp] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

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
