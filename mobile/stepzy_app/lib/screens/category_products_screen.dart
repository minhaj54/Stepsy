import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/product_card.dart';

class CategoryProductsScreen extends StatefulWidget {
  const CategoryProductsScreen({super.key, required this.categoryName, required this.categorySlug});

  final String categoryName;
  final String categorySlug;

  @override
  State<CategoryProductsScreen> createState() => _CategoryProductsScreenState();
}

class _CategoryProductsScreenState extends State<CategoryProductsScreen> {
  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final products = store.products.where((p) => p.categorySlug == widget.categorySlug).toList();

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      appBar: AppBar(
        title: Text(widget.categoryName),
      ),
      body: products.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  HugeIcon(icon: HugeIcons.strokeRoundedSearchRemove, size: 48, color: ZarwintoColors.muted),
                  const SizedBox(height: 16),
                  Text(
                    'No products found in this category',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ],
              ),
            )
          : GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.65,
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
              ),
              itemCount: products.length,
              itemBuilder: (context, index) => ProductCard(products[index]),
            ),
    );
  }
}
