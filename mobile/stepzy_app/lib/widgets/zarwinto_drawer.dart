import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme.dart';
import '../core/constants.dart';

class ZarwintoDrawer extends StatelessWidget {
  const ZarwintoDrawer({super.key});

  Future<void> _rateApp() async {
    final appId = playStoreAppId;
    if (appId.isEmpty) return;

    final marketUri = Uri.parse('market://details?id=$appId');
    final webUri = Uri.parse('https://play.google.com/store/apps/details?id=$appId');

    try {
      if (await canLaunchUrl(marketUri)) {
        await launchUrl(marketUri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(webUri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      debugPrint('[Drawer] Failed to launch Play Store: $e');
      // Final attempt with web URI if market check crashed/failed
      try {
        await launchUrl(webUri, mode: LaunchMode.externalApplication);
      } catch (_) {}
    }
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              color: ZarwintoColors.primary,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        image: DecorationImage(
                          image: AssetImage('assets/App icon/GooglePlayStore.png'),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Zarwinto',
                          style: ZarwintoTypography.h3.copyWith(color: Colors.white, fontSize: 24),
                        ),
                        Text(
                          'Version 1.0.0',
                          style: ZarwintoTypography.caption.copyWith(color: Colors.white70),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          ListTile(
            leading: HugeIcon(icon: HugeIcons.strokeRoundedShare01, color: ZarwintoColors.foreground),
            title: const Text('Share App'),
            onTap: () {
              final playStoreUrl = 'https://play.google.com/store/apps/details?id=$playStoreAppId';
              Share.share('Check out Zarwinto - World of shoes! Download now: $playStoreUrl');
              Navigator.pop(context);
            },
          ),
          ListTile(
            leading: HugeIcon(icon: HugeIcons.strokeRoundedStar, color: ZarwintoColors.foreground),
            title: const Text('Rate This App'),
            onTap: () {
              Navigator.pop(context);
              _rateApp();
            },
          ),
          ListTile(
            leading: HugeIcon(icon: HugeIcons.strokeRoundedInformationCircle, color: ZarwintoColors.foreground),
            title: const Text('About'),
            onTap: () {
              Navigator.pop(context);
              showAboutDialog(
                context: context,
                applicationName: 'Zarwinto',
                applicationVersion: '1.0.0',
                children: const [
                  Text('Zarwinto - World of shoes\nPremium footwear delivered to your doorstep.'),
                ],
              );
            },
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.all(16),
            child: Text(
              '©2026 Zarwinto. All rights reserved',
              style: TextStyle(fontSize: 12, color: ZarwintoColors.muted),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}
