import 'package:connectivity_plus/connectivity_plus.dart';

/// Utility for checking device network connectivity at app startup.
class ConnectivityService {
  ConnectivityService._();

  static final Connectivity _connectivity = Connectivity();

  /// Returns true when the device has at least one active network interface
  /// that is not `none`. Note: this confirms a network link is present, not
  /// that the remote host is reachable.
  static Future<bool> hasInternet() async {
    final result = await _connectivity.checkConnectivity();
    return result != ConnectivityResult.none;
  }
}
