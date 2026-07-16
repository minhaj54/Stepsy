import 'package:flutter/material.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/common.dart';
import '../widgets/product_grid.dart';
import '../core/theme.dart';

class ShopTab extends StatefulWidget {
  const ShopTab({super.key});

  @override
  State<ShopTab> createState() => _ShopTabState();
}

class _ShopTabState extends State<ShopTab> {
  String query = '';
  String category = '';
  String sort = 'newest';

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final products = store.products.where((product) {
      final matchesQuery =
          query.isEmpty ||
          product.title.toLowerCase().contains(query.toLowerCase()) ||
          product.brandName.toLowerCase().contains(query.toLowerCase());
      final matchesCategory =
          category.isEmpty || product.categorySlug == category;
      return matchesQuery && matchesCategory;
    }).toList();

    products.sort((a, b) {
      if (sort == 'price-low') return a.currentPrice.compareTo(b.currentPrice);
      if (sort == 'price-high') return b.currentPrice.compareTo(a.currentPrice);
      if (sort == 'rating') return b.rating.compareTo(a.rating);
      return b.createdAt.compareTo(a.createdAt);
    });

    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 28),
      children: [
        const ZarwintoHeader(title: 'Catalog'),
        const SizedBox(height: 18),
        TextField(
          onChanged: (value) => setState(() => query = value),
          decoration: const InputDecoration(
            prefixIcon: Icon(Icons.search),
            hintText: 'Search sneakers, boots, brands...',
          ),
        ),
        const SizedBox(height: 14),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              FilterChip(
                label: const Text('All'),
                selected: category.isEmpty,
                onSelected: (_) => setState(() => category = ''),
              ),
              const SizedBox(width: 8),
              ...store.categories.map(
                (item) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(item.name),
                    selected: category == item.slug,
                    onSelected: (_) => setState(() => category = item.slug),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Text('${products.length} products', style: mutedStyle),
            const Spacer(),
            DropdownButton<String>(
              value: sort,
              underline: const SizedBox.shrink(),
              items: const [
                DropdownMenuItem(value: 'newest', child: Text('Newest')),
                DropdownMenuItem(value: 'price-low', child: Text('Price low')),
                DropdownMenuItem(
                  value: 'price-high',
                  child: Text('Price high'),
                ),
                DropdownMenuItem(value: 'rating', child: Text('Rating')),
              ],
              onChanged: (value) => setState(() => sort = value ?? 'newest'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (store.loading) const Center(child: CircularProgressIndicator()),
        if (!store.loading && products.isEmpty)
          const EmptyState('No products found.'),
        if (products.isNotEmpty) ProductGrid(products: products),
      ],
    );
  }
}
