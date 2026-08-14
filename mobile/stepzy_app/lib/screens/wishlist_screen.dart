import 'dart:async';
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
  bool _loading = true;
  Timer? _retryTimer;

  @override
  void initState() {
    super.initState();
    _loadWishlist();
  }

  @override
  void dispose() {
    _retryTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadWishlist() async {
    final store = ZarwintoScope.of(context);
    
    if (store.products.isEmpty) {
      setState(() {
        _loading = true;
      });
      
      _retryTimer?.cancel();
      _retryTimer = Timer(const Duration(milliseconds: 800), () {
        if (mounted) _loadWishlist();
      });
      return;
    }
    
    _retryTimer?.cancel();
    
    setState(() {
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
    
    if (products.isEmpty && _loading) {
      return Shimmer.fromColors(
        baseColor: ZarwintoColors.border,
        highlightColor: Colors.white,
        child: GridView.builder(
          padding: const EdgeInsets.all(ZarwintoSpacing.lg),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.72,
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
        onRefresh: _loadWishlist,
        child: matched.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    HugeIcon(icon: HugeIcons.strokeRoundedFavourite, size: 64, color: ZarwintoColors.muted),
                    const SizedBox(height: ZarwintoSpacing.lg),
                    Text(
                      'No wishlist items yet',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: ZarwintoSpacing.sm),
                    Text(
                      'Tap the heart icon on products to save them here',
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
            : GridView.builder(
                padding: const EdgeInsets.all(ZarwintoSpacing.lg),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.72,
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
