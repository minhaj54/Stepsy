import 'package:flutter_dotenv/flutter_dotenv.dart';

String _getEnv(String key, {String defaultValue = ''}) {
  if (dotenv.isInitialized) {
    final val = dotenv.env[key];
    if (val != null && val.isNotEmpty) {
      return val;
    }
  }
  return defaultValue;
}

String get supabaseUrl => _getEnv('SUPABASE_URL', defaultValue: const String.fromEnvironment('SUPABASE_URL'));
String get supabaseAnonKey => _getEnv('SUPABASE_ANON_KEY', defaultValue: const String.fromEnvironment('SUPABASE_ANON_KEY'));
String get zarwintoApiBaseUrl => _getEnv('ZARWINTO_API_BASE_URL', defaultValue: const String.fromEnvironment('ZARWINTO_API_BASE_URL'));
String get appName => _getEnv('APP_NAME', defaultValue: const String.fromEnvironment('APP_NAME', defaultValue: 'Stepzy'));
String get primaryColorHex => _getEnv('PRIMARY_COLOR', defaultValue: const String.fromEnvironment('PRIMARY_COLOR', defaultValue: '000000'));
String get secondaryColorHex => _getEnv('SECONDARY_COLOR', defaultValue: const String.fromEnvironment('SECONDARY_COLOR', defaultValue: '5B9EE1'));
