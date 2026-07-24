import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizePhone } from '@/lib/phone';

export async function POST(request: Request) {
  try {
    const { phone, fullName } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);

    const supabase = await createClient();
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

    return NextResponse.json({ success: true, message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('[API/send-otp] Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Network error. Please try again.' },
      { status: 500 }
    );
  }
}
