import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

String _getEnv(String key, {String defaultValue = ''}) {
  if (dotenv.isInitialized) {
    final val = dotenv.env[key];
    if (val != null && val.isNotEmpty) {
      debugPrint('[Zarwinto] env.$key = ${val.substring(0, val.length > 20 ? 20 : val.length)}...');
      return val;
    }
  }
  debugPrint('[Zarwinto] env.$key = missing, using default');
  return defaultValue;
}

String get supabaseUrl => _getEnv('SUPABASE_URL', defaultValue: const String.fromEnvironment('SUPABASE_URL'));
String get supabaseAnonKey => _getEnv('SUPABASE_ANON_KEY', defaultValue: const String.fromEnvironment('SUPABASE_ANON_KEY'));
String get zarwintoApiBaseUrl => _getEnv('ZARWINTO_API_BASE_URL', defaultValue: const String.fromEnvironment('ZARWINTO_API_BASE_URL'));
String get appName => _getEnv('APP_NAME', defaultValue: const String.fromEnvironment('APP_NAME', defaultValue: 'Zarwinto'));
String get primaryColorHex => _getEnv('PRIMARY_COLOR', defaultValue: const String.fromEnvironment('PRIMARY_COLOR', defaultValue: '000000'));
String get secondaryColorHex => _getEnv('SECONDARY_COLOR', defaultValue: const String.fromEnvironment('SECONDARY_COLOR', defaultValue: '5B9EE1'));
// String get shiprocketPickupLocation => _getEnv('SHIPROCKET_PICKUP_LOCATION', defaultValue: const String.fromEnvironment('SHIPROCKET_PICKUP_LOCATION', defaultValue: 'Primary'));
String get cashfreeAppId => _getEnv('CASHFREE_APP_ID', defaultValue: const String.fromEnvironment('CASHFREE_APP_ID'));
String get cashfreeSecretKey => _getEnv('CASHFREE_SECRET_KEY', defaultValue: const String.fromEnvironment('CASHFREE_SECRET_KEY'));
bool get cashfreeIsProduction => _getEnv('CASHFREE_ENV', defaultValue: const String.fromEnvironment('CASHFREE_ENV', defaultValue: 'sandbox')) == 'production';
String get zarwintoDomain => _getEnv('ZARWINTO_DOMAIN', defaultValue: const String.fromEnvironment('ZARWINTO_DOMAIN', defaultValue: 'https://zarwinto.com'));
