import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme.dart';

class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});

  static const _sections = [
    {
      'title': '1. Information We Collect',
      'body': 'We collect information you provide directly — such as your name, email, phone number, shipping address, and payment details when you create an account, place an order, or contact support. We also collect limited technical data (device type, browser, and usage analytics) automatically to improve your experience.',
    },
    {
      'title': '2. How We Use Your Information',
      'body': 'Your information is used to process and deliver orders, provide customer support, send order and account notifications, personalize your shopping experience, and improve our products and services. We do not sell your personal data to third parties.',
    },
    {
      'title': '3. Payment & Security',
      'body': 'Payments are processed by PCI-DSS compliant payment gateways. Zarwinto never stores your full card number or CVV on our servers. All sensitive data is encrypted in transit using industry-standard TLS.',
    },
    {
      'title': '4. Cookies & Tracking',
      'body': 'We use essential storage to keep you signed in and functional tokens to remember your cart and preferences. You can clear your session anytime from account settings.',
    },
    {
      'title': '5. Sharing with Sellers & Partners',
      'body': 'To fulfill your order, we share the minimum necessary details (name, address, items ordered) with the partner store and logistics partners (Shiprocket). These parties are bound to use the data solely for order fulfillment.',
    },
    {
      'title': '6. Your Rights',
      'body': 'You may request access to, correction of, or deletion of your personal data at any time from your account settings or by contacting our support team.',
    },
    {
      'title': '7. Data Retention',
      'body': 'We retain your account and order information for as long as your account is active or as needed to provide services, comply with legal obligations, and resolve disputes.',
    },
    {
      'title': '8. Changes to This Policy',
      'body': 'We may update this privacy policy from time to time. Material changes will be communicated via the app or email.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy'),
        backgroundColor: ZarwintoColors.background,
        foregroundColor: ZarwintoColors.foreground,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(ZarwintoSpacing.lg),
                itemCount: _sections.length,
                itemBuilder: (context, index) {
                  final section = _sections[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          section['title']!,
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          section['body']!,
                          style: const TextStyle(color: ZarwintoColors.foregroundSecondary, fontSize: 13, height: 1.6),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Container(
              padding: const EdgeInsets.all(ZarwintoSpacing.lg),
              decoration: const BoxDecoration(
                color: ZarwintoColors.card,
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                border: Border(top: BorderSide(color: ZarwintoColors.border)),
              ),
              child: Column(
                children: [
                  const Text('Questions about your data?', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  const SizedBox(height: ZarwintoSpacing.xs),
                  const Text('Our team is happy to help. Reach out and we\'ll get back to you promptly.', style: TextStyle(color: ZarwintoColors.muted, fontSize: 13)),
                  const SizedBox(height: ZarwintoSpacing.md),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _launchEmail(),
                          icon: HugeIcon(icon: HugeIcons.strokeRoundedMail01, size: 18, color: Colors.white),
                          label: const Text('Email Support'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ZarwintoColors.primary,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _launchWhatsApp(),
                          icon: HugeIcon(icon: HugeIcons.strokeRoundedBubbleChat, size: 18, color: Colors.white),
                          label: const Text('WhatsApp'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ZarwintoColors.whatsappGreen,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
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
