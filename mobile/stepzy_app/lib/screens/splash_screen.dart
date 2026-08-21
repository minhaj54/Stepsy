import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/theme.dart';
import '../providers/zarwinto_store.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _waitForBootstrap();
  }

  Future<void> _waitForBootstrap() async {
    final store = ZarwintoScope.of(context, listen: false);
    while (store.loading && mounted) {
      await Future.delayed(const Duration(milliseconds: 150));
    }
    if (!mounted) return;
    _navigate(store);
  }

  void _navigate(ZarwintoStore store) {
    if (store.profile != null) {
      Navigator.of(context).pushReplacementNamed('/shell');
    } else {
      Navigator.of(context).pushReplacementNamed('/onboarding');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZarwintoColors.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/App icon/GooglePlayStore.png',
              width: 120,
              height: 120,
            ).animate().scale(
                  duration: const Duration(milliseconds: 800),
                  curve: Curves.easeOutBack,
                ).fadeIn(duration: const Duration(milliseconds: 600)),
            const SizedBox(height: 24),
            Text(
              'ZARWINTO',
              style: TextStyle(
                fontSize: 34,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: 1.2,
                height: 1.1,
              ),
            ).animate().fadeIn(delay: const Duration(milliseconds: 200), duration: const Duration(milliseconds: 600)).slideY(begin: 0.2, end: 0, curve: Curves.easeOut),
            const SizedBox(height: 10),
            Text(
              'Step into the right choice',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w400,
                color: Colors.white.withValues(alpha: 0.88),
                letterSpacing: 0.4,
                height: 1.4,
              ),
            ).animate().fadeIn(delay: const Duration(milliseconds: 400), duration: const Duration(milliseconds: 600)).slideY(begin: 0.2, end: 0, curve: Curves.easeOut),
          ],
        ),
      ),
    );
  }
}
