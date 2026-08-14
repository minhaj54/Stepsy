import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import '../providers/zarwinto_store.dart';

/// Curated real footwear lifestyle photos used as the base layer for each
/// brand-designed banner. When banners are uploaded from the admin panel they
/// take precedence (see HeroPanel); these are the premium default fallbacks.
const Map<BannerVariant, String> _variantImages = {
  BannerVariant.indigoGlow:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
  BannerVariant.midnightStreet:
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1200',
  BannerVariant.warmSteps:
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=1200',
  BannerVariant.urbanLuxe:
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=1200',
  BannerVariant.freshDrops:
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=1200',
};

class PremiumHeroBanner extends StatelessWidget {
  const PremiumHeroBanner({super.key, required this.variant, this.imageUrl});

  final BannerVariant variant;
  final String? imageUrl;

  @override
  Widget build(BuildContext context) {
    final colors = ZarwintoColors.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = _background(colors, isDark);
    final textColor = _foreground(colors, isDark);
    final photo = imageUrl ?? _variantImages[variant];

    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: ZarwintoRadius.all20,
          border: Border.all(color: colors.border),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            if (photo != null)
              Positioned.fill(
                child: Image.network(
                  photo,
                  headers: const {'User-Agent': 'Mozilla/5.0 (compatible; Zarwinto/1.0)'},
                  fit: BoxFit.cover,
                  errorBuilder: (ctx, err, stack) => Container(color: Colors.black),
                ),
              ),
            // Brand gradient overlay for cohesion + contrast.
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      (bg.colors.first).withValues(alpha: 0.55),
                      (bg.colors.last).withValues(alpha: 0.8),
                    ],
                  ),
                ),
              ),
            ),
            Positioned.fill(
              child: _BackgroundPainter(variant: variant, colors: colors, isDark: isDark),
            ),
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                  ZarwintoSpacing.lg,
                  ZarwintoSpacing.md,
                  ZarwintoSpacing.lg,
                  ZarwintoSpacing.md,
                ),
                child: Row(
                  children: [
                    Expanded(
                      flex: 6,
                      child: _TextContent(
                        variant: variant,
                        colors: colors,
                        textColor: textColor,
                        isDark: isDark,
                      ),
                    ),
                    Expanded(
                      flex: 5,
                      child: _ShoeSilhouette(variant: variant, colors: colors, isDark: isDark),
                    ),
                  ],
                ),
              ),
            ),
            Positioned(
              top: ZarwintoSpacing.sm,
              right: ZarwintoSpacing.md,
              child: Opacity(
                opacity: 0.35,
                child: _ZarwintoBrandMark(colors: colors, isDark: isDark),
              ),
            ),
          ],
        ),
      ),
    );
  }

  LinearGradient _background(ZarwintoColorBundle colors, bool isDark) {
    switch (variant) {
      case BannerVariant.indigoGlow:
        return const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF6366F1), Color(0xFF312E81)],
        );
      case BannerVariant.midnightStreet:
        return const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF27272A), Color(0xFF09090B)],
        );
      case BannerVariant.warmSteps:
        return const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFF97316), Color(0xFFFED7AA)],
        );
      case BannerVariant.urbanLuxe:
        return const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1E293B), Color(0xFF312E81)],
        );
      case BannerVariant.freshDrops:
        return const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF6366F1), Color(0xFF312E81)],
        );
    }
  }

  Color _foreground(ZarwintoColorBundle colors, bool isDark) {
    switch (variant) {
      case BannerVariant.indigoGlow:
      case BannerVariant.midnightStreet:
      case BannerVariant.urbanLuxe:
      case BannerVariant.warmSteps:
      case BannerVariant.freshDrops:
        return ZarwintoColors.white;
    }
  }
}

class _BackgroundPainter extends StatelessWidget {
  const _BackgroundPainter({
    required this.variant,
    required this.colors,
    required this.isDark,
  });

