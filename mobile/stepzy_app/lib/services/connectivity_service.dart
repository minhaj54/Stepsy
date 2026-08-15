import 'package:connectivity_plus/connectivity_plus.dart';

/// Utility for checking device network connectivity at app startup.
class ConnectivityService {
  ConnectivityService._();

  static final Connectivity _connectivity = Connectivity();

  /// Returns true when the device has at least one active network interface
  /// that is not `none`.
  static Future<bool> hasInternet() async {
    try {
      final List<ConnectivityResult> results = await _connectivity.checkConnectivity();
      return results.any((result) => result != ConnectivityResult.none);
    } catch (_) {
      return true; // Assume online on check error to prevent blocking
    }
  }
}
