import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';

import '../core/theme.dart';

/// Full-screen fallback shown when the device has no internet connection.
class NoInternetScreen extends StatelessWidget {
  const NoInternetScreen({super.key, required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final colors = ZarwintoColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: ZarwintoSpacing.xxl,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: colors.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                   child: HugeIcon(icon: HugeIcons.strokeRoundedWifiOff01,
                    size: 44,
                    color: colors.primary,
                  ),
                ),
                const SizedBox(height: ZarwintoSpacing.xl),
                Text(
                  'No internet connection',
                  textAlign: TextAlign.center,
                  style: ZarwintoTypography.h3,
                ),
                const SizedBox(height: ZarwintoSpacing.sm),
                Text(
                  'Please check your network and try again.',
                  textAlign: TextAlign.center,
                  style: ZarwintoTypography.caption.copyWith(
                    color: colors.secondaryText,
                  ),
                ),
                const SizedBox(height: ZarwintoSpacing.xl),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: colors.primary,
                      foregroundColor: ZarwintoColors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: ZarwintoRadius.all16,
                      ),
                      textStyle: ZarwintoTypography.button,
                    ),
                    onPressed: onRetry,
                    child: const Text('Try again'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
