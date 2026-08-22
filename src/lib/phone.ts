/** Normalize a phone number to E.164 format (default country: India +91). */
export function normalizePhone(input: string, defaultCountryCode = '91'): string {
  let digits = input.replace(/\D/g, '');

  if (!digits) {
    throw new Error('Please enter a valid mobile number.');
  }

  // Strip leading 0 for Indian 10-digit mobile numbers
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.length === 10) {
    return `+${defaultCountryCode}${digits}`;
  }

  if (digits.length === 12 && digits.startsWith(defaultCountryCode)) {
    return `+${digits}`;
  }

  if (input.trim().startsWith('+') && digits.length >= 10) {
    return `+${digits}`;
  }

  throw new Error('Enter a valid 10-digit mobile number.');
}

export function phoneToSyntheticEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@phone.zarwinto.app`;
}

/** Last 10 national digits of a phone number, used for tolerant lookups. */
export function phoneLast10(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-10);
}