  final BannerVariant variant;
  final ZarwintoColorBundle colors;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _BackgroundPainterLogic(
        variant: variant,
        colors: colors,
        isDark: isDark,
      ),
    );
  }
}

class _BackgroundPainterLogic extends CustomPainter {
  _BackgroundPainterLogic({
    required this.variant,
    required this.colors,
    required this.isDark,
  });

  final BannerVariant variant;
  final ZarwintoColorBundle colors;
  final bool isDark;

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    switch (variant) {
      case BannerVariant.indigoGlow:
        _paintIndigoGlow(canvas, w, h);
        break;
      case BannerVariant.midnightStreet:
        _paintMidnightStreet(canvas, w, h);
        break;
      case BannerVariant.warmSteps:
        _paintWarmSteps(canvas, w, h);
        break;
      case BannerVariant.urbanLuxe:
        _paintUrbanLuxe(canvas, w, h);
        break;
      case BannerVariant.freshDrops:
        _paintFreshDrops(canvas, w, h);
        break;
    }
  }

  void _paintIndigoGlow(Canvas canvas, double w, double h) {
    final paint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topRight,
        end: Alignment.bottomLeft,
        colors: [
          colors.accent.withValues(alpha: 0.15),
          Colors.transparent,
        ],
      ).createShader(Rect.fromLTWH(0, 0, w, h));

    canvas.drawRect(Rect.fromLTWH(w * 0.6, 0, w * 0.4, h), paint);

    final dotPaint = Paint()..color = colors.accent.withValues(alpha: 0.3);
    canvas.drawCircle(Offset(w * 0.85, h * 0.25), w * 0.08, dotPaint);

    final linePaint = Paint()
      ..color = colors.accent.withValues(alpha: 0.4)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    canvas.drawLine(Offset(w * 0.7, h * 0.1), Offset(w * 0.95, h * 0.1), linePaint);
  }

  void _paintMidnightStreet(Canvas canvas, double w, double h) {
    final paint = Paint()
      ..shader = RadialGradient(
        center: Alignment.topRight,
        radius: 0.6,
        colors: [colors.primary.withValues(alpha: 0.2), Colors.transparent],
      ).createShader(Rect.fromLTWH(0, 0, w, h));

    canvas.drawRect(Rect.fromLTWH(0, 0, w, h), paint);

    final circlePaint = Paint()..color = colors.accent.withValues(alpha: 0.25);
    canvas.drawCircle(Offset(w * 0.8, h * 0.6), w * 0.12, circlePaint);

    final rectPaint = Paint()
      ..color = colors.primary.withValues(alpha: 0.15)
      ..style = PaintingStyle.fill;
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(w * 0.65, h * 0.15, w * 0.25, h * 0.35), const Radius.circular(12)),
      rectPaint,
    );
  }

  void _paintWarmSteps(Canvas canvas, double w, double h) {
    final paint = Paint()
      ..shader = RadialGradient(
        center: Alignment.bottomLeft,
        radius: 0.8,
        colors: [colors.accent.withValues(alpha: 0.25), Colors.transparent],
      ).createShader(Rect.fromLTWH(0, 0, w, h));

    canvas.drawRect(Rect.fromLTWH(0, 0, w, h), paint);

    final wavePaint = Paint()
      ..color = colors.primary.withValues(alpha: 0.12)
      ..style = PaintingStyle.fill;
    final path = Path();
    path.moveTo(0, h * 0.85);
    path.quadraticBezierTo(w * 0.5, h * 0.75, w, h * 0.9);
    path.lineTo(w, h);
    path.lineTo(0, h);
    path.close();
    canvas.drawPath(path, wavePaint);

    final dotPaint = Paint()..color = colors.primary.withValues(alpha: 0.2);
    canvas.drawCircle(Offset(w * 0.15, h * 0.2), w * 0.05, dotPaint);
  }

  void _paintUrbanLuxe(Canvas canvas, double w, double h) {
    final paint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          colors.primary.withValues(alpha: 0.18),
          Colors.transparent,
        ],
      ).createShader(Rect.fromLTWH(0, 0, w, h));

    canvas.drawRect(Rect.fromLTWH(0, 0, w, h), paint);

    final diamondPaint = Paint()
      ..color = colors.accent.withValues(alpha: 0.2)
      ..style = PaintingStyle.fill;
    final center = Offset(w * 0.75, h * 0.5);
    final path = Path()
      ..moveTo(center.dx, center.dy - w * 0.1)
      ..lineTo(center.dx + w * 0.1, center.dy)
      ..lineTo(center.dx, center.dy + w * 0.1)
      ..lineTo(center.dx - w * 0.1, center.dy)
      ..close();
    canvas.drawPath(path, diamondPaint);

    final linePaint = Paint()
      ..color = colors.accent.withValues(alpha: 0.3)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;
    canvas.drawLine(Offset(w * 0.6, h * 0.2), Offset(w * 0.6, h * 0.8), linePaint);
  }

  void _paintFreshDrops(Canvas canvas, double w, double h) {
    final paint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topRight,
        end: Alignment.bottomLeft,
        colors: [
          colors.primary.withValues(alpha: 0.08),
          colors.accent.withValues(alpha: 0.05),
        ],
      ).createShader(Rect.fromLTWH(0, 0, w, h));

    canvas.drawRect(Rect.fromLTWH(0, 0, w, h), paint);

    final circlePaint = Paint()..color = colors.primary.withValues(alpha: 0.1);
    canvas.drawCircle(Offset(w * 0.8, h * 0.3), w * 0.15, circlePaint);

    final smallCircle = Paint()..color = colors.accent.withValues(alpha: 0.2);
    canvas.drawCircle(Offset(w * 0.9, h * 0.6), w * 0.04, smallCircle);
  }

  @override
  bool shouldRepaint(covariant _BackgroundPainterLogic old) => false;
}

