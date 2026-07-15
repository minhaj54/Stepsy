import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme.dart';
import '../models/product.dart';
import '../models/product_variant.dart';
import '../providers/whishkhu_store.dart';
import '../widgets/common.dart';

class ProductDetailPage extends StatefulWidget {
  const ProductDetailPage({super.key, required this.product});

  final Product product;

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  ProductVariant? selected;
  bool _showSizeChart = false;

  // Standard shoe size chart (US to EU/UK/CM)
  static const List<Map<String, String>> _sizeChart = [
    {'us': '6', 'uk': '5.5', 'eu': '38.5', 'cm': '24.1'},
    {'us': '6.5', 'uk': '6', 'eu': '39', 'cm': '24.6'},
    {'us': '7', 'uk': '6.5', 'eu': '40', 'cm': '25.1'},
    {'us': '7.5', 'uk': '7', 'eu': '40.5', 'cm': '25.6'},
    {'us': '8', 'uk': '7.5', 'eu': '41', 'cm': '26.0'},
    {'us': '8.5', 'uk': '8', 'eu': '42', 'cm': '26.5'},
    {'us': '9', 'uk': '8.5', 'eu': '42.5', 'cm': '27.0'},
    {'us': '9.5', 'uk': '9', 'eu': '43', 'cm': '27.5'},
    {'us': '10', 'uk': '9.5', 'eu': '44', 'cm': '28.0'},
    {'us': '10.5', 'uk': '10', 'eu': '44.5', 'cm': '28.5'},
    {'us': '11', 'uk': '10.5', 'eu': '45', 'cm': '29.0'},
    {'us': '11.5', 'uk': '11', 'eu': '45.5', 'cm': '29.5'},
    {'us': '12', 'uk': '11.5', 'eu': '46', 'cm': '30.0'},
  ];

  @override
  void initState() {
    super.initState();
    selected = widget.product.variants
        .where((variant) => variant.stockQuantity > 0)
        .firstOrNull;
  }

  Future<void> _shareProduct() async {
    final product = widget.product;
    final url = 'https://whishkhu.com/product/${product.slug}';
    await Share.share(
      'Check out ${product.title} by ${product.brandName} - ₹${product.currentPrice.toStringAsFixed(0)}\n\n$url',
      subject: product.title,
    );
  }

