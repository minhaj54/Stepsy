import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme.dart';
import '../core/constants.dart';

class ZarwintoDrawer extends StatelessWidget {
  const ZarwintoDrawer({super.key});

  static const String _appVersion = '1.0.0';

  Future<void> _shareApp() async {
    final playStoreUrl = 'https://play.google.com/store/apps/details?id=$playStoreAppId';
    await Share.share(
      'Check out $appName - your one-stop shop for premium footwear! '
      'Download now: $playStoreUrl',
    );
  }

  Future<void> _rateApp() async {
    final appId = playStoreAppId;
    if (appId.isEmpty) {
      debugPrint('[Drawer] playStoreAppId is empty, cannot open Play Store');
      return;
    }
    
    // Try opening Play Store app directly first
    final marketUri = Uri.parse('market://details?id=$appId');
    // Fallback to web URL
    final webUri = Uri.parse('https://play.google.com/store/apps/details?id=$appId');
    
    debugPrint('[Drawer] Trying to open Play Store for app: $appId');
    
    try {
      // Try market:// scheme first (opens Play Store app directly)
      if (await canLaunchUrl(marketUri)) {
        await launchUrl(marketUri, mode: LaunchMode.externalApplication);
        debugPrint('[Drawer] Opened via market:// scheme');
        return;
      }
    } catch (e) {
      debugPrint('[Drawer] market:// scheme failed: $e');
    }
    
    try {
      // Fallback to https:// URL
      if (await canLaunchUrl(webUri)) {
        await launchUrl(webUri, mode: LaunchMode.externalApplication);
        debugPrint('[Drawer] Opened via https:// URL');
        return;
      }
    } catch (e) {
      debugPrint('[Drawer] https:// URL failed: $e');
    }
    
    // Last resort: try launching anyway
    try {
      await launchUrl(webUri, mode: LaunchMode.externalApplication);
    } catch (e) {
      debugPrint('[Drawer] All methods failed to open Play Store: $e');
    }
  }

  Future<void> _openLink(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = ZarwintoColors.of(context);
    final size = MediaQuery.of(context).size;

    return Drawer(
      width: size.width * 0.72,
      backgroundColor: colors.background,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
              child: Row(
                children: [
                  Image.asset(
                    'assets/App icon/GooglePlayStore.png',
                    width: 56,
                    height: 56,
                    fit: BoxFit.contain,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          appName,
                          style: ZarwintoTypography.h3.copyWith(
                            color: colors.foreground,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Version $_appVersion',
                          style: ZarwintoTypography.small.copyWith(
                            color: colors.secondaryText,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 24),
              height: 1,
              color: colors.border.withValues(alpha: 0.6),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: [
                  const SizedBox(height: 8),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 12),
                    height: 1,
                    color: colors.border.withValues(alpha: 0.6),
                  ),
                  const SizedBox(height: 8),
                  _DrawerTile(
                    icon: HugeIcons.strokeRoundedShare01,
                    title: 'Share App',
                    onTap: () {
                      Navigator.pop(context);
                      _shareApp();
                    },
                  ),
                  _DrawerTile(
                    icon: HugeIcons.strokeRoundedStar,
                    title: 'Rate this App',
                    onTap: () {
                      Navigator.pop(context);
                      _rateApp();
                    },
                  ),
                  _DrawerTile(
                    icon: HugeIcons.strokeRoundedInformationCircle,
                    title: 'About',
                    onTap: () {
                      Navigator.pop(context);
                      _showAboutDialog(context);
                    },
                  ),
                  _DrawerTile(
                    icon: HugeIcons.strokeRoundedLock,
                    title: 'Privacy Policy',
                    onTap: () {
                      Navigator.pop(context);
                      _openLink('https://zarwinto.com/privacy');
                    },
                  ),
                  _DrawerTile(
                    icon: HugeIcons.strokeRoundedFile01,
                    title: 'Terms & Conditions',
                    onTap: () {
                      Navigator.pop(context);
                      _openLink('https://zarwinto.com/terms');
                    },
                  ),
                  _DrawerTile(
                    icon: HugeIcons.strokeRoundedMailSend01,
                    title: 'Contact Us',
                    onTap: () {
                      Navigator.pop(context);
                      _openLink('mailto:support@zarwinto.com');
                    },
                  ),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 24),
              height: 1,
              color: colors.border.withValues(alpha: 0.6),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Text(
                '© 2026 $appName. All rights reserved.',
                style: ZarwintoTypography.small.copyWith(
                  color: colors.secondaryText,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    final colors = ZarwintoColors.of(context);
    showAboutDialog(
      context: context,
      applicationName: appName,
      applicationVersion: '1.0.0',
      applicationIcon: Image.asset(
        'assets/App icon/GooglePlayStore.png',
        width: 48,
        height: 48,
        fit: BoxFit.contain,
      ),
      children: [
        Text(
          '$appName is your ultimate destination for premium footwear. '
          'We bring you the latest trends in sneakers, casual shoes, and sports shoes '
          'from top brands, delivered right to your doorstep.',
          style: ZarwintoTypography.body.copyWith(color: colors.secondaryText),
        ),
      ],
    );
  }
}

class _DrawerTile extends StatelessWidget {
  const _DrawerTile({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  final dynamic icon;
  final String title;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = ZarwintoColors.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: [
            HugeIcon(
              icon: icon,
              color: colors.secondaryText,
              size: 20,
            ),
            const SizedBox(width: 14),
            Text(
              title,
              style: ZarwintoTypography.body.copyWith(
                color: colors.foreground,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
