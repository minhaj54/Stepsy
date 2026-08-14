import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme.dart';

class HelpCenterScreen extends StatefulWidget {
  const HelpCenterScreen({super.key});

  @override
  State<HelpCenterScreen> createState() => _HelpCenterScreenState();
}

class _HelpCenterScreenState extends State<HelpCenterScreen> {
  final _query = TextEditingController();
  String _activeCategory = 'All';

  static const _faqs = [
    {
      'category': 'Orders',
      'question': 'How do I place an order?',
      'answer': 'Browse the shop, add your favorite pairs to the cart, and proceed to checkout. You can sign in with your phone number via OTP and complete payment securely. Once confirmed, your order is sent to the seller store for processing.',
    },
    {
      'category': 'Orders',
      'question': 'Can I modify or cancel my order after placing it?',
      'answer': 'Orders can be cancelled within 30 minutes of placement if they have not yet been shipped. Go to your account → Orders and select "Cancel". For modifications, please contact support as soon as possible.',
    },
    {
      'category': 'Shipping',
      'question': 'What are the shipping times and costs?',
      'answer': 'Standard shipping takes 3–7 business days across India. Orders above ₹999 ship free; otherwise a flat ₹49 fee applies. You will receive tracking details by email once your order leaves the warehouse.',
    },
    {
      'category': 'Shipping',
      'question': 'Do you ship internationally?',
      'answer': 'Currently we ship within India only. International shipping is on our roadmap — subscribe to the newsletter to be the first to know when we expand.',
    },
    {
      'category': 'Returns',
      'question': 'What is your return and exchange policy?',
      'answer': 'We offer a 7-day easy return and exchange window for unused items in original packaging. Start a return from your account or the Returns page. Refunds are processed within 5–7 business days to your original payment method.',
    },
    {
      'category': 'Returns',
      'question': 'My item arrived damaged. What should I do?',
      'answer': 'We are sorry about that! Email zarwinto12@gmail.com with photos of the damage within 48 hours of delivery, and we will arrange a free replacement or full refund.',
    },
    {
      'category': 'Sizing',
      'question': 'How do I find the right size?',
      'answer': 'Each product page lists size options (UK/US/UK). If you are between sizes, we recommend going a half size up for sneakers and a full size up for boots. Check our Size Guide for brand-specific notes.',
    },
    {
      'category': 'Payments',
      'question': 'Which payment methods do you accept?',
      'answer': 'We accept UPI, all major credit/debit cards, net banking, and popular wallets. All transactions are encrypted and processed through our secure payment gateway.',
    },
    {
      'category': 'Account',
      'question': 'How do I create an account?',
      'answer': 'Click "Account" in the header and sign up using your phone number. We will send a one-time password (OTP) to verify your number — no passwords to remember.',
    },
    {
      'category': 'Stores',
      'question': 'Can I sell my own shoes on Zarwinto?',
      'answer': 'Yes! Independent sellers and brands can open a store through our "Open Your Store" program. You get a dedicated storefront, inventory tools, and order management.',
    },
  ];

  static const _categories = ['All', 'Orders', 'Shipping', 'Returns', 'Sizing', 'Payments', 'Account', 'Stores'];

  List<Map<String, String>> get _filtered {
    final q = _query.text.trim().toLowerCase();
    return _faqs.where((f) {
      final matchesCategory = _activeCategory == 'All' || f['category'] == _activeCategory;
      final matchesQuery = q.isEmpty ||
          f['question']!.toLowerCase().contains(q) ||
          f['answer']!.toLowerCase().contains(q);
      return matchesCategory && matchesQuery;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Help Center'),
        backgroundColor: ZarwintoColors.background,
        foregroundColor: ZarwintoColors.foreground,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(ZarwintoSpacing.lg),
              child: Column(
                children: [
                  TextField(
                    controller: _query,
                    decoration: InputDecoration(
                      hintText: 'Search questions...',
                      prefixIcon: const HugeIcon(icon: HugeIcons.strokeRoundedSearch01, size: 20),
                      filled: true,
                      fillColor: ZarwintoColors.card,
                      border: OutlineInputBorder(
                        borderRadius: ZarwintoRadius.all16,
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: ZarwintoSpacing.lg, vertical: 12),
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                  const SizedBox(height: ZarwintoSpacing.md),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _categories
                          .map((cat) => Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: FilterChip(
                                  label: Text(
                                    cat,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: _activeCategory == cat
                                          ? Colors.white
                                          : ZarwintoColors.foreground,
                                      fontWeight: _activeCategory == cat
                                          ? FontWeight.w700
                                          : FontWeight.w500,
                                    ),
                                  ),
                                  selected: _activeCategory == cat,
                                  onSelected: (_) => setState(() => _activeCategory = cat),
                                  backgroundColor: ZarwintoColors.card,
                                  selectedColor: ZarwintoColors.primary,
                                  checkmarkColor: Colors.white,
                                  side: BorderSide(
                                    color: _activeCategory == cat
                                        ? ZarwintoColors.primary
                                        : ZarwintoColors.border,
                                  ),
                                ),
                              ))
                          .toList(),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: _filtered.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(ZarwintoSpacing.xxl),
                        child: Text(
                          'No questions match your search. Try a different keyword or contact support.',
                          style: TextStyle(color: ZarwintoColors.muted, fontSize: 14),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                      itemCount: _filtered.length,
                      itemBuilder: (context, index) {
                        final faq = _filtered[index];
                        return _FaqCard(faq: faq);
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
                  Text('Our support team is happy to help you with anything.', style: TextStyle(color: ZarwintoColors.muted, fontSize: 13)),
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

class _FaqCard extends StatefulWidget {
  const _FaqCard({required this.faq});

  final Map<String, String> faq;

  @override
  State<_FaqCard> createState() => _FaqCardState();
}

class _FaqCardState extends State<_FaqCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: () => setState(() => _expanded = !_expanded),
        borderRadius: ZarwintoRadius.all16,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: ZarwintoSpacing.sm, vertical: 3),
                    decoration: BoxDecoration(
                      color: ZarwintoColors.primary,
                      borderRadius: ZarwintoRadius.all20,
                    ),
                    child: Text(
                      widget.faq['category']!,
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      widget.faq['question']!,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                  ),
                  HugeIcon(
                    icon: _expanded ? HugeIcons.strokeRoundedArrowUp01 : HugeIcons.strokeRoundedArrowDown01,
                    color: ZarwintoColors.muted,
                    size: 20,
                  ),
                ],
              ),
              if (_expanded) ...[
                const SizedBox(height: 10),
                const Divider(height: 1),
                const SizedBox(height: 10),
                Text(widget.faq['answer']!, style: TextStyle(color: ZarwintoColors.foregroundSecondary, fontSize: 13, height: 1.5)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
