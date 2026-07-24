import 'package:flutter/material.dart';

class ZarwintoColors {
  static const background = Color(0xFFF7F7F7);
  static const canvas = Color(0xFFEFF3EA); // Soft sage/canvas background
  static const white = Colors.white;
  static const card = Colors.white;
  static const border = Color(0xFFEEEEEE);
  static const foreground = Color(0xFF1A1A1A);
  static const foregroundSecondary = Color(0xFF7D7D7D);
  static const muted = Color(0xFF8E8E93);
  static const primary = Color(0xFF000000);
  static const accent = Color(0xFFE85D4E); // Coral sale badge accent
  static const discountText = Color(0xFFEE5D50);
  static const surface = Color(0xFFF2F2F2);
  static const error = Color(0xFFEF4444);
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const info = Color(0xFF3B82F6);
  static const secondary = Color(0xFF6366F1);

  // Pastel Card Background Colors matching design screenshot
  static const pastelAqua = Color(0xFFE1F5F2);   // Air Jordan 1 background
  static const pastelCream = Color(0xFFF8F3EC);  // Nike Vomero background
  static const pastelMint = Color(0xFFE5F5E9);   // Sports card 1 background
  static const pastelPink = Color(0xFFFDEAE8);   // Sports card 2 background
  static const bannerNavy = Color(0xFF29487D);   // Banner navy accent block
}

class ZarwintoTheme {
  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: ZarwintoColors.background,
      colorScheme: const ColorScheme.light(
        surface: ZarwintoColors.white,
        primary: ZarwintoColors.primary,
        onSurface: ZarwintoColors.foreground,
        error: ZarwintoColors.error,
      ),
      fontFamily: 'SF Pro Display',
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
          borderRadius: BorderRadius.circular(24),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: ZarwintoColors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(30),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: ZarwintoColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(56),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: ZarwintoColors.white,
        selectedColor: ZarwintoColors.primary,
        side: BorderSide.none,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        labelStyle: const TextStyle(fontWeight: FontWeight.w500),
      ),
    );
  }
}

const titleStyle = TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ZarwintoColors.foreground);
const mutedStyle = TextStyle(color: ZarwintoColors.muted, fontSize: 14);
