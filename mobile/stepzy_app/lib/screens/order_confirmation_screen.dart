import 'dart:async';
import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import '../models/order.dart';
import '../widgets/z_button.dart';
import '../screens/main_shell.dart';
import 'orders_screen.dart';

class OrderConfirmationScreen extends StatefulWidget {
  const OrderConfirmationScreen({
    super.key,
    required this.order,
    this.onContinueShopping,
  });

  final Order order;
  final VoidCallback? onContinueShopping;

  @override
  State<OrderConfirmationScreen> createState() => _OrderConfirmationScreenState();
}

class _OrderConfirmationScreenState extends State<OrderConfirmationScreen>
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
      duration: const Duration(milliseconds: 900),
      vsync: this,
    );
    _scaleAnimation = CurvedAnimation(parent: _controller, curve: ElasticOutCurve(0.8));
    _opacityAnimation = CurvedAnimation(parent: _controller, curve: Curves.easeIn);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _controller.forward();
    });

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
        _goToOrders();
      }
    });
  }

  void _goToOrders() {
    if (!mounted) return;
    _redirectTimer?.cancel();

    final shell = context.findAncestorStateOfType<MainShellState>();
    shell?.switchToTab(3);

    Future.delayed(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => OrdersScreen(initialOrderId: widget.order.id),
        ),
      );
    });
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
                          color: ZarwintoColors.success.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(40),
                          border: Border.all(
                            color: ZarwintoColors.success.withValues(alpha: 0.3),
                          ),
                        ),
                        child: const HugeIcon(
                          icon: HugeIcons.strokeRoundedCheckmarkCircle01,
                          size: 40,
                          color: ZarwintoColors.success,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: ZarwintoSpacing.xxl),
                  Text(
                    'Order Confirmed!',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: ZarwintoColors.foreground,
                        ),
                  ),
                  const SizedBox(height: ZarwintoSpacing.md),
                  Text(
                    'Your order has been placed successfully.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: ZarwintoColors.muted,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: ZarwintoSpacing.xxl),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(ZarwintoSpacing.lg),
                    decoration: BoxDecoration(
                      color: ZarwintoColors.card,
                      borderRadius: ZarwintoRadius.all16,
                      border: Border.all(color: ZarwintoColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Order ID',
                          style: TextStyle(
                            color: ZarwintoColors.muted,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: ZarwintoSpacing.xs),
                        Text(
                          widget.order.id,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: ZarwintoSpacing.sm),
                        Text(
                          'Total',
                          style: TextStyle(
                            color: ZarwintoColors.muted,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: ZarwintoSpacing.xs),
                        Text(
                          '₹${widget.order.totalAmount.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                            color: ZarwintoColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: ZarwintoSpacing.xxxl),
                  Text(
                    'Redirecting to My Orders in $_countdown...',
                    style: TextStyle(
                      color: ZarwintoColors.primary,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: ZarwintoSpacing.lg),
                  ZButton.primary(
                    onPressed: () {
                      _redirectTimer?.cancel();
                      _goToOrders();
                    },
                    label: 'View My Orders',
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
