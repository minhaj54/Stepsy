import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:shimmer/shimmer.dart';
import '../core/theme.dart';
import '../models/product.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/product_card.dart';
import '../widgets/shop_filter_widgets.dart';

class CategoryProductsScreen extends StatefulWidget {
  const CategoryProductsScreen({super.key, required this.categoryName, required this.categorySlug});

  final String categoryName;
  final String categorySlug;

  @override
  State<CategoryProductsScreen> createState() => _CategoryProductsScreenState();
}

class _CategoryProductsScreenState extends State<CategoryProductsScreen> {
  final ScrollController _scrollController = ScrollController();
  List<Product> _products = [];
  bool _loading = true;
  bool _loadingMore = false;
  bool _hasMore = true;
  final int _limit = 8;

  // Filter state
  String brand = '';
  String gender = '';
  String sort = 'newest';
  final Set<String> selectedColors = {};
  RangeValues? priceRange;

  @override
  void initState() {
    super.initState();
    _fetchProducts();
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
      if (_hasMore && !_loadingMore && !_loading) {
        _fetchMoreProducts();
      }
    }
  }

  Future<void> _fetchProducts() async {
    final store = ZarwintoScope.of(context, listen: false);
    final results = await store.getProductsByCategory(widget.categorySlug, offset: 0, limit: _limit);
    if (mounted) {
      setState(() {
        _products = results;
        _loading = false;
        _hasMore = results.length >= _limit;
      });
    }
  }

  Future<void> _fetchMoreProducts() async {
    setState(() => _loadingMore = true);
    final store = ZarwintoScope.of(context, listen: false);
    final results = await store.getProductsByCategory(widget.categorySlug, offset: _products.length, limit: _limit);
    if (mounted) {
      setState(() {
        _products.addAll(results);
        _loadingMore = false;
        _hasMore = results.length >= _limit;
      });
    }
  }

  ({double min, double max}) get _priceBounds {
    final store = ZarwintoScope.of(context, listen: false);
    if (store.products.isEmpty) return (min: 0, max: 10000);
    final prices = store.products.map((p) => p.currentPrice);
    final min = prices.reduce((a, b) => a < b ? a : b);
    final max = prices.reduce((a, b) => a > b ? a : b);
    return (min: min.floorToDouble(), max: max.ceilToDouble());
  }

  bool get _hasActiveFilters {
    final bounds = _priceBounds;
    return brand.isNotEmpty ||
        gender.isNotEmpty ||
        selectedColors.isNotEmpty ||
        (priceRange != null && (priceRange!.start > bounds.min || priceRange!.end < bounds.max));
  }

  void _showFilterBottomSheet() {
    final store = ZarwintoScope.of(context, listen: false);
    final bounds = _priceBounds;
    final currentRange = priceRange ?? RangeValues(bounds.min, bounds.max);
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FilterBottomSheet(
        store: store,
        initialCategory: widget.categorySlug,
        initialBrand: brand,
        initialGender: gender,
        initialSort: sort,
        initialColors: Set<String>.from(selectedColors),
        initialPriceRange: currentRange,
        minPrice: bounds.min,
        maxPrice: bounds.max,
        hideCategoryFilter: true,
        onApply: (cat, brd, gen, srt, colors, range) {
          setState(() {
            brand = brd;
            gender = gen;
            sort = srt;
            selectedColors
              ..clear()
              ..addAll(colors);
            
            if (range.start > bounds.min || range.end < bounds.max) {
              priceRange = range;
            } else {
              priceRange = null;
            }
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final bounds = _priceBounds;
    final currentRange = priceRange ?? RangeValues(bounds.min, bounds.max);

    final filtered = _products.where((product) {
      final matchesBrand = brand.isEmpty || product.brandId == brand;
      final matchesGender = gender.isEmpty || product.gender == gender;
      final matchesColor = selectedColors.isEmpty ||
          product.variants.any((v) => selectedColors.contains(v.color));
      
      final matchesPrice = priceRange == null || 
          (product.currentPrice >= priceRange!.start && product.currentPrice <= priceRange!.end);
          
      return matchesBrand && matchesGender && matchesColor && matchesPrice;
    }).toList();

    filtered.sort((a, b) {
      if (sort == 'price-low') return a.currentPrice.compareTo(b.currentPrice);
      if (sort == 'price-high') return b.currentPrice.compareTo(a.currentPrice);
      if (sort == 'rating') return b.rating.compareTo(a.rating);
      return b.createdAt.compareTo(a.createdAt);
    });

    final activeFilterCount = [
      if (brand.isNotEmpty) 1,
      if (gender.isNotEmpty) 1,
      if (selectedColors.isNotEmpty) 1,
      if (priceRange != null) 1,
    ].length;

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      appBar: AppBar(
        title: Text(widget.categoryName),
        actions: [
          AppBarActionButton(
            icon: HugeIcon(
              icon: HugeIcons.strokeRoundedSlidersHorizontal,
              size: 18,
              color: ZarwintoColors.foreground,
            ),
            label: 'Filter',
            badgeCount: activeFilterCount,
            onTap: _showFilterBottomSheet,
          ),
          const SizedBox(width: 8),
          AppBarActionButton(
            icon: HugeIcon(
              icon: HugeIcons.strokeRoundedShoppingCart01,
              size: 18,
              color: ZarwintoColors.foreground,
            ),
            label: 'Bag',
            badgeCount: store.cartCount,
            onTap: () {
              Navigator.pop(context);
              store.setActiveTab(2);
            },
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Column(
        children: [
          if (_hasActiveFilters) _buildActiveFilterBar(bounds),
          Expanded(
            child: _loading
                ? _buildShimmerGrid()
                : filtered.isEmpty
                    ? _buildEmptyState()
                    : ListView(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        children: [
                          GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 0.65,
                              crossAxisSpacing: 14,
                              mainAxisSpacing: 14,
                            ),
                            itemCount: filtered.length,
                            itemBuilder: (context, index) => ProductCard(filtered[index]),
                          ),
                          if (_loadingMore)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 20),
                              child: _buildBottomShimmer(),
                            ),
                          const SizedBox(height: 100),
                        ],
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveFilterBar(({double min, double max}) bounds) {
    final chips = <Widget>[];
    final currentRange = priceRange ?? RangeValues(bounds.min, bounds.max);

    if (brand.isNotEmpty) {
      final store = ZarwintoScope.of(context, listen: false);
      final match = store.brands.where((b) => b.id == brand);
      final label = match.isNotEmpty ? match.first.name : brand;
      chips.add(ActiveFilterChip(
        label: label,
        onRemove: () => setState(() => brand = ''),
      ));
    }
    if (gender.isNotEmpty) {
      chips.add(ActiveFilterChip(
        label: gender[0].toUpperCase() + gender.substring(1),
        onRemove: () => setState(() => gender = ''),
      ));
    }
    for (final color in selectedColors) {
      chips.add(ActiveFilterChip(
        label: color,
        onRemove: () => setState(() => selectedColors.remove(color)),
      ));
    }
    if (priceRange != null) {
      chips.add(ActiveFilterChip(
        label: '₹${priceRange!.start.toInt()} - ₹${priceRange!.end.toInt()}',
        onRemove: () => setState(() => priceRange = null),
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
              onTap: () => setState(() {
                brand = '';
                gender = '';
                selectedColors.clear();
                priceRange = null;
              }),
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 4, horizontal: 4),
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

  Widget _buildEmptyState() {
    return Center(
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
    );
  }

  Widget _buildShimmerGrid() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.65,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
      ),
      itemCount: 6,
      itemBuilder: (context, index) => Shimmer.fromColors(
        baseColor: ZarwintoColors.border,
        highlightColor: Colors.white,
        child: Container(
          decoration: BoxDecoration(
            color: ZarwintoColors.border,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }

  Widget _buildBottomShimmer() {
    return Shimmer.fromColors(
      baseColor: ZarwintoColors.border,
      highlightColor: Colors.white,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: List.generate(2, (i) => Container(
          width: (MediaQuery.of(context).size.width - 46) / 2,
          height: 250,
          decoration: BoxDecoration(
            color: ZarwintoColors.border,
            borderRadius: BorderRadius.circular(16),
          ),
        )),
      ),
    );
  }
}
