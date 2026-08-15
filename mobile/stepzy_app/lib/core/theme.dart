import 'package:flutter/material.dart';

/// Brand palette aligned with Zarwinto / Stepzy design system.
class ZarwintoColors {
  static const background = Color(0xFFF4F4F5);
  static const canvas = Color(0xFFEFF3EA);
  static const white = Colors.white;
  static const card = Color(0xFFFFFFFF);
  static const border = Color(0xFFE4E4E7);
  static const foreground = Color(0xFF09090B);
  static const foregroundSecondary = Color(0xFF71717A);
  static const muted = Color(0xFF71717A);
  static const primary = Color(0xFF6366F1);
  static const accent = Color(0xFFF97316);
  static const discountText = Color(0xFFEE5D50);
  static const surface = Color(0xFFFFFFFF);
  static const error = Color(0xFFEF4444);
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const info = Color(0xFF3B82F6);
  static const secondary = Color(0xFF6366F1);
  static const whatsappGreen = Color(0xFF25D366);

  static const pastelAqua = Color(0xFFE1F5F2);
  static const pastelCream = Color(0xFFF8F3EC);
  static const pastelMint = Color(0xFFE5F5E9);
  static const pastelPink = Color(0xFFFDEAE8);
  static const bannerNavy = Color(0xFF29487D);

  static ZarwintoColorBundle of(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return isDark ? ZarwintoColorBundle.dark : ZarwintoColorBundle.light;
  }
}

class ZarwintoColorBundle {
  const ZarwintoColorBundle({
    required this.background,
    required this.surface,
    required this.card,
    required this.border,
    required this.foreground,
    required this.foregroundSecondary,
    required this.muted,
    required this.primary,
    required this.accent,
    required this.error,
    required this.success,
    required this.warning,
  });

  static const light = ZarwintoColorBundle(
    background: ZarwintoColors.background,
    surface: ZarwintoColors.surface,
    card: ZarwintoColors.card,
    border: ZarwintoColors.border,
    foreground: ZarwintoColors.foreground,
    foregroundSecondary: ZarwintoColors.foregroundSecondary,
    muted: ZarwintoColors.muted,
    primary: ZarwintoColors.primary,
    accent: ZarwintoColors.accent,
    error: ZarwintoColors.error,
    success: ZarwintoColors.success,
    warning: ZarwintoColors.warning,
  );

  static const dark = ZarwintoColorBundle(
    background: Color(0xFF09090B),
    surface: Color(0xFF18181B),
    card: Color(0xFF18181B),
    border: Color(0xFF27272A),
    foreground: Color(0xFFFFFFFF),
    foregroundSecondary: Color(0xFFA1A1AA),
    muted: Color(0xFFA1A1AA),
    primary: ZarwintoColors.primary,
    accent: ZarwintoColors.accent,
    error: ZarwintoColors.error,
    success: ZarwintoColors.success,
    warning: ZarwintoColors.warning,
  );

  final Color background;
  final Color surface;
  final Color card;
  final Color border;
  final Color foreground;
  final Color foregroundSecondary;
  final Color muted;
  final Color primary;
  final Color accent;
  final Color error;
  final Color success;
  final Color warning;

  Color get secondaryText => foregroundSecondary;
}

class ZarwintoSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double xxxl = 32;
}

class ZarwintoRadius {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double full = 999;

  static const all4 = BorderRadius.all(Radius.circular(4));
  static const all8 = BorderRadius.all(Radius.circular(8));
  static const all12 = BorderRadius.all(Radius.circular(12));
  static const all16 = BorderRadius.all(Radius.circular(16));
  static const all20 = BorderRadius.all(Radius.circular(20));
  static const all24 = BorderRadius.all(Radius.circular(24));
  static const allFull = BorderRadius.all(Radius.circular(999));
}

class ZarwintoTypography {
  static const display = TextStyle(
    fontSize: 40,
    fontWeight: FontWeight.w700,
    color: ZarwintoColors.foreground,
    height: 1.1,
  );

  static const h1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.w700,
    color: ZarwintoColors.foreground,
    height: 1.15,
  );

  static const h2 = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w600,
    color: ZarwintoColors.foreground,
    height: 1.15,
  );

  static const h3 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: ZarwintoColors.foreground,
    height: 1.2,
  );

  static const title = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: ZarwintoColors.foreground,
  );

  static const body = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: ZarwintoColors.foreground,
    height: 1.45,
  );

  static const caption = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: ZarwintoColors.muted,
    height: 1.4,
  );

  static const small = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: ZarwintoColors.muted,
  );

  static const button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: Colors.white,
  );
}

class ZarwintoTheme {
  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: ZarwintoColors.background,
      colorScheme: const ColorScheme.light(
        surface: ZarwintoColors.surface,
        primary: ZarwintoColors.primary,
        secondary: ZarwintoColors.accent,
        onSurface: ZarwintoColors.foreground,
        error: ZarwintoColors.error,
      ),
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: ZarwintoColors.foreground,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardThemeData(
        color: ZarwintoColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: ZarwintoColors.border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: ZarwintoColors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ZarwintoColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ZarwintoColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ZarwintoColors.primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: ZarwintoColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: ZarwintoTypography.button,
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: ZarwintoColors.white,
        selectedColor: ZarwintoColors.primary,
        side: const BorderSide(color: ZarwintoColors.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        labelStyle: const TextStyle(fontWeight: FontWeight.w500),
      ),
    );
  }

  static ThemeData get dark {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: const Color(0xFF09090B),
      colorScheme: const ColorScheme.dark(
        surface: Color(0xFF18181B),
        primary: ZarwintoColors.primary,
        secondary: ZarwintoColors.accent,
        onSurface: Colors.white,
        error: ZarwintoColors.error,
      ),
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardThemeData(
        color: const Color(0xFF18181B),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFF27272A)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF18181B),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF27272A)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF27272A)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ZarwintoColors.primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}

const titleStyle = TextStyle(
  fontSize: 20,
  fontWeight: FontWeight.w700,
  color: ZarwintoColors.foreground,
);

const mutedStyle = TextStyle(
  color: ZarwintoColors.muted,
  fontSize: 14,
);
