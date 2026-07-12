import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/theme.dart';
import '../models/product.dart';
import '../models/product_variant.dart';
import '../providers/stepzy_store.dart';
import '../widgets/common.dart';

class ProductDetailPage extends StatefulWidget {
  const ProductDetailPage({super.key, required this.product});

  final Product product;

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  ProductVariant? selected;

  @override
  void initState() {
    super.initState();
    selected = widget.product.variants
        .where((variant) => variant.stockQuantity > 0)
        .firstOrNull;
  }

  @override
  Widget build(BuildContext context) {
    final store = StepzyScope.of(context);
    final product = widget.product;
    final money = NumberFormat.simpleCurrency();

    return Scaffold(
      appBar: AppBar(title: Text(product.brandName)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 8, 18, 28),
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: AspectRatio(
              aspectRatio: 1,
              child: StepzyRemoteImage(
                url: product.images.isNotEmpty ? product.images.first : '',
                seed: 'prod_detail_${product.id}',
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
              const Icon(Icons.star, color: StepzyColors.accent, size: 18),
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
          Text(product.description, style: mutedStyle.copyWith(height: 1.5)),
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
          FilledButton.icon(
            onPressed: selected == null
                ? null
                : () {
                    store.addToCart(product, selected!);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Added to cart.')),
                    );
                  },
            icon: const Icon(Icons.shopping_bag_outlined),
            label: const Text('Add to cart'),
          ),
        ],
      ),
    );
  }
}
