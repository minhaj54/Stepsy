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
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(44),
                  child: Image.asset(
                    'assets/App icon/1024x1024.png',
                    width: 88,
                    height: 88,
                    fit: BoxFit.cover,
                  ),
                ),
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
            const Center(
              child: Text(
                'Step into the right choice',
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
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'About Us',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                  ),
                  SizedBox(height: ZarwintoSpacing.sm),
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
                  const _ContactRow(
                    icon: HugeIcon(icon: HugeIcons.strokeRoundedLocation01, color: ZarwintoColors.primary, size: 18),
                    text: 'Block - 2 Sharda Launchpad - Sharda University, Greater Noida - UP, India',
                  ),
                  const SizedBox(height: 10),
                  InkWell(
                    onTap: () => _launchEmail(),
                    child: const _ContactRow(
                      icon: HugeIcon(icon: HugeIcons.strokeRoundedMail01, color: ZarwintoColors.primary, size: 18),
                      text: 'zarwinto12@gmail.com',
                      isLink: true,
                    ),
                  ),
                  const SizedBox(height: 10),
                  InkWell(
                    onTap: () => _launchWhatsApp(),
                    child: const _ContactRow(
                      icon: HugeIcon(icon: HugeIcons.strokeRoundedBubbleChat, color: ZarwintoColors.primary, size: 18),
                      text: '+91 79823 69183 (WhatsApp)',
                      isLink: true,
                    ),
                  ),
                  const SizedBox(height: 10),
                  InkWell(
                    onTap: () => _launchWebsite(),
                    child: const _ContactRow(
                      icon: HugeIcon(icon: HugeIcons.strokeRoundedGlobe02, color: ZarwintoColors.primary, size: 18),
                      text: 'zarwinto.com',
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
                style: const TextStyle(color: ZarwintoColors.muted, fontSize: 12),
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
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Future<void> _launchWebsite() async {
    final uri = Uri.parse('https://zarwinto.com');
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

class _ContactRow extends StatelessWidget {
  const _ContactRow({required this.icon, required this.text, this.isLink = false});

  final Widget icon;
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
          child: icon,
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
