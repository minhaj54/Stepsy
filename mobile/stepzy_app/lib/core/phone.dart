String normalizePhone(String input, {String defaultCountryCode = '91'}) {
  var digits = input.replaceAll(RegExp(r'\D'), '');

  if (digits.isEmpty) {
    throw ArgumentError('Please enter a valid mobile number.');
  }

  if (digits.length == 11 && digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  if (digits.length == 10) {
    return '+$defaultCountryCode$digits';
  }

  if (digits.length == 12 && digits.startsWith(defaultCountryCode)) {
    return '+$digits';
  }

  if (input.trim().startsWith('+') && digits.length >= 10) {
    return '+$digits';
  }

  throw ArgumentError('Enter a valid 10-digit mobile number.');
}

String phoneToSyntheticEmail(String phone) {
  final digits = phone.replaceAll(RegExp(r'\D'), '');
  return '$digits@phone.zarwinto.app';
}
