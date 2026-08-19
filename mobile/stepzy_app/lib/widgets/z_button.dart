import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';

enum ZButtonStyle { primary, secondary, cta, text }

class ZButton extends StatelessWidget {
  const ZButton({
    super.key,
    required this.onPressed,
    required this.label,
    this.style = ZButtonStyle.primary,
    this.icon,
    this.isDense = false,
    this.isLoading = false,
    this.width,
    this.height,
    this.padding,
  });

  final VoidCallback? onPressed;
  final String label;
  final ZButtonStyle style;
  final IconData? icon;
  final bool isDense;
  final bool isLoading;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;

  static Widget primary({
    required VoidCallback? onPressed,
    required String label,
    IconData? icon,
    bool isLoading = false,
    double? width,
    double? height,
  }) {
    return ZButton(
      onPressed: onPressed,
      label: label,
      style: ZButtonStyle.primary,
      icon: icon,
      isLoading: isLoading,
      width: width,
      height: height,
    );
  }

  static Widget secondary({
    required VoidCallback? onPressed,
    required String label,
    IconData? icon,
    bool isLoading = false,
    double? width,
    double? height,
  }) {
    return ZButton(
      onPressed: onPressed,
      label: label,
      style: ZButtonStyle.secondary,
      icon: icon,
      isLoading: isLoading,
      width: width,
      height: height,
    );
  }

  static Widget cta({
    required VoidCallback? onPressed,
    required String label,
    IconData? icon,
    bool isLoading = false,
    double? width,
    double? height,
  }) {
    return ZButton(
      onPressed: onPressed,
      label: label,
      style: ZButtonStyle.cta,
      icon: icon,
      isLoading: isLoading,
      width: width,
      height: height,
    );
  }

  static Widget text({
    required VoidCallback? onPressed,
    required String label,
    double? width,
    double? height,
  }) {
    return ZButton(
      onPressed: onPressed,
      label: label,
      style: ZButtonStyle.text,
      width: width,
      height: height,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = ZarwintoColors.of(context).background;
    final fgColor = ZarwintoColors.of(context).foreground;
    final effectiveWidth = width ?? (isDense ? null : double.infinity);
    final effectiveHeight = height ?? (isDense ? 44.0 : 54.0);

    Widget child;
    final iconData = icon;
    if (isLoading) {
      child = Row(
        mainAxisSize: effectiveWidth == null ? MainAxisSize.min : MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: _textColor,
            ),
          ),
          const SizedBox(width: 10),
          Text(label, style: _labelStyle),
        ],
      );
    } else {
      child = Row(
        mainAxisSize: effectiveWidth == null ? MainAxisSize.min : MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (iconData != null) ...[
            HugeIcon(icon: iconData, size: 18, color: _textColor),
            const SizedBox(width: 8),
          ],
          Text(label, style: _labelStyle),
        ],
      );
    }

    switch (style) {
      case ZButtonStyle.primary:
        return _buildFilled(child, effectiveWidth, effectiveHeight);
      case ZButtonStyle.secondary:
        return _buildOutlined(child, effectiveWidth, effectiveHeight);
      case ZButtonStyle.cta:
        return _buildCta(child, effectiveWidth, effectiveHeight, isDark, bgColor, fgColor);
      case ZButtonStyle.text:
        return _buildText(context, child, effectiveWidth, effectiveHeight);
    }
  }

  Color get _textColor {
    switch (style) {
      case ZButtonStyle.primary:
      case ZButtonStyle.cta:
        return ZarwintoColors.white;
      case ZButtonStyle.secondary:
      case ZButtonStyle.text:
        return ZarwintoColors.primary;
    }
  }

  TextStyle get _labelStyle {
    return ZarwintoTypography.button.copyWith(color: _textColor);
  }

  Widget _buildFilled(Widget child, double? width, double height) {
    return FilledButton(
      onPressed: onPressed,
      style: FilledButton.styleFrom(
        backgroundColor: ZarwintoColors.primary,
        foregroundColor: ZarwintoColors.white,
        minimumSize: Size(width ?? 0, height),
        shape: const RoundedRectangleBorder(
          borderRadius: ZarwintoRadius.all16,
        ),
        padding: padding,
      ),
      child: child,
    );
  }

  Widget _buildOutlined(Widget child, double? width, double height) {
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: ZarwintoColors.primary,
        minimumSize: Size(width ?? 0, height),
        shape: const RoundedRectangleBorder(
          borderRadius: ZarwintoRadius.all16,
        ),
        side: const BorderSide(color: ZarwintoColors.primary),
        padding: padding,
      ),
      child: child,
    );
  }

  Widget _buildCta(Widget child, double? width, double height, bool isDark, Color bgColor, Color fgColor) {
    return FilledButton(
      onPressed: onPressed,
      style: FilledButton.styleFrom(
        backgroundColor: ZarwintoColors.primary,
        foregroundColor: ZarwintoColors.white,
        minimumSize: Size(width ?? 0, height),
        shape: const RoundedRectangleBorder(
          borderRadius: ZarwintoRadius.all16,
        ),
        padding: padding,
        elevation: 0,
      ),
      child: child,
    );
  }

  Widget _buildText(BuildContext context, Widget child, double? width, double height) {
    return TextButton(
      onPressed: onPressed,
      style: TextButton.styleFrom(
        minimumSize: Size(width ?? double.infinity, height),
        padding: padding,
      ),
      child: child,
    );
  }
}
