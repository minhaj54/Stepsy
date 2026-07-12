import 'package:flutter/material.dart';
import '../providers/stepzy_store.dart';
import '../widgets/common.dart';
import '../widgets/hero_panel.dart';
import '../widgets/benefit_strip.dart';
import '../widgets/category_tile.dart';
import '../widgets/product_grid.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    final store = StepzyScope.of(context);

    return RefreshIndicator(
      onRefresh: store.refresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(18, 12, 18, 28),
        children: [
          const StepzyHeader(),
          const SizedBox(height: 20),
          const HeroPanel(),
          const SizedBox(height: 24),
          const BenefitStrip(),
          const SizedBox(height: 26),
          SectionHeader(
            title: 'Shop by Category',
            subtitle: 'Specialized shoes for every scenario',
            trailing: Text('${store.categories.length} types'),
          ),
          const SizedBox(height: 14),
          SizedBox(
            height: 142,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: store.categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) =>
                  CategoryTile(store.categories[index]),
            ),
          ),
          const SizedBox(height: 26),
          const SectionHeader(
            title: 'Featured Footwear',
            subtitle: 'Curated Stepzy selections',
          ),
          const SizedBox(height: 14),
          ProductGrid(products: store.featuredProducts()),
        ],
      ),
    );
  }
}
