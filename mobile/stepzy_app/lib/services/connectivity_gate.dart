import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';

import '../services/connectivity_service.dart';
import '../screens/no_internet_screen.dart';

class ConnectivityGate extends StatefulWidget {
  const ConnectivityGate({super.key, required this.child});

  final Widget child;

  @override
  State<ConnectivityGate> createState() => _ConnectivityGateState();
}

class _ConnectivityGateState extends State<ConnectivityGate> {
  bool _isOnline = true;
  StreamSubscription<List<ConnectivityResult>>? _subscription;

  @override
  void initState() {
    super.initState();
    _checkConnectivity();
    _subscription = Connectivity()
        .onConnectivityChanged
        .listen((_) => _checkConnectivity());
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  Future<void> _checkConnectivity() async {
    final hasInternet = await ConnectivityService.hasInternet();
    if (mounted && _isOnline != hasInternet) {
      setState(() {
        _isOnline = hasInternet;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isOnline) {
      return NoInternetScreen(onRetry: _checkConnectivity);
    }
    return widget.child;
  }
}