  Future<void> _openWhatsApp() async {
    final product = widget.product;
    final message = Uri.encodeComponent(
      'Hi! I\'m interested in ${product.title} by ${product.brandName}.\n\nPrice: ₹${product.currentPrice.toStringAsFixed(0)}\n\nProduct Link: https://whishkhu.com/product/${product.slug}',
    );
    final uri = Uri.parse('https://wa.me/?text=$message');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _buyNow() {
    if (selected == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a size first.')),
      );
      return;
    }
    final store = WhishkhuScope.of(context);
    store.addToCart(widget.product, selected!);
    // Navigate to cart tab (index 1 in the shell)
    // The shell uses a bottom nav, so we need to find the cart tab
    // We'll use a callback approach or navigate via context
    // For now, show a snackbar and let user navigate
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Added to cart! Go to Bag to checkout.'),
          action: SnackBarAction(
            label: 'VIEW BAG',
            onPressed: () {
              // Navigate to cart - we need to access the shell's navigation
              // This is a limitation of the current architecture
              // We'll show a dialog instead
              _showCartDialog();
            },
          ),
        ),
      );
    }
  }

  void _showCartDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: WhishkhuColors.card,
        title: const Text('Proceed to Checkout?', style: titleStyle),
        content: const Text('Your item has been added to the bag. Would you like to checkout now?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('CONTINUE SHOPPING'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to cart tab
              // We need to find the shell and switch to cart tab
              // For now, we'll just show a message
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Please go to the Bag tab to checkout.')),
              );
            },
            child: const Text('CHECKOUT'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = WhishkhuScope.of(context);
    final product = widget.product;
    final money = NumberFormat.simpleCurrency();

    return Scaffold(
      appBar: AppBar(title: Text(product.brandName)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 8, 18, 28),
        children: [
          // Product Image with Zoom
          GestureDetector(
            onDoubleTap: () {
              // Could implement zoom on double tap
            },
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: AspectRatio(
                aspectRatio: 1,
                child: InteractiveViewer(
                  minScale: 1.0,
                  maxScale: 3.0,
                  child: WhishkhuRemoteImage(
                    url: product.images.isNotEmpty ? product.images.first : '',
                    seed: 'prod_detail_${product.id}',
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 18),
          Text(
            product.title,
            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.star, color: WhishkhuColors.accent, size: 18),
              Text(
                ' ${product.rating} (${product.reviewsCount} reviews)',
                style: mutedStyle,
              ),
              const Spacer(),
              Text(
                money.format(product.currentPrice),
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          // Description with better formatting
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: product.description
                .split('\n')
                .where((line) => line.trim().isNotEmpty)
                .map((line) {
                  final trimmed = line.trim();
                  if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                    return Padding(
                      padding: const EdgeInsets.only(left: 12, bottom: 6),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('• ', style: TextStyle(color: WhishkhuColors.primary, fontWeight: FontWeight.w900)),
                          Expanded(child: Text(trimmed.substring(1).trim(), style: mutedStyle.copyWith(height: 1.5))),
                        ],
                      ),
                    );
                  }
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Text(trimmed, style: mutedStyle.copyWith(height: 1.5)),
                  );
                })
                .toList(),
          ),
          const SizedBox(height: 22),
          // Size Chart Button
          OutlinedButton.icon(
            onPressed: () => setState(() => _showSizeChart = true),
            icon: const Icon(Icons.straighten, size: 18),
            label: const Text('View Size Chart'),
            style: OutlinedButton.styleFrom(
              foregroundColor: WhishkhuColors.primary,
              side: const BorderSide(color: WhishkhuColors.primary),
            ),
          ),
          const SizedBox(height: 22),
          Text('Select size and color', style: titleStyle),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: product.variants.map((variant) {
              final available = variant.stockQuantity > 0;
              return ChoiceChip(
                selected: selected?.id == variant.id,
                onSelected: available
                    ? (_) => setState(() => selected = variant)
                    : null,
                label: Text('${variant.size} - ${variant.color}'),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          // Action Buttons Row
          Row(
            children: [
              // Share Button
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _shareProduct,
                  icon: const Icon(Icons.share, size: 18),
                  label: const Text('Share'),
                ),
              ),
              const SizedBox(width: 12),
              // WhatsApp Button
              Expanded(
                child: FilledButton.icon(
                  onPressed: _openWhatsApp,
                  icon: const Icon(Icons.chat, size: 18),
                  label: const Text('WhatsApp'),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Add to Cart and Buy Now
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: selected == null
                      ? null
                      : () {
                          store.addToCart(product, selected!);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Added to cart.')),
                          );
                        },
                  icon: const Icon(Icons.shopping_bag_outlined),
                  label: const Text('Add to Cart'),
                ),
              ),
              const SizedBox(width: 12),
              // Buy Now Button
              Expanded(
                child: FilledButton.icon(
                  onPressed: _buyNow,
                  icon: const Icon(Icons.flash_on, size: 18),
                  label: const Text('Buy Now'),
                  style: FilledButton.styleFrom(
                    backgroundColor: WhishkhuColors.accent,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      // Size Chart Bottom Sheet
      bottomSheet: _showSizeChart
          ? Container(
              height: MediaQuery.of(context).size.height * 0.7,
              decoration: const BoxDecoration(
                color: WhishkhuColors.card,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  // Handle bar
                  Container(
                    margin: const EdgeInsets.only(top: 12),
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: WhishkhuColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  // Header
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: WhishkhuColors.primary.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.straighten, color: WhishkhuColors.primary, size: 20),
                        ),
                        const SizedBox(width: 12),
                        const Text('Size Chart', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                        const Spacer(),
                        IconButton(
                          onPressed: () => setState(() => _showSizeChart = false),
                          icon: const Icon(Icons.close),
                        ),
                      ],
                    ),
                  ),
                  // Size table
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Column(
                        children: [
                          const Text(
                            'All measurements are in centimeters (CM). Please refer to this chart when selecting your size.',
                            style: TextStyle(color: WhishkhuColors.muted, fontSize: 12),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          Table(
                            border: TableBorder(
                              horizontalInside: BorderSide(color: WhishkhuColors.border, width: 0.5),
                              verticalInside: BorderSide(color: WhishkhuColors.border, width: 0.5),
                            ),
                            children: [
                              // Header row
                              TableRow(
                                decoration: BoxDecoration(color: WhishkhuColors.panel),
                                children: const [
                                  Padding(
                                    padding: EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                                    child: Text('US', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: WhishkhuColors.muted)),
                                  ),
                                  Padding(
                                    padding: EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                                    child: Text('UK', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: WhishkhuColors.muted)),
                                  ),
                                  Padding(
                                    padding: EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                                    child: Text('EU', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: WhishkhuColors.muted)),
                                  ),
                                  Padding(
                                    padding: EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                                    child: Text('CM', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: WhishkhuColors.muted)),
                                  ),
                                ],
                              ),
                              // Data rows
                              for (final row in _sizeChart)
                                TableRow(
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                                      child: Text(row['us']!, style: const TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                                      child: Text(row['uk']!, style: mutedStyle),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                                      child: Text(row['eu']!, style: mutedStyle),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                                      child: Text(row['cm']!, style: mutedStyle),
                                    ),
                                  ],
                                ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: WhishkhuColors.primary.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: WhishkhuColors.primary.withValues(alpha: 0.2)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.lightbulb_outline, color: WhishkhuColors.primary, size: 20),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    'Tip: If you\'re between sizes, we recommend going up half a size for a more comfortable fit.',
                                    style: mutedStyle.copyWith(fontSize: 12),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            )
          : null,
    );
  }
}