class _TextContent extends StatelessWidget {
  const _TextContent({
    required this.variant,
    required this.colors,
    required this.textColor,
    required this.isDark,
  });

  final BannerVariant variant;
  final ZarwintoColorBundle colors;
  final Color textColor;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final ctaBg = variant == BannerVariant.warmSteps || variant == BannerVariant.freshDrops
        ? colors.primary
        : colors.accent;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        if (variant == BannerVariant.indigoGlow || variant == BannerVariant.urbanLuxe)
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: ZarwintoSpacing.sm,
              vertical: ZarwintoSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: textColor.withValues(alpha: 0.12),
              borderRadius: ZarwintoRadius.all8,
              border: Border.all(color: textColor.withValues(alpha: 0.2)),
            ),
            child: Text(
              _badge(),
              style: ZarwintoTypography.small.copyWith(
                color: textColor,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        if (variant == BannerVariant.indigoGlow || variant == BannerVariant.urbanLuxe)
          const SizedBox(height: ZarwintoSpacing.sm),
        Flexible(
          child: Text(
            'Step Into Something New',
            style: ZarwintoTypography.h3.copyWith(
              color: textColor,
              height: 1.1,
              fontWeight: FontWeight.w800,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(height: ZarwintoSpacing.xs),
        Flexible(
          child: Text(
            'Discover footwear you\'ll love.',
            style: ZarwintoTypography.caption.copyWith(
              color: textColor.withValues(alpha: 0.75),
              height: 1.3,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(height: ZarwintoSpacing.md),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => ZarwintoScope.of(context).setActiveTab(1),
            style: ElevatedButton.styleFrom(
              backgroundColor: ctaBg,
              foregroundColor: ZarwintoColors.white,
              padding: const EdgeInsets.symmetric(
                horizontal: ZarwintoSpacing.lg,
                vertical: ZarwintoSpacing.sm,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: ZarwintoRadius.all12,
              ),
              elevation: 0,
              minimumSize: const Size(0, 36),
            ),
            child: Text(
              'Shop Now',
              style: ZarwintoTypography.small.copyWith(
                color: ZarwintoColors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      ],
    );
  }

  String _badge() {
    switch (variant) {
      case BannerVariant.indigoGlow:
        return 'NEW COLLECTION';
      case BannerVariant.midnightStreet:
        return 'STREET STYLE';
      case BannerVariant.warmSteps:
        return 'SUMMER ESSENTIALS';
      case BannerVariant.urbanLuxe:
        return 'PREMIUM EDIT';
      case BannerVariant.freshDrops:
        return 'FRESH DROPS';
    }
  }
}

class _ShoeSilhouette extends StatelessWidget {
  const _ShoeSilhouette({
    required this.variant,
    required this.colors,
    required this.isDark,
  });

  final BannerVariant variant;
  final ZarwintoColorBundle colors;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _ShoeSilhouettePainter(variant: variant, colors: colors, isDark: isDark),
    );
  }
}

class _ShoeSilhouettePainter extends CustomPainter {
  _ShoeSilhouettePainter({
    required this.variant,
    required this.colors,
    required this.isDark,
  });

  final BannerVariant variant;
  final ZarwintoColorBundle colors;
  final bool isDark;

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    switch (variant) {
      case BannerVariant.indigoGlow:
        _drawSneaker(canvas, w, h, colors.accent.withValues(alpha: 0.9), 0.15);
        break;
      case BannerVariant.midnightStreet:
        _drawSneaker(canvas, w, h, colors.primary.withValues(alpha: 0.7), 0.1);
        break;
      case BannerVariant.warmSteps:
        _drawSandal(canvas, w, h, colors.primary.withValues(alpha: 0.8), 0.12);
        break;
      case BannerVariant.urbanLuxe:
        _drawBoot(canvas, w, h, colors.accent.withValues(alpha: 0.85), 0.14);
        break;
      case BannerVariant.freshDrops:
        _drawSlipper(canvas, w, h, colors.primary.withValues(alpha: 0.7), 0.1);
        break;
    }
  }

  void _drawSneaker(Canvas canvas, double w, double h, Color color, double offset) {
    final paint = Paint()..color = color..style = PaintingStyle.fill..isAntiAlias = true;
    final path = Path();
    final cx = w * (0.5 + offset);
    final cy = h * 0.65;
    final scale = w * 0.35;

    path.moveTo(cx - scale * 0.8, cy + scale * 0.3);
    path.lineTo(cx - scale * 0.6, cy - scale * 0.2);
    path.quadraticBezierTo(cx - scale * 0.2, cy - scale * 0.5, cx + scale * 0.3, cy - scale * 0.35);
    path.quadraticBezierTo(cx + scale * 0.7, cy - scale * 0.2, cx + scale * 0.8, cy + scale * 0.1);
    path.lineTo(cx + scale * 0.7, cy + scale * 0.35);
    path.quadraticBezierTo(cx + scale * 0.2, cy + scale * 0.5, cx - scale * 0.8, cy + scale * 0.3);
    path.close();

    canvas.drawPath(path, paint);

    final solePaint = Paint()
      ..color = color.withValues(alpha: 0.5)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;
    final solePath = Path();
    solePath.moveTo(cx - scale * 0.8, cy + scale * 0.3);
    solePath.quadraticBezierTo(cx + scale * 0.2, cy + scale * 0.55, cx + scale * 0.7, cy + scale * 0.35);
    solePath.lineTo(cx + scale * 0.8, cy + scale * 0.25);
    solePath.lineTo(cx - scale * 0.8, cy + scale * 0.25);
    solePath.close();
    canvas.drawPath(solePath, solePaint);
  }

  void _drawSandal(Canvas canvas, double w, double h, Color color, double offset) {
    final paint = Paint()..color = color..style = PaintingStyle.fill..isAntiAlias = true;
    final cx = w * (0.5 + offset);
    final cy = h * 0.6;
    final scale = w * 0.3;

    final path = Path();
    path.addOval(Rect.fromCenter(center: Offset(cx, cy), width: scale * 1.4, height: scale * 0.7));
    canvas.drawPath(path, paint);

    final strapPaint = Paint()
      ..color = color.withValues(alpha: 0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.02
      ..isAntiAlias = true;

    canvas.drawLine(Offset(cx - scale * 0.3, cy - scale * 0.2), Offset(cx, cy), strapPaint);
    canvas.drawLine(Offset(cx + scale * 0.3, cy - scale * 0.2), Offset(cx, cy), strapPaint);
    canvas.drawLine(Offset(cx, cy), Offset(cx, cy + scale * 0.3), strapPaint);
  }

  void _drawBoot(Canvas canvas, double w, double h, Color color, double offset) {
    final paint = Paint()..color = color..style = PaintingStyle.fill..isAntiAlias = true;
    final cx = w * (0.5 + offset);
    final cy = h * 0.65;
    final scale = w * 0.28;

    final path = Path();
    path.moveTo(cx - scale * 0.5, cy - scale * 0.6);
    path.lineTo(cx + scale * 0.5, cy - scale * 0.6);
    path.lineTo(cx + scale * 0.4, cy + scale * 0.4);
    path.quadraticBezierTo(cx, cy + scale * 0.5, cx - scale * 0.4, cy + scale * 0.4);
    path.close();
    canvas.drawPath(path, paint);

    final solePaint = Paint()
      ..color = color.withValues(alpha: 0.5)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;
    final solePath = Path();
    solePath.addRect(Rect.fromLTWH(cx - scale * 0.45, cy + scale * 0.35, scale * 0.9, scale * 0.12));
    canvas.drawPath(solePath, solePaint);
  }

  void _drawSlipper(Canvas canvas, double w, double h, Color color, double offset) {
    final paint = Paint()..color = color..style = PaintingStyle.fill..isAntiAlias = true;
    final cx = w * (0.5 + offset);
    final cy = h * 0.65;
    final scale = w * 0.32;

    final path = Path();
    path.moveTo(cx - scale * 0.7, cy + scale * 0.2);
    path.quadraticBezierTo(cx - scale * 0.3, cy - scale * 0.4, cx + scale * 0.5, cy - scale * 0.2);
    path.quadraticBezierTo(cx + scale * 0.8, cy + scale * 0.1, cx + scale * 0.6, cy + scale * 0.35);
    path.quadraticBezierTo(cx, cy + scale * 0.45, cx - scale * 0.7, cy + scale * 0.2);
    path.close();
    canvas.drawPath(path, paint);

    final innerPaint = Paint()
      ..color = color.withValues(alpha: 0.4)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;
    final innerPath = Path();
    innerPath.addOval(Rect.fromCenter(center: Offset(cx + scale * 0.1, cy), width: scale * 0.4, height: scale * 0.25));
    canvas.drawPath(innerPath, innerPaint);
  }

  @override
  bool shouldRepaint(covariant _ShoeSilhouettePainter old) => false;
}

class _ZarwintoBrandMark extends StatelessWidget {
  const _ZarwintoBrandMark({
    required this.colors,
    required this.isDark,
  });

  final ZarwintoColorBundle colors;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        HugeIcon(
          icon: HugeIcons.strokeRoundedFlash,
          size: 14,
          color: colors.accent,
        ),
        const SizedBox(width: ZarwintoSpacing.xs),
        Text(
          'Zarwinto',
          style: ZarwintoTypography.small.copyWith(
            color: isDark ? ZarwintoColors.white : colors.foreground,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.2,
          ),
        ),
      ],
    );
  }
}

enum BannerVariant {
  indigoGlow,
  midnightStreet,
  warmSteps,
  urbanLuxe,
  freshDrops,
}
