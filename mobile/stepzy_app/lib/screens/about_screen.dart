import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('About Zarwinto'),
        backgroundColor: ZarwintoColors.background,
        foregroundColor: ZarwintoColors.foreground,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(ZarwintoSpacing.lg),
          children: [
            Center(
              child: Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: ZarwintoColors.primary.withValues(alpha: 0.1),
                  borderRadius: ZarwintoRadius.all20,
                  border: Border.all(color: ZarwintoColors.primary.withValues(alpha: 0.25)),
                ),
                child: const HugeIcon(icon: HugeIcons.strokeRoundedFlash, size: 48, color: ZarwintoColors.accent),
              ),
            ),
            const SizedBox(height: ZarwintoSpacing.lg),
            Center(
              child: Text(
                'Zarwinto',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w900,
                      color: ZarwintoColors.foreground,
                    ),
              ),
            ),
            const SizedBox(height: ZarwintoSpacing.md),
            Center(
              child: Text(
                'World of shoes',
                style: TextStyle(color: ZarwintoColors.muted, fontSize: 14),
              ),
            ),
            const SizedBox(height: ZarwintoSpacing.xxl),
            Container(
              padding: const EdgeInsets.all(ZarwintoSpacing.lg),
              decoration: BoxDecoration(
                color: ZarwintoColors.card,
                borderRadius: ZarwintoRadius.all16,
                border: Border.all(color: ZarwintoColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'About Us',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                  ),
                  const SizedBox(height: ZarwintoSpacing.sm),
                  Text(
                    'Zarwinto is a state-of-the-art premium footwear marketplace offering elite performance shoes, luxury craft sneakers, and all-weather boots.',
                    style: TextStyle(color: ZarwintoColors.foregroundSecondary, fontSize: 13, height: 1.5),
                  ),
                ],
              ),
            ),
            const SizedBox(height: ZarwintoSpacing.lg),
            Container(
              padding: const EdgeInsets.all(ZarwintoSpacing.lg),
              decoration: BoxDecoration(
                color: ZarwintoColors.card,
                borderRadius: ZarwintoRadius.all16,
                border: Border.all(color: ZarwintoColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Contact Us',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                  ),
                  const SizedBox(height: ZarwintoSpacing.md),
                  _ContactRow(
                    icon: HugeIcons.strokeRoundedLocation01,
                    text: 'Block - 2 Sharda Launchpad - Sharda University, Greater Noida - UP, India',
                  ),
                  const SizedBox(height: 10),
                  InkWell(
                    onTap: () => _launchEmail(),
                    child: _ContactRow(
                      icon: HugeIcons.strokeRoundedMail01,
                      text: 'zarwinto12@gmail.com',
                      isLink: true,
                    ),
                  ),
                  const SizedBox(height: 10),
                  InkWell(
                    onTap: () => _launchWhatsApp(),
                    child: _ContactRow(
                      icon: HugeIcons.strokeRoundedMessage01,
                      text: '+91 79823 69183 (WhatsApp)',
                      isLink: true,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: ZarwintoSpacing.xxl),
            Center(
              child: Text(
                '© ${DateTime.now().year} Zarwinto Inc. All rights reserved.',
                style: TextStyle(color: ZarwintoColors.muted, fontSize: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _launchEmail() async {
    final uri = Uri.parse('mailto:zarwinto12@gmail.com');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  Future<void> _launchWhatsApp() async {
    final uri = Uri.parse('https://wa.me/917982369183');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }
}

class _ContactRow extends StatelessWidget {
  const _ContactRow({required this.icon, required this.text, this.isLink = false});

  final List<List<dynamic>> icon;
  final String text;
  final bool isLink;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: ZarwintoColors.primary.withValues(alpha: 0.08),
            borderRadius: ZarwintoRadius.all8,
          ),
          child: HugeIcon(icon: icon, size: 18, color: ZarwintoColors.primary),
        ),
        const SizedBox(width: ZarwintoSpacing.md),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              color: isLink ? ZarwintoColors.primary : ZarwintoColors.foregroundSecondary,
              fontSize: 13,
              decoration: isLink ? TextDecoration.underline : null,
            ),
          ),
        ),
      ],
    );
  }
}
