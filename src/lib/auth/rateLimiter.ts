/**
 * Simple in-memory rate limiter for OTP endpoints.
 * Uses a Map to track attempts per phone number.
 */

type RateLimitEntry = {
  count: number;
  firstAttempt: number;
  lockedUntil: number;
};

const otpAttempts = new Map<string, RateLimitEntry>();
const otpSendTimestamps = new Map<string, number>();

const MAX_OTP_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

export function recordOtpAttempt(phone: string): { allowed: boolean; remaining: number; lockedUntil?: number } {
  const now = Date.now();
  const entry = otpAttempts.get(phone);

  if (entry?.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, remaining: 0, lockedUntil: entry.lockedUntil };
  }

  if (!entry || now - entry.firstAttempt > LOCKOUT_DURATION_MS) {
    otpAttempts.set(phone, { count: 1, firstAttempt: now, lockedUntil: 0 });
    return { allowed: true, remaining: MAX_OTP_ATTEMPTS - 1 };
  }

  entry.count += 1;

  if (entry.count > MAX_OTP_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
    return { allowed: false, remaining: 0, lockedUntil: entry.lockedUntil };
  }

  return { allowed: true, remaining: MAX_OTP_ATTEMPTS - entry.count };
}

export function isOtpLocked(phone: string): { locked: boolean; lockedUntil?: number } {
  const entry = otpAttempts.get(phone);
  if (!entry?.lockedUntil) return { locked: false };

  const now = Date.now();
  if (now < entry.lockedUntil) {
    return { locked: true, lockedUntil: entry.lockedUntil };
  }

  otpAttempts.delete(phone);
  return { locked: false };
}

export function getRemainingAttempts(phone: string): number {
  const entry = otpAttempts.get(phone);
  if (!entry) return MAX_OTP_ATTEMPTS;

  const now = Date.now();
  if (entry?.lockedUntil && now < entry.lockedUntil) return 0;
  if (now - entry.firstAttempt > LOCKOUT_DURATION_MS) return MAX_OTP_ATTEMPTS;

  return Math.max(0, MAX_OTP_ATTEMPTS - entry.count);
}

export function clearOtpAttempts(phone: string): void {
  otpAttempts.delete(phone);
}

export function canResendOtp(phone: string): { allowed: boolean; remainingMs: number } {
  const lastSent = otpSendTimestamps.get(phone);
  const now = Date.now();

  if (!lastSent) {
    return { allowed: true, remainingMs: 0 };
  }

  const elapsed = now - lastSent;
  const remaining = Math.max(0, RESEND_COOLDOWN_MS - elapsed);

  return { allowed: remaining === 0, remainingMs: remaining };
}

export function recordOtpSend(phone: string): void {
  otpSendTimestamps.set(phone, Date.now());
}

export function getLockoutRemaining(phone: string): number {
  const entry = otpAttempts.get(phone);
  if (!entry?.lockedUntil) return 0;
  return Math.max(0, entry.lockedUntil - Date.now());
}
