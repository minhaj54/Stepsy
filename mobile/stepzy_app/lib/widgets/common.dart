import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../core/theme.dart';

final inrFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

class ZarwintoHeader extends StatelessWidget {
  const ZarwintoHeader({super.key, this.title = 'Zarwinto'});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: ZarwintoColors.primary.withValues(alpha: .18),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: ZarwintoColors.primary.withValues(alpha: .25),
            ),
          ),
          child: HugeIcon(icon: HugeIcons.strokeRoundedFlash, color: ZarwintoColors.accent),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
            ),
            const Text(
              'World of shoes',
              style: TextStyle(color: ZarwintoColors.muted),
            ),
          ],
        ),
      ],
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    required this.subtitle,
    this.trailing,
  });

  final String title;
  final String subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: titleStyle),
              const SizedBox(height: 2),
              Text(subtitle, style: mutedStyle),
            ],
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }
}

class ZarwintoRemoteImage extends StatelessWidget {
  const ZarwintoRemoteImage({super.key, required this.url, this.seed});

  final String url;
  final String? seed;

  @override
  Widget build(BuildContext context) {
    final effectiveUrl =
        (url.isEmpty || !url.startsWith('http'))
            ? 'https://picsum.photos/seed/${seed ?? url.hashCode}/800'
            : url;

    return Image.network(
      effectiveUrl,
      fit: BoxFit.cover,
      loadingBuilder: (context, child, loading) {
        if (loading == null) return child;
        return const _ImageShimmer();
      },
      frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
        if (wasSynchronouslyLoaded || frame != null) {
          return AnimatedOpacity(
            opacity: 1,
            duration: const Duration(milliseconds: 250),
            child: child,
          );
        }
        return const _ImageShimmer();
      },
      errorBuilder: (context, error, stackTrace) {
        return Image.network(
          'https://picsum.photos/seed/${seed ?? url.hashCode}/800',
          fit: BoxFit.cover,
        );
      },
    );
  }
}

class _ImageShimmer extends StatelessWidget {
  const _ImageShimmer();

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: ZarwintoColors.background,
      highlightColor: ZarwintoColors.surface,
      period: const Duration(milliseconds: 1200),
      child: ColoredBox(
        color: ZarwintoColors.background,
      ),
    );
  }
}

class NoticeCard extends StatelessWidget {
  const NoticeCard({super.key, required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
            const SizedBox(height: 6),
            Text(body, style: mutedStyle),
          ],
        ),
      ),
    );
  }
}

class PriceLine extends StatelessWidget {
  const PriceLine({
    super.key,
    required this.label,
    required this.value,
    this.emphasis = false,
  });

  final String label;
  final String value;
  final bool emphasis;

  @override
  Widget build(BuildContext context) {
    final style = emphasis
        ? titleStyle
        : const TextStyle(fontWeight: FontWeight.w700);
    return Row(
      children: [
        Text(label, style: style),
        const Spacer(),
        Text(value, style: style),
      ],
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState(this.message, {super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Center(child: Text(message, style: mutedStyle)),
      ),
    );
  }
}

class ShimmerBox extends StatelessWidget {
  const ShimmerBox({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 8,
  });

  final double width;
  final double height;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }
}

class ShimmerProductCard extends StatelessWidget {
  const ShimmerProductCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: ZarwintoColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZarwintoColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Container(
              decoration: const BoxDecoration(
                color: Color(0xFFF4F4F5),
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(height: 10, width: 60, color: const Color(0xFFF4F4F5)),
                const SizedBox(height: 6),
                Container(height: 14, width: double.infinity, color: const Color(0xFFF4F4F5)),
                const SizedBox(height: 8),
                Container(height: 14, width: 80, color: const Color(0xFFF4F4F5)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

