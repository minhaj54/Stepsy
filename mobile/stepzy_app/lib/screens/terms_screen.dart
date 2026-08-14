import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  static const _sections = [
    {
      'title': '1. Acceptance of Terms',
      'body': 'By accessing or using Zarwinto (the "Marketplace"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, please do not use the Marketplace.',
    },
    {
      'title': '2. Accounts',
      'body': 'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate information and be at least 18 years old (or have parental consent) to create an account.',
    },
    {
      'title': '3. Orders & Pricing',
      'body': 'Product listings, prices, and availability are provided by partner stores and are subject to change without notice. We strive for accuracy but are not responsible for typographical or photographic errors. An order confirmation does not guarantee acceptance; a contract is formed once the seller dispatches your item.',
    },
    {
      'title': '4. Payments & Taxes',
      'body': 'All payments are processed securely through our compliant payment partners. You authorize us to charge the total order amount, including applicable shipping and taxes. Prices displayed are inclusive of applicable taxes unless stated otherwise.',
    },
    {
      'title': '5. Marketplace & Sellers',
      'body': 'Zarwinto is a multi-vendor marketplace. Each partner store is responsible for the products they list, including authenticity, quality, and fulfillment. Zarwinto facilitates the transaction but is not the manufacturer of the goods unless explicitly stated.',
    },
    {
      'title': '6. Returns, Exchanges & Refunds',
      'body': 'Returns and exchanges are governed by our Returns & Exchanges policy. Refunds are issued to your original payment method after the returned item passes inspection. Sale and customized items may have different eligibility.',
    },
    {
      'title': '7. Intellectual Property',
      'body': 'All trademarks, logos, product imagery, and content on the Marketplace are the property of Zarwinto or its partners and are protected by law. You may not reproduce, distribute, or create derivative works without prior written permission.',
    },
    {
      'title': '8. Limitation of Liability',
      'body': 'To the maximum extent permitted by law, Zarwinto shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Marketplace. Our total liability is limited to the amount you paid for the relevant order.',
    },
    {
      'title': '9. Prohibited Conduct',
      'body': 'You agree not to misuse the Marketplace, attempt to breach its security, scrape data, infringe intellectual property, or engage in fraudulent activity. We may suspend or terminate accounts that violate these terms.',
    },
    {
      'title': '10. Changes to Terms',
      'body': 'We may revise these Terms of Service from time to time. Continued use of the Marketplace after changes are posted constitutes acceptance of the updated terms. The "last updated" date reflects the latest revision.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Terms & Conditions'),
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
                          style: TextStyle(color: ZarwintoColors.foregroundSecondary, fontSize: 13, height: 1.6),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Container(
              padding: const EdgeInsets.all(ZarwintoSpacing.lg),
              decoration: BoxDecoration(
                color: ZarwintoColors.card,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(ZarwintoRadius.lg)),
                border: Border(top: BorderSide(color: ZarwintoColors.border)),
              ),
              child: Column(
                children: [
                  const Text('Still have questions?', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  const SizedBox(height: ZarwintoSpacing.xs),
                  Text('Our support team is here to help clarify anything about your orders or account.', style: TextStyle(color: ZarwintoColors.muted, fontSize: 13)),
                  const SizedBox(height: ZarwintoSpacing.md),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _launchEmail(),
                          icon: const HugeIcon(icon: HugeIcons.strokeRoundedMail01, size: 18),
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
                          icon: const HugeIcon(icon: HugeIcons.strokeRoundedMessage01, size: 18),
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
