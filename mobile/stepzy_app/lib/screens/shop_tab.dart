import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:shimmer/shimmer.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/product_card.dart';
import '../widgets/shop_filter_widgets.dart';
import '../core/theme.dart';
import 'search_screen.dart';


class ShopTab extends StatefulWidget {
  const ShopTab({super.key});

  @override
  State<ShopTab> createState() => _ShopTabState();
}

class _ShopTabState extends State<ShopTab> {
  final ScrollController _scrollController = ScrollController();
  String query = '';
  String category = '';
  String brand = '';
  String gender = '';
  String sort = 'newest';
  final Set<String> selectedColors = {};
  RangeValues? priceRange;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 400) {
      final store = ZarwintoScope.of(context, listen: false);
      if (store.hasMoreProducts && !store.isLoadingMore) {
        store.loadMoreProducts(
          categorySlug: category,
          brandId: brand,
          gender: gender,
        );
      }
    }
  }

  bool get _hasActiveFilters {
    final bounds = _priceBounds;
    return category.isNotEmpty ||
        brand.isNotEmpty ||
        gender.isNotEmpty ||
        selectedColors.isNotEmpty ||
        (priceRange != null && (priceRange!.start > bounds.min || priceRange!.end < bounds.max));
  }

  ({double min, double max}) get _priceBounds {
    final store = ZarwintoScope.of(context, listen: false);
    if (store.products.isEmpty) return (min: 0, max: 10000);
    final prices = store.products.map((p) => p.currentPrice);
    final min = prices.reduce((a, b) => a < b ? a : b);
    final max = prices.reduce((a, b) => a > b ? a : b);
    return (min: min.floorToDouble(), max: max.ceilToDouble());
  }

  Future<void> _handleRefresh(ZarwintoStore store) async {
    await Future.delayed(const Duration(milliseconds: 500));
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final bounds = _priceBounds;

    final filtered = store.shopProducts.where((product) {
      final matchesQuery =
          query.isEmpty ||
          product.title.toLowerCase().contains(query.toLowerCase()) ||
          product.brandName.toLowerCase().contains(query.toLowerCase());
      // Category, Brand, and Gender are now filtered server-side in store.shopProducts
      final matchesColor = selectedColors.isEmpty ||
          product.variants.any((v) => selectedColors.contains(v.color));
      
      final matchesPrice = priceRange == null || 
          (product.currentPrice >= priceRange!.start && product.currentPrice <= priceRange!.end);
          
      return matchesQuery && matchesColor && matchesPrice;
    }).toList();

    filtered.sort((a, b) {
      if (sort == 'price-low') return a.currentPrice.compareTo(b.currentPrice);
      if (sort == 'price-high') return b.currentPrice.compareTo(a.currentPrice);
      if (sort == 'rating') return b.rating.compareTo(a.rating);
      return b.createdAt.compareTo(a.createdAt);
    });

    final activeFilterCount = [
      if (category.isNotEmpty) 1,
      if (brand.isNotEmpty) 1,
      if (gender.isNotEmpty) 1,
      if (selectedColors.isNotEmpty) 1,
      if (priceRange != null) 1,
    ].length;

    return Column(
      children: [
        _buildAppBar(context, store, activeFilterCount),
        if (_hasActiveFilters) _buildActiveFilterBar(context, store),
        Expanded(
          child: RefreshIndicator(
            color: ZarwintoColors.primary,
            onRefresh: () => _handleRefresh(store),
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              child: store.loading && filtered.isEmpty
                  ? _buildShimmerGrid()
                  : filtered.isEmpty
                      ? _buildEmptyState(context, store)
                      : ListView(
                          controller: _scrollController,
                          key: ValueKey('shop-$category-$brand-$sort'),
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 120),
                          children: [
                            const SizedBox(height: 12),
                            GridView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.72,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                              ),
                              itemCount: filtered.length,
                              itemBuilder: (context, index) => _StaggeredEntry(
                                index: index,
                                child: ProductCard(filtered[index]),
                              ),
                            ),
                            if (store.isLoadingMore)
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 20),
                                child: _buildBottomShimmer(),
                              ),
                            const SizedBox(height: 24),
                          ],
                        ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAppBar(BuildContext context, ZarwintoStore store, int activeFilterCount) {
    return Container(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 8,
        left: 16,
        right: 16,
        bottom: 12,
      ),
      decoration: BoxDecoration(
        color: ZarwintoColors.surface,
        border: Border(bottom: BorderSide(color: ZarwintoColors.border)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Text(
              'Shop',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    fontSize: 26,
                    color: ZarwintoColors.foreground,
                  ),
            ),
          ),
          AppBarActionButton(
            icon: HugeIcon(
              icon: HugeIcons.strokeRoundedSearch01,
              size: 18,
              color: ZarwintoColors.foreground,
            ),
            label: 'Search',
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const SearchScreen()),
              );
            },
          ),
          const SizedBox(width: 10),
          AppBarActionButton(
            icon: HugeIcon(
              icon: HugeIcons.strokeRoundedSlidersHorizontal,
              size: 18,
              color: ZarwintoColors.foreground,
            ),
            label: 'Filter',
            badgeCount: activeFilterCount,
            onTap: () => _showFilterBottomSheet(context, store),
          ),
          const SizedBox(width: 10),
          AppBarActionButton(
            icon: HugeIcon(
              icon: HugeIcons.strokeRoundedShoppingCart01,
              size: 18,
              color: ZarwintoColors.foreground,
            ),
            label: 'Bag',
            badgeCount: store.cartCount,
            onTap: () {
              store.setActiveTab(2);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildActiveFilterBar(BuildContext context, ZarwintoStore store) {
    final chips = <Widget>[];

    if (category.isNotEmpty) {
      final match = store.categories.where((c) => c.slug == category);
      final label = match.isNotEmpty ? match.first.name : category;
      chips.add(ActiveFilterChip(
        label: label,
        onRemove: () {
          setState(() {
            category = '';
          });
          store.loadMoreProducts(reset: true);
        },
      ));
    }
    if (brand.isNotEmpty) {
      final match = store.brands.where((b) => b.id == brand);
      final label = match.isNotEmpty ? match.first.name : brand;
      chips.add(ActiveFilterChip(
        label: label,
        onRemove: () {
          setState(() {
            brand = '';
          });
          store.loadMoreProducts(categorySlug: category, reset: true);
        },
      ));
    }
    if (gender.isNotEmpty) {
      chips.add(ActiveFilterChip(
        label: gender[0].toUpperCase() + gender.substring(1),
        onRemove: () {
          setState(() {
            gender = '';
          });
          store.loadMoreProducts(categorySlug: category, brandId: brand, reset: true);
        },
      ));
    }
    for (final color in selectedColors) {
      chips.add(ActiveFilterChip(
        label: color,
        onRemove: () => setState(() {
          selectedColors.remove(color);
        }),
      ));
    }
    final bounds = _priceBounds;
    if (priceRange != null) {
      chips.add(ActiveFilterChip(
        label: '₹${priceRange!.start.toInt()} - ₹${priceRange!.end.toInt()}',
        onRemove: () => setState(() {
          priceRange = null;
        }),
      ));
    }

    return Container(
      color: ZarwintoColors.surface,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            ...chips,
            GestureDetector(
              onTap: () {
                setState(() {
                  category = '';
                  brand = '';
                  gender = '';
                  selectedColors.clear();
                  priceRange = null;
                });
                store.loadMoreProducts(reset: true);
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
                child: Text(
                  'Clear all',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: ZarwintoColors.primary,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showFilterBottomSheet(BuildContext context, ZarwintoStore store) {
    final bounds = _priceBounds;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FilterBottomSheet(
        store: store,
        initialCategory: category,
        initialBrand: brand,
        initialGender: gender,
        initialSort: sort,
        initialColors: Set<String>.from(selectedColors),
        initialPriceRange: priceRange ?? RangeValues(bounds.min, bounds.max),
        minPrice: bounds.min,
        maxPrice: bounds.max,
        onApply: (cat, brd, gen, srt, colors, range) {
          setState(() {
            category = cat;
            brand = brd;
            gender = gen;
            sort = srt;
            selectedColors
              ..clear()
              ..addAll(colors);
            
            // Only apply price range if it's different from the bounds
            if (range.start > bounds.min || range.end < bounds.max) {
              priceRange = range;
            } else {
              priceRange = null;
            }
          });
          store.loadMoreProducts(
            categorySlug: cat,
            brandId: brd,
            gender: gen,
            reset: true,
          );
        },
      ),
    );
  }

  Widget _buildBottomShimmer() {
    return Shimmer.fromColors(
      baseColor: ZarwintoColors.border,
      highlightColor: Colors.white,
      period: const Duration(milliseconds: 1200),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.72,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: 2,
        itemBuilder: (context, index) => Container(
          decoration: BoxDecoration(
            color: ZarwintoColors.border,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, ZarwintoStore store) {
    return Center(
      key: const ValueKey('empty-state'),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: ZarwintoColors.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(24),
            ),
            child: HugeIcon(
              icon: HugeIcons.strokeRoundedSearchRemove,
              size: 36,
              color: ZarwintoColors.primary,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'No products found',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: ZarwintoColors.foreground,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            _hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Check back soon — new drops are on the way',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: ZarwintoColors.muted,
            ),
          ),
          if (_hasActiveFilters) ...[
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                setState(() {
                  category = '';
                  brand = '';
                  gender = '';
                  sort = 'newest';
                  priceRange = null;
                });
                store.loadMoreProducts(reset: true);
              },
              icon: HugeIcon(
                icon: HugeIcons.strokeRoundedRefresh,
                size: 18,
                color: Colors.white,
              ),
              label: const Text('Reset Filters'),
              style: ElevatedButton.styleFrom(
                backgroundColor: ZarwintoColors.primary,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildShimmerGrid() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
      child: GridView.builder(
        key: const ValueKey('shimmer-grid'),
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.72,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: 6,
        itemBuilder: (context, index) => Shimmer.fromColors(
          baseColor: ZarwintoColors.border,
          highlightColor: Colors.white,
          period: const Duration(milliseconds: 1200),
          child: Container(
            decoration: BoxDecoration(
              color: ZarwintoColors.border,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      ),
    );
  }
}

class _StaggeredEntry extends StatefulWidget {
  const _StaggeredEntry({required this.index, required this.child});

  final int index;
  final Widget child;

  @override
  State<_StaggeredEntry> createState() => _StaggeredEntryState();
}

class _StaggeredEntryState extends State<_StaggeredEntry>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fade;
  late final Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 320),
    );
    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _slide = Tween<Offset>(
      begin: const Offset(0, 0.04),
      end: Offset.zero,
    ).animate(_fade);

    final delay = Duration(milliseconds: 25 * (widget.index % 6));
    Future.delayed(delay, () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fade,
      child: SlideTransition(position: _slide, child: widget.child),
    );
  }
}


