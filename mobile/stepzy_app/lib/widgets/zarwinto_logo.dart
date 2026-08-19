import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';

class ZarwintoLogo extends StatelessWidget {
  const ZarwintoLogo({super.key, this.size = 24});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/App icon/GooglePlayStore.png',
      width: size,
      height: size,
      fit: BoxFit.contain,
    );
  }
}

class ZarwintoWordmark extends StatelessWidget {
  const ZarwintoWordmark({super.key, this.color, this.fontSize = 24});

  final Color? color;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final colors = ZarwintoColors.of(context);
    return Text(
      'Zarwinto',
      style: ZarwintoTypography.h2.copyWith(
        color: color ?? colors.foreground,
        fontSize: fontSize,
        height: 1.1,
      ),
    );
  }
}

class ZarwintoMark extends StatelessWidget {
  const ZarwintoMark({super.key, this.color, this.size = 40});

  final Color? color;
  final double size;

  @override
  Widget build(BuildContext context) {
    final colors = ZarwintoColors.of(context);
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: (color ?? colors.primary).withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(ZarwintoRadius.sm),
        border: Border.all(
          color: colors.primary.withValues(alpha: 0.3),
        ),
      ),
      child: HugeIcon(icon: HugeIcons.strokeRoundedFlash,
        size: size * 0.5,
        color: colors.accent,
      ),
    );
  }
}


