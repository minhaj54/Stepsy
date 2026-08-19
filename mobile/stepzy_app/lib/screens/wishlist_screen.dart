import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:shimmer/shimmer.dart';
import '../providers/zarwinto_store.dart';
import '../core/theme.dart';
import '../widgets/product_card.dart';
import '../widgets/common.dart';

class WishlistScreen extends StatefulWidget {
  const WishlistScreen({super.key});

  @override
  State<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends State<WishlistScreen> {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      appBar: AppBar(
        title: const Text('My Wishlist'),
        backgroundColor: ZarwintoColors.background,
        foregroundColor: ZarwintoColors.foreground,
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
      ),
      body: ListenableBuilder(
        listenable: ZarwintoScope.of(context),
        builder: (context, _) {
          return _buildBody();
        },
      ),
    );
  }

  Widget _buildBody() {
    final store = ZarwintoScope.of(context);
    final wishlistIds = store.wishlist;
    final products = store.products;

    if (products.isEmpty && store.loading) {
      return Shimmer.fromColors(
        baseColor: ZarwintoColors.border,
        highlightColor: Colors.white,
        child: GridView.builder(
          padding: const EdgeInsets.all(ZarwintoSpacing.lg),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.68,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: 4,
          itemBuilder: (context, index) => const ShimmerProductCard(),
        ),
      );
    }

    final matched = products.where((p) => wishlistIds.contains(p.id)).toList();

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: store.refresh,
        child: matched.isEmpty
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: ZarwintoColors.primary.withValues(alpha: 0.08),
                          shape: BoxShape.circle,
                        ),
                        child: HugeIcon(icon: 
                          HugeIcons.strokeRoundedHeartRemove,
                          size: 40,
                          color: ZarwintoColors.muted,
                        ),
                      ),
                      const SizedBox(height: ZarwintoSpacing.lg),
                      Text(
                        'No wishlist items yet',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: ZarwintoSpacing.sm),
                      const Text(
                        'Tap the heart icon on any shoe to save it to your personal wishlist.',
                        style: TextStyle(color: ZarwintoColors.muted, fontSize: 14),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              )
            : GridView.builder(
                padding: const EdgeInsets.all(ZarwintoSpacing.lg),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.68,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: matched.length,
                itemBuilder: (context, index) {
                  return ProductCard(matched[index]);
                },
              ),
      ),
    );
  }
}
