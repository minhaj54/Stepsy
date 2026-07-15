import 'package:flutter/material.dart';
import '../core/theme.dart';

class WhishkhuHeader extends StatelessWidget {
  const WhishkhuHeader({super.key, this.title = 'Whishkhu'});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: WhishkhuColors.primary.withValues(alpha: .18),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: WhishkhuColors.primary.withValues(alpha: .25),
            ),
          ),
          child: const Icon(Icons.bolt_rounded, color: WhishkhuColors.accent),
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
              style: TextStyle(color: WhishkhuColors.muted),
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

class WhishkhuRemoteImage extends StatelessWidget {
  const WhishkhuRemoteImage({super.key, required this.url, this.seed});

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
        return const ColoredBox(
          color: Colors.black12,
          child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
        );
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
