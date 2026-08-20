import 'dart:collection';

class _RateLimitEntry {
  int count;
  int firstAttempt;
  int? lockedUntil;

  _RateLimitEntry({
    required this.count,
    required this.firstAttempt,
    this.lockedUntil,
  });
}

class OtpRateLimiter {
  static const int maxOtpAttempts = 5;
  static const int lockoutDurationMs = 15 * 60 * 1000;
  static const int resendCooldownMs = 60 * 1000;

  static final HashMap<String, _RateLimitEntry> _otpAttempts = HashMap<String, _RateLimitEntry>();
  static final HashMap<String, int> _otpSendTimestamps = HashMap<String, int>();

  static ({bool allowed, int remaining, int? lockedUntil}) recordOtpAttempt(String phone) {
    final now = DateTime.now().millisecondsSinceEpoch;
    final entry = _otpAttempts[phone];

    if (entry != null) {
      final lockedUntil = entry.lockedUntil;
      if (lockedUntil != null && now < lockedUntil) {
        return (allowed: false, remaining: 0, lockedUntil: lockedUntil);
      }
    }

    if (entry == null || now - entry.firstAttempt > lockoutDurationMs) {
      _otpAttempts[phone] = _RateLimitEntry(count: 1, firstAttempt: now, lockedUntil: null);
      return (allowed: true, remaining: maxOtpAttempts - 1, lockedUntil: null);
    }

    entry.count += 1;

    if (entry.count > maxOtpAttempts) {
      entry.lockedUntil = now + lockoutDurationMs;
      return (allowed: false, remaining: 0, lockedUntil: entry.lockedUntil);
    }

    return (allowed: true, remaining: maxOtpAttempts - entry.count, lockedUntil: null);
  }

  static void clearOtpAttempts(String phone) {
    _otpAttempts.remove(phone);
  }

  static ({bool allowed, int remainingMs}) canResendOtp(String phone) {
    final lastSent = _otpSendTimestamps[phone];
    final now = DateTime.now().millisecondsSinceEpoch;

    if (lastSent == null) {
      return (allowed: true, remainingMs: 0);
    }

    final elapsed = now - lastSent;
    final remaining = lockoutDurationMs > elapsed ? resendCooldownMs - elapsed : 0;

    return (allowed: remaining <= 0, remainingMs: remaining);
  }

  static void recordOtpSend(String phone) {
    _otpSendTimestamps[phone] = DateTime.now().millisecondsSinceEpoch;
  }

  static int getLockoutRemaining(String phone) {
    final entry = _otpAttempts[phone];
    if (entry?.lockedUntil == null) return 0;
    final now = DateTime.now().millisecondsSinceEpoch;
    return entry!.lockedUntil! > now ? entry.lockedUntil! - now : 0;
  }
}
