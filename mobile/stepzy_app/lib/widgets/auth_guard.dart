import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import '../providers/zarwinto_store.dart';
import '../screens/login_screen.dart';

class AuthGuard extends StatelessWidget {
  const AuthGuard({
    super.key,
    required this.child,
    this.shouldShowDialog = true,
    this.redirectToLogin = true,
  });

  final Widget child;
  final bool shouldShowDialog;
  final bool redirectToLogin;

  Future<void> maybeShowAuthPrompt(BuildContext context) async {
    final store = ZarwintoScope.of(context, listen: false);
    if (store.profile != null) return;
    if (!context.mounted) return;

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: ZarwintoColors.primary.withValues(alpha: .1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: HugeIcon(icon: HugeIcons.strokeRoundedUser02, color: ZarwintoColors.primary, size: 20),
            ),
            const SizedBox(width: 12),
            const Text('Sign in required', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          ],
        ),
        content: const Text(
          'Please sign in to access this feature.',
          style: TextStyle(color: ZarwintoColors.muted, fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            },
            child: const Text('Sign In'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: ZarwintoScope.of(context),
      builder: (context, _) {
        final store = ZarwintoScope.of(context);
        final profile = store.profile;

        if (profile != null) {
          return child;
        }

        if (shouldShowDialog) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (context.mounted) {
              maybeShowAuthPrompt(context);
            }
          });
        }

        if (redirectToLogin) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (context.mounted) {
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            }
          });
        }

        return Scaffold(
          backgroundColor: ZarwintoColors.background,
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: ZarwintoColors.primary.withValues(alpha: .12),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: ZarwintoColors.primary.withValues(alpha: .2)),
                  ),
                  child: HugeIcon(icon: HugeIcons.strokeRoundedFlash, color: ZarwintoColors.accent, size: 32),
                ),
                const SizedBox(height: 24),
                const CircularProgressIndicator(color: ZarwintoColors.primary),
              ],
            ),
          ),
        );
      },
    );
  }
}
