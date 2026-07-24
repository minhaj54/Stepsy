import 'package:flutter/material.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/product_card.dart';
import '../core/theme.dart';
import 'search_screen.dart';

class ShopTab extends StatefulWidget {
  const ShopTab({super.key});

  @override
  State<ShopTab> createState() => _ShopTabState();
}

class _ShopTabState extends State<ShopTab> {
  String query = '';
  String category = '';
  String brand = '';
  String sort = 'newest';
  bool showFilters = false;

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
      final matchesBrand =
          brand.isEmpty || product.brandId == brand;
      return matchesQuery && matchesCategory && matchesBrand;
    }).toList();

    products.sort((a, b) {
      if (sort == 'price-low') return a.currentPrice.compareTo(b.currentPrice);
      if (sort == 'price-high') return b.currentPrice.compareTo(a.currentPrice);
      if (sort == 'rating') return b.rating.compareTo(a.rating);
      return b.createdAt.compareTo(a.createdAt);
    });

    return Column(
      children: [
        // Search and Filter Bar
        Container(
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 12),
          decoration: BoxDecoration(
            color: ZarwintoColors.surface,
            border: Border(bottom: BorderSide(color: ZarwintoColors.border)),
          ),
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const SearchScreen()),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: ZarwintoColors.background,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: ZarwintoColors.border),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.search, color: ZarwintoColors.muted, size: 18),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            query.isEmpty ? 'Search products...' : query,
                            style: TextStyle(
                              color: query.isEmpty ? ZarwintoColors.muted : ZarwintoColors.foreground,
                              fontSize: 14,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Container(
                decoration: BoxDecoration(
                  color: showFilters ? ZarwintoColors.primary.withValues(alpha: 0.1) : ZarwintoColors.background,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: showFilters ? ZarwintoColors.primary : ZarwintoColors.border),
                ),
                child: IconButton(
                  onPressed: () => setState(() => showFilters = !showFilters),
                  icon: Icon(
                    Icons.tune_rounded,
                    color: showFilters ? ZarwintoColors.primary : ZarwintoColors.foreground,
                  ),
                ),
              ),
            ],
          ),
        ),
        
        // Filters Panel
        if (showFilters)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ZarwintoColors.surface,
              border: Border(bottom: BorderSide(color: ZarwintoColors.border)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category Filter
                Text('Category', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: ZarwintoColors.foregroundSecondary)),
                const SizedBox(height: 8),
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
                const SizedBox(height: 12),
                
                // Brand Filter
                Text('Brand', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: ZarwintoColors.foregroundSecondary)),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      FilterChip(
                        label: const Text('All'),
                        selected: brand.isEmpty,
                        onSelected: (_) => setState(() => brand = ''),
                      ),
                      const SizedBox(width: 8),
                      ...store.brands.map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: FilterChip(
                            label: Text(item.name),
                            selected: brand == item.id,
                            onSelected: (_) => setState(() => brand = item.id),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                
                // Sort
                Row(
                  children: [
                    Text('Sort by:', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: ZarwintoColors.foregroundSecondary)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: DropdownButton<String>(
                        value: sort,
                        isExpanded: true,
                        underline: const SizedBox.shrink(),
                        items: const [
                          DropdownMenuItem(value: 'newest', child: Text('Newest')),
                          DropdownMenuItem(value: 'price-low', child: Text('Price: Low to High')),
                          DropdownMenuItem(value: 'price-high', child: Text('Price: High to Low')),
                          DropdownMenuItem(value: 'rating', child: Text('Highest Rated')),
                        ],
                        onChanged: (value) => setState(() => sort = value ?? 'newest'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        
        // Results
        Expanded(
          child: products.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.search_off_rounded, size: 48, color: ZarwintoColors.muted),
                      const SizedBox(height: 16),
                      Text(
                        'No products found',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ],
                  ),
                )
              : GridView.builder(
                  padding: const EdgeInsets.all(12),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.65,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemCount: products.length,
                  itemBuilder: (context, index) => ProductCard(products[index]),
                ),
        ),
      ],
    );
  }
}
