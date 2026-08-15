import 'package:flutter/material.dart';
import '../core/theme.dart';

class OrderStatusTracker extends StatelessWidget {
  const OrderStatusTracker({
    super.key,
    required this.currentStatus,
  });

  final String currentStatus;

  static const _steps = [
    _StepData(
      status: 'pending',
      label: 'Order Placed',
      icon: Icons.receipt_long_rounded,
    ),
    _StepData(
      status: 'processing',
      label: 'Processing',
      icon: Icons.inventory_2_outlined,
    ),
    _StepData(
      status: 'shipped',
      label: 'Shipped',
      icon: Icons.local_shipping_outlined,
    ),
    _StepData(
      status: 'delivered',
      label: 'Delivered',
      icon: Icons.check_circle_outline_rounded,
    ),
  ];

  int get _currentIndex {
    final status = currentStatus.toLowerCase();
    if (status == 'delivered') return 3;
    if (status == 'shipped' || status == 'out_for_delivery') return 2;
    if (status == 'processing' || status == 'confirmed') return 1;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final colors = ZarwintoColors.of(context);
    final current = _currentIndex;
    final isCancelled = currentStatus.toLowerCase() == 'cancelled';

    if (isCancelled) {
      return Container(
        padding: const EdgeInsets.all(ZarwintoSpacing.md),
        decoration: BoxDecoration(
          color: colors.error.withValues(alpha: 0.08),
          borderRadius: ZarwintoRadius.all12,
          border: Border.all(color: colors.error.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Icon(Icons.cancel_outlined, color: colors.error, size: 22),
            const SizedBox(width: ZarwintoSpacing.md),
            Text(
              'This order has been cancelled',
              style: ZarwintoTypography.caption.copyWith(
                color: colors.error,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            for (int i = 0; i < _steps.length; i++) ...[
              _StepCircle(
                step: _steps[i],
                isActive: i <= current,
                isCurrent: i == current,
                colors: colors,
              ),
              if (i < _steps.length - 1)
                Expanded(
                  child: _StepLine(
                    isActive: i < current,
                    colors: colors,
                  ),
                ),
            ],
          ],
        ),
        const SizedBox(height: ZarwintoSpacing.sm),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            for (int i = 0; i < _steps.length; i++)
              Expanded(
                child: Text(
                  _steps[i].label,
                  textAlign: i == 0
                      ? TextAlign.start
                      : i == _steps.length - 1
                          ? TextAlign.end
                          : TextAlign.center,
                  style: ZarwintoTypography.small.copyWith(
                    fontWeight: i <= current ? FontWeight.w700 : FontWeight.w500,
                    color: i <= current ? colors.foreground : colors.secondaryText,
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class _StepData {
  const _StepData({
    required this.status,
    required this.label,
    required this.icon,
  });

  final String status;
  final String label;
  final IconData icon;
}

class _StepCircle extends StatelessWidget {
  const _StepCircle({
    required this.step,
    required this.isActive,
    required this.isCurrent,
    required this.colors,
  });

  final _StepData step;
  final bool isActive;
  final bool isCurrent;
  final ZarwintoColorBundle colors;

  @override
  Widget build(BuildContext context) {
    final color = isActive ? colors.primary : colors.border;
    final bg = isActive ? colors.primary.withValues(alpha: 0.1) : colors.background;

    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: bg,
        shape: BoxShape.circle,
        border: Border.all(
          color: color,
          width: isCurrent ? 3 : 2,
        ),
      ),
      child: Icon(
        step.icon,
        size: isCurrent ? 18 : 16,
        color: isActive ? colors.primary : colors.secondaryText,
      ),
    );
  }
}

class _StepLine extends StatelessWidget {
  const _StepLine({
    required this.isActive,
    required this.colors,
  });

  final bool isActive;
  final ZarwintoColorBundle colors;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 3,
      margin: const EdgeInsets.symmetric(horizontal: ZarwintoSpacing.xs),
      decoration: BoxDecoration(
        color: isActive ? colors.primary : colors.border,
        borderRadius: BorderRadius.circular(ZarwintoRadius.xs),
      ),
    );
  }
}
