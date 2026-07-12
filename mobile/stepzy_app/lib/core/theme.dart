import 'package:flutter/material.dart';

class StepzyColors {
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

class StepzyTheme {
  static ThemeData get dark {
    const scheme = ColorScheme.dark(
      surface: StepzyColors.background,
      primary: StepzyColors.primary,
      secondary: StepzyColors.accent,
      error: StepzyColors.danger,
      onSurface: StepzyColors.foreground,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: StepzyColors.background,
      colorScheme: scheme,
      fontFamily: 'SF Pro Display',
      appBarTheme: const AppBarTheme(
        backgroundColor: StepzyColors.background,
        foregroundColor: StepzyColors.foreground,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: StepzyColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: StepzyColors.border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: StepzyColors.panel,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: StepzyColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: StepzyColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: StepzyColors.primary, width: 1.4),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: StepzyColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: StepzyColors.panel,
        selectedColor: StepzyColors.primary.withValues(alpha: .22),
        side: const BorderSide(color: StepzyColors.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        labelStyle: const TextStyle(fontWeight: FontWeight.w700),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: StepzyColors.card,
        selectedItemColor: StepzyColors.primary,
        unselectedItemColor: StepzyColors.muted,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}

const titleStyle = TextStyle(fontSize: 20, fontWeight: FontWeight.w900);
const mutedStyle = TextStyle(color: StepzyColors.muted);
