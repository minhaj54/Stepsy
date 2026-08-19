import 'dart:async';
import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import '../widgets/z_button.dart';

class CheckoutFailureScreen extends StatefulWidget {
  const CheckoutFailureScreen({
    super.key,
    this.errorMessage,
    this.onRetry,
  });

  final String? errorMessage;
  final VoidCallback? onRetry;

  @override
  State<CheckoutFailureScreen> createState() => _CheckoutFailureScreenState();
}

class _CheckoutFailureScreenState extends State<CheckoutFailureScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _opacityAnimation;
  Timer? _redirectTimer;
  int _countdown = 3;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _scaleAnimation = CurvedAnimation(parent: _controller, curve: ElasticOutCurve(0.8));
    _opacityAnimation = CurvedAnimation(parent: _controller, curve: Curves.easeIn);

    _controller.forward();

    _startCountdown();
  }

  void _startCountdown() {
    _redirectTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() => _countdown--);
      if (_countdown <= 0) {
        timer.cancel();
        _goBack();
      }
    });
  }

  void _goBack() {
    if (!mounted) return;
    _redirectTimer?.cancel();
    Navigator.pop(context);
  }

  @override
  void dispose() {
    _redirectTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor: ZarwintoColors.background,
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(ZarwintoSpacing.xxl),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  FadeTransition(
                    opacity: _opacityAnimation,
                    child: ScaleTransition(
                      scale: _scaleAnimation,
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: ZarwintoColors.error.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(40),
                          border: Border.all(color: ZarwintoColors.error.withValues(alpha: 0.3)),
                        ),
                        child: HugeIcon(
                          icon: HugeIcons.strokeRoundedCancel01,
                          size: 40,
                          color: ZarwintoColors.error,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: ZarwintoSpacing.xxl),
                  Text(
                    'Order Failed!',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: ZarwintoColors.foreground,
                        ),
                  ),
                  const SizedBox(height: ZarwintoSpacing.md),
                  Text(
                    widget.errorMessage ?? 'Something went wrong with your order. Please try again.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: ZarwintoColors.muted,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: ZarwintoSpacing.sm),
                  Text(
                    'Returning to checkout in $_countdown...',
                    style: TextStyle(
                      color: ZarwintoColors.error,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: ZarwintoSpacing.xxxl),
                  if (widget.onRetry != null) ...[
                    ZButton.primary(
                      onPressed: () {
                        _redirectTimer?.cancel();
                        Navigator.pop(context);
                        widget.onRetry!();
                      },
                      label: 'Try Again',
                    ),
                    const SizedBox(height: ZarwintoSpacing.lg),
                  ],
                  TextButton(
                    onPressed: _goBack,
                    child: const Text('Back to Cart'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
