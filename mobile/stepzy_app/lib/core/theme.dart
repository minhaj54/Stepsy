import 'package:flutter/material.dart';

class ZarwintoColors {
  static const background = Color(0xFF09090B);
  static const card = Color(0xFF151518);
  static const panel = Color(0xFF1F1F23);
  static const border = Color(0xFF27272A);
  static const foreground = Color(0xFFF4F4F5);
  static const muted = Color(0xFFA1A1AA);
  static const primary = Color(0xFF6366F1);
  static const primaryHover = Color(0xFF4F46E5);
  static const accent = Color(0xFFF97316);
  static const danger = Color(0xFFEF4444);
}

class ZarwintoTheme {
  static ThemeData get dark {
    const scheme = ColorScheme.dark(
      surface: ZarwintoColors.background,
      primary: ZarwintoColors.primary,
      secondary: ZarwintoColors.accent,
      error: ZarwintoColors.danger,
      onSurface: ZarwintoColors.foreground,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: ZarwintoColors.background,
      colorScheme: scheme,
      fontFamily: 'SF Pro Display',
      appBarTheme: const AppBarTheme(
        backgroundColor: ZarwintoColors.background,
        foregroundColor: ZarwintoColors.foreground,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: ZarwintoColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: ZarwintoColors.border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: ZarwintoColors.panel,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: ZarwintoColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: ZarwintoColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: ZarwintoColors.primary, width: 1.4),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: ZarwintoColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: ZarwintoColors.panel,
        selectedColor: ZarwintoColors.primary.withValues(alpha: .22),
        side: const BorderSide(color: ZarwintoColors.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        labelStyle: const TextStyle(fontWeight: FontWeight.w700),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: ZarwintoColors.card,
        selectedItemColor: ZarwintoColors.primary,
        unselectedItemColor: ZarwintoColors.muted,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}

const titleStyle = TextStyle(fontSize: 20, fontWeight: FontWeight.w900);
const mutedStyle = TextStyle(color: ZarwintoColors.muted);
